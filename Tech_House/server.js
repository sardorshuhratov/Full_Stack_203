const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
require('dotenv').config();
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// Configure mail transporter if SMTP env vars are present
let transporter = null;
if (process.env.SMTP_SERVICE === 'gmail' || (process.env.SMTP_HOST && process.env.SMTP_USER)) {
  const mailConfig = {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  if (process.env.SMTP_SERVICE === 'gmail') {
    mailConfig.service = 'gmail';
  } else {
    mailConfig.host = process.env.SMTP_HOST;
    mailConfig.port = parseInt(process.env.SMTP_PORT || '587', 10);
    mailConfig.secure = (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1');
  }

  transporter = nodemailer.createTransport(mailConfig);
  console.log('Email transporter configured via', process.env.SMTP_SERVICE || 'SMTP host');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from this directory (Tech_House)
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'techhouse.db');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Initialize SQLite DB and tables
const db = new sqlite3.Database(DB_FILE);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    title TEXT,
    price REAL,
    category TEXT,
    description TEXT,
    img TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_address TEXT,
    total REAL,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    order_id TEXT,
    product_id INTEGER,
    title TEXT,
    price REAL,
    qty INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    salt TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS password_resets (
    email TEXT,
    token TEXT,
    expires_at INTEGER
  )`);

  // If products table empty, seed from products.json
  db.get('SELECT COUNT(*) as cnt FROM products', (err, row) => {
    if (err) return console.error('count products err', err);
    if (row && row.cnt === 0) {
      try {
        const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const data = JSON.parse(raw);
        const stmt = db.prepare('INSERT INTO products (id,title,price,category,description,img) VALUES (?,?,?,?,?,?)');
        data.forEach(p => {
          stmt.run(p.id, p.title, p.price, p.category, p.desc || p.description || '', p.img || '');
        });
        stmt.finalize();
        console.log('Seeded products table from products.json');
      } catch (e) {
        console.error('Failed to seed products from file', e);
      }
    }
  });
});

// Helper to run SQL and return Promise
const dbAll = (sql, params=[]) => new Promise((res, rej) => db.all(sql, params, (e, rows) => e ? rej(e) : res(rows)));
const dbGet = (sql, params=[]) => new Promise((res, rej) => db.get(sql, params, (e, row) => e ? rej(e) : res(row)));
const dbRun = (sql, params=[]) => new Promise((res, rej) => db.run(sql, params, function(e) { if (e) rej(e); else res(this); }));

// GET products
app.get('/api/products', async (req, res) => {
  try {
    const rows = await dbAll('SELECT id,title,price,category,description as desc,img FROM products ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed' });
  }
});

// POST webhook to upsert product
app.post('/webhook/product', async (req, res) => {
  if (WEBHOOK_SECRET) {
    const secret = req.headers['x-webhook-secret'] || req.query.secret;
    if (!secret || secret !== WEBHOOK_SECRET) return res.status(401).send('invalid secret');
  }
  const p = req.body;
  if (!p || !p.id) return res.status(400).send('invalid payload');
  try {
    const existing = await dbGet('SELECT id FROM products WHERE id = ?', [p.id]);
    if (existing) {
      await dbRun('UPDATE products SET title=?, price=?, category=?, description=?, img=? WHERE id=?', [p.title, p.price, p.category, p.desc || p.description || '', p.img || '', p.id]);
    } else {
      await dbRun('INSERT INTO products (id,title,price,category,description,img) VALUES (?,?,?,?,?,?)', [p.id, p.title, p.price, p.category, p.desc || p.description || '', p.img || '']);
    }
    console.log('Webhook applied for product id=', p.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  const body = req.body;
  if (!body || !body.id || !body.customer || !body.items) return res.status(400).json({ error: 'invalid order' });
  const order = body;
  try {
    console.log(`Received order ${order.id} from ${order.customer.name} (${order.customer.email}) - items: ${order.items.length}, total: ${order.total}`);
    
    // 1. Security: Validate prices against DB instead of trusting client
    const ids = order.items.map(it => it.id);
    if (ids.length === 0) return res.status(400).json({ error: 'empty order' });

    const placeholders = ids.map(() => '?').join(',');
    const dbProducts = await dbAll(`SELECT id, title, price FROM products WHERE id IN (${placeholders})`, ids);
    const productMap = new Map(dbProducts.map(p => [String(p.id), p]));

    let calculatedTotal = 0;
    const validItems = [];

    for (const item of order.items) {
      const p = productMap.get(String(item.id));
      if (!p) return res.status(400).json({ error: `Product unavailable: ${item.id}` });
      calculatedTotal += p.price * item.qty;
      validItems.push({ ...item, price: p.price, title: p.title }); // Use DB price/title
    }

    // 2. Reliability: Use Transaction
    await dbRun('BEGIN TRANSACTION');

    await dbRun('INSERT INTO orders (id,customer_name,customer_email,customer_address,total,date) VALUES (?,?,?,?,?,?)', [order.id, order.customer.name, order.customer.email, order.customer.address, calculatedTotal, order.date]);
    const stmt = db.prepare('INSERT INTO order_items (order_id,product_id,title,price,qty) VALUES (?,?,?,?,?)');
    validItems.forEach(it => stmt.run(order.id, it.id, it.title, it.price, it.qty));
    
    await new Promise((resolve, reject) => stmt.finalize(err => err ? reject(err) : resolve()));
    await dbRun('COMMIT');

      console.log(`Order ${order.id} saved to DB`);
      res.json({ ok: true, id: order.id });
      // send confirmation email in background if transporter is configured
      if (transporter) {
        const mailFrom = process.env.MAIL_FROM || `Tech House <no-reply@localhost>`;
        const to = order.customer.email;
        const subject = `Your Tech House order ${order.id} — confirmation`;
        
        let itemsHtml = '';
        validItems.forEach(it => {
          itemsHtml += `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${it.title} x ${it.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(it.qty * it.price).toFixed(2)}</td>
          </tr>`;
        });

        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background: #6c63ff; color: white; padding: 20px; text-align: center;">
              <h1>Tech House</h1>
              <p>Order Confirmation</p>
            </div>
            <div style="padding: 20px;">
              <h3>Thank you, ${order.customer.name}!</h3>
              <p>Order ID: <b>${order.id}</b><br>Date: ${new Date(order.date).toLocaleString()}</p>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr><td style="padding: 10px; font-weight: bold;">Total</td><td style="padding: 10px; font-weight: bold; text-align: right;">$${calculatedTotal.toFixed(2)}</td></tr>
              </table>
            </div>
          </div>`;

        transporter.sendMail({ from: mailFrom, to, subject, html }, (mailErr, info) => {
          if (mailErr) console.error('Failed to send order confirmation email', mailErr);
          else console.log('Order confirmation email sent:', info && info.messageId);
        });
      }
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch (rb) {}
    console.error('failed to save order', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Simple registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'invalid' });
  try {
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'user_exists' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const created = new Date().toISOString();
    const r = await dbRun('INSERT INTO users (name,email,password_hash,salt,created_at) VALUES (?,?,?,?,?)', [name, email, hash, salt, created]);
    res.json({ ok: true, id: r.lastID });
  } catch (e) {
    console.error('register failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'invalid' });
  
  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'wrong_credentials' });

    const hash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512').toString('hex');
    if (hash !== user.password_hash) return res.status(401).json({ error: 'wrong_credentials' });

    const token = crypto.randomBytes(32).toString('hex');
    await dbRun('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)', [token, user.id, new Date().toISOString()]);
    
    res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('login failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Forgot Password - Request Token
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'invalid' });

  try {
    const user = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    // Generate 6-digit random code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 min

    // Remove old tokens for this email
    await dbRun('DELETE FROM password_resets WHERE email = ?', [email]);
    await dbRun('INSERT INTO password_resets (email, token, expires_at) VALUES (?,?,?)', [email, token, expires]);

    console.log(`[DEV] Password reset token for ${email}: ${token}`); // For testing without email server

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM || 'Tech House <no-reply@localhost>',
          to: email,
          subject: 'Password Reset Code',
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #6c63ff;">Tech House</h2>
              <p>Siz parolni tiklash uchun so'rov yubordingiz. Quyidagi koddan foydalaning:</p>
              <div style="display: inline-block; background: #f4f4f4; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                ${token}
              </div>
              <p style="color: #777; font-size: 12px;">Bu kod 15 daqiqa davomida amal qiladi. Agar buni siz so'ramagan bo'lsangiz, xabarni e'tiborsiz qoldiring.</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Nodemailer Error:', mailErr.message);
        // Agar email yuborish juda muhim bo'lsa, bu yerda xatolik qaytarish mumkin
      }
    } else {
      console.warn('Transporter sozlanganmagan. Kod terminalda: ', token);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('forgot-password failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Reset Password - Verify Token and Update
app.post('/api/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  if (!email || !token || !newPassword) return res.status(400).json({ error: 'invalid' });

  try {
    const record = await dbGet('SELECT * FROM password_resets WHERE email = ? AND token = ?', [email, token]);
    if (!record || record.expires_at < Date.now()) return res.status(400).json({ error: 'invalid_token' });

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newPassword, salt, 100000, 64, 'sha512').toString('hex');

    await dbRun('UPDATE users SET password_hash = ?, salt = ? WHERE email = ?', [hash, salt, email]);
    await dbRun('DELETE FROM password_resets WHERE email = ?', [email]);
    res.json({ ok: true });
  } catch (e) {
    console.error('reset-password failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  // Agar header bo'lmasa, demak allaqachon "chiqib ketgan" deb hisoblaymiz
  if (!authHeader) return res.json({ ok: true });
  
  const token = authHeader.split(' ')[1]; // "Bearer TOKEN_STRING" formatidan tokenni ajratib olish
  if (!token) return res.json({ ok: true });

  try {
    await dbRun('DELETE FROM sessions WHERE token = ?', [token]);
    res.json({ ok: true });
  } catch (e) {
    console.error('logout failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Get orders (with items)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await dbAll('SELECT * FROM orders ORDER BY date DESC');
    const out = [];
    for (const o of orders) {
      const items = await dbAll('SELECT product_id as id, title, price, qty FROM order_items WHERE order_id = ?', [o.id]);
      out.push({ id: o.id, customer: { name: o.customer_name, email: o.customer_email, address: o.customer_address }, items, total: o.total, date: o.date });
    }
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed' });
  }
});

// Clear orders (admin convenience)
// app.delete('/api/orders', async (req, res) => {
//   // DISABLED FOR SECURITY: This endpoint was unauthenticated and dangerous.
//   // Add middleware to check for admin rights before uncommenting.
//   try {
//     await dbRun('DELETE FROM order_items');
//     await dbRun('DELETE FROM orders');
//     res.json({ ok: true });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: 'failed' });
//   }
// });

app.listen(PORT, () => console.log(`Tech_House server running on http://localhost:${PORT}`));

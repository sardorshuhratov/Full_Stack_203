let products = [];

async function loadProductsFromFile() {
  try {
    const res = await fetch('./products.json');
    if (!res.ok) throw new Error('Failed to load products.json: ' + res.status);
    const data = await res.json();
    products.length = 0;
    data.forEach((p) => products.push(p));
  } catch (e) {
    console.error('Could not load products.json, continuing with empty products list', e);
    products = [];
  }
}

async function loadProducts() {
  try {
    const apiRes = await fetch('/api/products');
    if (apiRes.ok) {
      const data = await apiRes.json();
      products.length = 0;
      data.forEach((p) => products.push(p));
      return;
    }
  } catch (e) {
  }
  await loadProductsFromFile();
}

const CART_KEY = 'techhouse_cart_v1';
const TOKEN_KEY = 'techhouse_token_v1';
const THEME_KEY = 'techhouse_theme_v1';
let cart = {};

const $ = (id) => document.getElementById(id);
const fmt = (n) => '$' + n.toFixed(2);

function categoryLabel(category) {
  if (category === 'laptop') return 'Laptop';
  if (category === 'phone') return 'Telefon';
  if (category === 'accessory') return 'Aksessuar';
  return 'Mahsulot';
}

function priceLabel(price) {
  if (price >= 1500) return 'Premium tanlov';
  if (price >= 800) return 'Ommabop tanlov';
  return 'Qulay narx';
}

function audienceLabel(price) {
  if (price >= 1500) return "Professional va talabchan foydalanuvchilar uchun";
  if (price >= 800) return "Kundalik ish va yuqori qulaylik izlaydiganlar uchun";
  return "Budjetni asragan holda foydali xarid qiluvchilar uchun";
}

function buildProductInsights(product) {
  const title = String(product.title || '').toLowerCase();
  const highlights = [];
  const usage = [];

  if (product.category === 'laptop') {
    highlights.push("Laptop segmentidagi ishonchli variant");
    usage.push("Ish, o'qish va brauzer, ofis dasturlari kabi kundalik vazifalar uchun mos");

    if (title.includes('gaming') || title.includes('rog')) {
      usage.push("O'yin, render va yuqori yuklama talab qiladigan vazifalarga yaqinroq yo'naltirilgan");
    } else if (title.includes('thinkpad') || title.includes('surface')) {
      usage.push("Ofis, biznes uchrashuvlari va ko'chma ish rejimi uchun qulay");
    } else if (title.includes('xps') || title.includes('spectre') || title.includes('macbook')) {
      usage.push("Dizayn, premium material va qulay mobil ishlash tajribasiga urg'u beradi");
    }
  } else if (product.category === 'phone') {
    highlights.push("Smartfon segmentidagi muvozanatli tanlov");
    usage.push("Aloqa, ijtimoiy tarmoqlar, video tomosha va kundalik mobil ishlar uchun qulay");

    if (title.includes('iphone') || title.includes('pixel') || title.includes('xperia')) {
      usage.push("Kamera sifati, displey tajribasi va tizim silliqligiga ko'proq e'tibor berilgan");
    } else if (title.includes('oneplus')) {
      usage.push("Tezkor ishlash va quvvatlash tezligi bilan ajralib turadigan model");
    } else if (title.includes('nokia') || title.includes('xiaomi')) {
      usage.push("Narxiga nisbatan foydali funksiyalar taklif qiladigan segment");
    }
  } else if (product.category === 'accessory') {
    highlights.push("Asosiy qurilmangizni to'ldiradigan foydali aksessuar");
    usage.push("Ish stoli, mobil qurilma yoki kundalik setup'ni qulayroq qilish uchun mos");

    if (title.includes('airpods')) {
      usage.push("Musiqa, qo'ng'iroq va tashqi shovqinni kamaytirish kabi vazifalarda qulay");
    } else if (title.includes('mx master') || title.includes('blackwidow')) {
      usage.push("Kompyuter bilan uzoq ishlash yoki produktivlik setup'i uchun ayniqsa foydali");
    } else if (title.includes('powercore') || title.includes('boostcharge')) {
      usage.push("Yo'lda bo'lganda quvvat masalasini yengillashtiradi");
    } else if (title.includes('ssd')) {
      usage.push("Fayllarni tez ko'chirish va zaxira saqlash uchun qulay qo'shimcha");
    }
  }

  highlights.push(priceLabel(product.price));
  highlights.push(audienceLabel(product.price));

  return {
    status: "Mahsulot tafsilotlari Tech House katalogi va ichki tavsiflar asosida ko'rsatilmoqda.",
    extra: [...highlights, ...usage].join('. ') + '.'
  };
}

function updateCatalogMeta(count) {
  const resultCount = $('resultCount');
  if (resultCount) {
    resultCount.textContent = count === 1 ? '1 ta mahsulot mavjud' : `${count} ta mahsulot mavjud`;
  }
}

function updateCartStatus(total, count) {
  const heroCartCount = $('heroCartCount');
  const heroCartTotal = $('heroCartTotal');
  const filterCartSummary = $('filterCartSummary');
  if (heroCartCount) {
    heroCartCount.textContent = count === 1 ? '1 ta mahsulot' : `${count} ta mahsulot`;
  }
  if (heroCartTotal) {
    heroCartTotal.textContent = count > 0 ? `Savat jami ${fmt(total)}` : 'Savat checkout uchun tayyor';
  }
  if (filterCartSummary) {
    filterCartSummary.textContent = fmt(total);
  }
}

function showProductDetails(productId) {
  const product = products.find((p) => p.id == productId);
  if (!product) return;

  const img = $('productDetailImg');
  const category = $('productDetailCategory');
  const title = $('productDetailTitle');
  const price = $('productDetailPrice');
  const desc = $('productDetailDesc');
  const liveStatus = $('productDetailLiveStatus');
  const extra = $('productDetailExtra');
  const source = $('productDetailSource');
  const addBtn = $('productDetailAddBtn');
  const modalEl = $('productDetailsModal');

  if (!img || !category || !title || !price || !desc || !liveStatus || !extra || !source || !addBtn || !modalEl) return;

  img.src = product.img;
  img.alt = product.title;
  category.innerHTML = `<i class="bi bi-grid"></i> ${categoryLabel(product.category)}`;
  title.textContent = product.title;
  price.textContent = fmt(product.price);
  desc.textContent = product.desc;

  const insights = buildProductInsights(product);
  liveStatus.textContent = insights.status;
  extra.textContent = insights.extra;
  source.classList.add('d-none');
  source.removeAttribute('href');
  addBtn.onclick = () => addToCart(product.id);

  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.show();
}

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function updateThemeToggleUI() {
  const btn = $('themeToggle');
  if (!btn) return;
  const theme = getCurrentTheme();
  const icon = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
  btn.innerHTML = `<i class="${icon}"></i>`;
  btn.setAttribute('aria-label', theme === 'dark' ? 'Light mode yoqish' : 'Dark mode yoqish');
  btn.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
  }
  updateThemeToggleUI();
}

function toggleTheme() {
  const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function showToast(message, type = 'info', timeout = 3000) {
  const container = $('toastContainer');
  if (!container) {
    alert(message);
    return;
  }
  const bg = type === 'success' ? 'bg-success text-white' : (type === 'danger' ? 'bg-danger text-white' : 'bg-light');
  const toastEl = document.createElement('div');
  toastEl.className = 'toast ' + (type === 'success' || type === 'danger' ? '' : 'border');
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  const closeClass = type === 'success' || type === 'danger' ? 'btn-close btn-close-white' : 'btn-close';
  toastEl.innerHTML = `
    <div class="toast-header p-2 ${bg}">
      <div class="me-auto small text-truncate" style="max-width:160px;"></div>
      <button type="button" class="${closeClass}" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body p-2">${message}</div>
  `;
  container.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: timeout });
  bsToast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function setPlaceOrderLoading(on) {
  const btn = $('placeOrderBtn');
  const spinner = $('placeOrderSpinner');
  if (btn) btn.disabled = !!on;
  if (spinner) spinner.classList.toggle('d-none', !on);
}

function updateCheckoutButtons() {
  const count = Object.keys(cart).reduce((s, k) => s + cart[k], 0);
  const checkoutBtn = $('checkout');
  const checkoutTop = $('checkoutTop');
  if (checkoutBtn) checkoutBtn.disabled = count === 0;
  if (checkoutTop) checkoutTop.disabled = count === 0;
}

function showOrderDetails(order) {
  const modalEl = $('orderDetailsModal');
  const content = $('orderDetailsContent');
  if (!modalEl || !content) return;
  content.innerHTML = '';
  const hdr = document.createElement('div');
  hdr.innerHTML = `<div class="mb-2"><strong>Buyurtma ${order.id}</strong> <span class="text-muted small">${new Date(order.date).toLocaleString()}</span></div>`;
  const cust = document.createElement('div');
  cust.className = 'mb-3';
  cust.innerHTML = '<div><strong></strong></div><div class="small text-muted"></div>';
  cust.querySelector('strong').textContent = order.customer.name;
  cust.querySelector('.small').textContent = `${order.customer.email} - ${order.customer.address}`;
  const items = document.createElement('div');
  order.items.forEach((it) => {
    const row = document.createElement('div');
    row.className = 'd-flex justify-content-between py-2 border-bottom';
    row.innerHTML = `<div>${it.title} <span class="text-muted small">x ${it.qty}</span></div><div>${fmt(it.price * it.qty)}</div>`;
    items.appendChild(row);
  });
  const total = document.createElement('div');
  total.className = 'mt-3 fw-semibold';
  total.textContent = 'Jami: ' + fmt(order.total);
  content.appendChild(hdr);
  content.appendChild(cust);
  content.appendChild(items);
  content.appendChild(total);
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : {};
  } catch (e) {
    cart = {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderProducts() {
  const row = $('productsRow');
  row.innerHTML = '';
  const q = $('search').value.trim().toLowerCase();
  const cat = $('categoryFilter').value;
  let visibleCount = 0;

  products.forEach((p) => {
    if (cat !== 'all' && p.category !== cat) return;
    if (q && !p.title.toLowerCase().includes(q) && !p.desc.toLowerCase().includes(q)) return;
    visibleCount += 1;

    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4';

    const card = document.createElement('div');
    card.className = 'card h-100 product-card p-2';

    const img = document.createElement('img');
    img.src = p.img;
    img.className = 'card-img-top';
    img.alt = p.title;

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';
    body.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-2">
        <span class="product-chip"><i class="bi bi-grid"></i> ${categoryLabel(p.category)}</span>
        <span class="small text-muted">${priceLabel(p.price)}</span>
      </div>
      <h5 class="card-title mb-2">${p.title}</h5>
      <p class="card-text small product-desc mb-3">${p.desc}</p>
      <div class="mt-auto d-flex justify-content-between align-items-center">
        <div>
          <div class="price-tag">${fmt(p.price)}</div>
          <div class="small text-muted">Savatga qo'shishga tayyor</div>
        </div>
        <div class="d-flex flex-wrap gap-2 justify-content-end">
          <button class="btn btn-sm btn-outline-secondary" onclick="showProductDetails('${p.id}')">Details</button>
          <button class="btn btn-sm btn-primary" onclick="addToCart('${p.id}')"><i class="bi bi-cart-plus me-1"></i> Qo'shish</button>
        </div>
      </div>`;

    const media = document.createElement('div');
    media.className = 'product-media';
    media.appendChild(img);
    card.appendChild(media);
    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);
  });

  updateCatalogMeta(visibleCount);
  if (visibleCount === 0) {
    row.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="fs-4 fw-bold mb-2">Qidiruv bo'yicha mahsulot topilmadi</div>
          <div>Boshqa kalit so'zni sinab ko'ring yoki barcha kategoriyalarga qayting.</div>
        </div>
      </div>`;
  }
}

function renderCart() {
  const container = $('cartItems');
  container.innerHTML = '';
  let total = 0;
  let count = 0;

  Object.keys(cart).forEach((pid) => {
    const qty = cart[pid];
    const prod = products.find((p) => p.id == pid);
    if (!prod) return;

    const line = document.createElement('div');
    line.className = 'd-flex align-items-center justify-content-between py-2 border-bottom flex-wrap gap-2';
    const left = document.createElement('div');
    left.innerHTML = `<div class="fw-semibold">${prod.title}</div><div class="text-muted small">${fmt(prod.price)} x ${qty}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class="btn-group btn-group-sm" role="group">
      <button class="btn btn-outline-secondary" onclick="changeQty('${pid}', -1)">-</button>
      <button class="btn btn-outline-secondary" onclick="changeQty('${pid}', 1)">+</button>
      <button class="btn btn-outline-danger" onclick="removeFromCart('${pid}')">Olib tashlash</button>
    </div>`;
    line.appendChild(left);
    line.appendChild(right);
    container.appendChild(line);
    total += prod.price * qty;
    count += qty;
  });

  if (count === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="fs-5 fw-bold mb-2">Savatingiz bo'sh</div>
        <div>Checkout'ga o'tish uchun bir nechta mahsulot qo'shing.</div>
      </div>`;
  }

  $('cartSummary').textContent = 'Jami: ' + fmt(total);
  $('cartCount').textContent = count;
  updateCartStatus(total, count);
  updateCheckoutButtons();
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const prod = products.find((p) => p.id == id);
  showToast((prod ? prod.title : 'Mahsulot') + " savatga qo'shildi", 'success', 1500);
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function checkout() {
  const cartCount = Object.keys(cart).reduce((s, k) => s + cart[k], 0);
  if (cartCount === 0) {
    showToast("Savat bo'sh", 'info', 1800);
    return;
  }
  populateCheckout();
}

function populateCheckout() {
  const summary = $('orderSummary');
  const totalEl = $('orderTotal');
  summary.innerHTML = '';
  let total = 0;

  Object.keys(cart).forEach((pid) => {
    const qty = cart[pid];
    const prod = products.find((p) => p.id == pid);
    if (!prod) return;
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between py-2 border-bottom';
    div.innerHTML = `<div>${prod.title} <span class="text-muted small">x ${qty}</span></div><div>${fmt(prod.price * qty)}</div>`;
    summary.appendChild(div);
    total += prod.price * qty;
  });

  if (total === 0) {
    summary.innerHTML = '<div class="empty-state py-4">Checkout oldidan savatdagi mahsulotlar shu yerda ko\'rinadi.</div>';
  }
  totalEl.textContent = fmt(total);
}

function saveOrder(order) {
  return fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  }).then((r) => {
    if (!r.ok) throw new Error('Failed to save order to server');
    return r.json();
  });
}

async function renderOrders() {
  const list = $('ordersList');
  list.innerHTML = '';
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('failed');
    const orders = await res.json();
    if (!orders || orders.length === 0) {
      list.innerHTML = '<div class="text-muted">Hali buyurtmalar yo\'q.</div>';
      return;
    }

    orders.forEach((order) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => showOrderDetails(order));

      const hdr = document.createElement('div');
      hdr.className = 'card-header d-flex justify-content-between align-items-center';
      hdr.innerHTML = `<div><strong>Buyurtma ${order.id}</strong><div class="small text-muted">${new Date(order.date).toLocaleString()}</div></div><div class="fw-semibold">${fmt(order.total)}</div>`;

      const body = document.createElement('div');
      body.className = 'card-body';
      const cust = document.createElement('div');
      cust.className = 'mb-2 small text-muted';
      cust.textContent = `${order.customer.name} - ${order.customer.email} - ${order.customer.address}`;

      const items = document.createElement('div');
      order.items.forEach((it) => {
        const row = document.createElement('div');
        row.className = 'd-flex justify-content-between';
        row.innerHTML = `<div>${it.title} <span class="text-muted small">x ${it.qty}</span></div><div>${fmt(it.price * it.qty)}</div>`;
        items.appendChild(row);
      });

      body.appendChild(cust);
      body.appendChild(items);
      card.appendChild(hdr);
      card.appendChild(body);
      list.appendChild(card);
    });
  } catch (e) {
    console.error('Failed to load orders', e);
    list.innerHTML = '<div class="text-danger">Buyurtmalarni yuklab bo\'lmadi.</div>';
  }
}

async function clearOrders() {
  if (!confirm("Barcha buyurtmalarni o'chiraymi? Bu amalni qaytarib bo'lmaydi.")) return;
  try {
    const res = await fetch('/api/orders', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear orders');
    await renderOrders();
    showToast("Barcha buyurtmalar tozalandi", 'success', 2000);
  } catch (e) {
    console.error('Failed to clear orders', e);
    showToast("Serverdagi buyurtmalarni tozalab bo'lmadi", 'danger', 3000);
  }
}

function updateAuthUI() {
  const token = localStorage.getItem(TOKEN_KEY);
  const loginBtn = $('loginBtn');
  const registerBtn = $('registerBtn');
  const logoutBtn = $('logoutBtn');

  if (token) {
    if (loginBtn) loginBtn.classList.add('d-none');
    if (registerBtn) registerBtn.classList.add('d-none');
    if (logoutBtn) logoutBtn.classList.remove('d-none');
  } else {
    if (loginBtn) loginBtn.classList.remove('d-none');
    if (registerBtn) registerBtn.classList.remove('d-none');
    if (logoutBtn) logoutBtn.classList.add('d-none');
  }
}

async function logout() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
    } catch (e) {
      console.error('Logout request failed', e);
    }
  }
  localStorage.removeItem(TOKEN_KEY);
  showToast('Tizimdan chiqildi', 'info', 2000);
  setTimeout(() => window.location.reload(), 1000);
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = $('checkoutForm');
  if (form && !form.checkValidity()) {
    form.classList.add('was-validated');
    showToast("Iltimos, barcha maydonlarni to'g'ri to'ldiring", 'danger', 2500);
    return;
  }

  const name = $('custName').value.trim();
  const email = $('custEmail').value.trim();
  const address = $('custAddress').value.trim();

  const items = Object.keys(cart).map((pid) => {
    const prod = products.find((p) => p.id == pid);
    return prod ? { id: prod.id, title: prod.title, price: prod.price, qty: cart[pid] } : null;
  }).filter(Boolean);

  if (items.length === 0) {
    showToast("Savatingiz bo'sh", 'danger', 2000);
    return;
  }

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const order = {
    id: Date.now().toString(36),
    customer: { name, email, address },
    items,
    total,
    date: new Date().toISOString()
  };

  setPlaceOrderLoading(true);
  try {
    const resp = await saveOrder(order);
    if (!resp || !resp.ok) throw new Error('Save failed');
    try {
      renderOrders();
    } catch (e) {
    }
    showToast('Buyurtma qabul qilindi. ID: ' + (resp.id || order.id), 'success', 4000);
    const checkoutModalEl = $('checkoutModal');
    const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl) || new bootstrap.Modal(checkoutModalEl);
    checkoutModal.hide();
    const cartModalEl = $('cartModal');
    const cartModal = bootstrap.Modal.getInstance(cartModalEl);
    if (cartModal) cartModal.hide();

    try {
      const r2 = await fetch('/api/orders');
      if (r2.ok) {
        const all = await r2.json();
        const placed = all.find((o) => String(o.id) === String(resp.id) || String(o.id) === String(order.id));
        if (placed) showOrderDetails(placed);
      }
    } catch (e) {
    }
    clearCart();
  } catch (err) {
    console.error('Order save failed', err);
    showToast("Buyurtmani yuborib bo'lmadi. Qayta urinib ko'ring.", 'danger', 3500);
    return;
  } finally {
    setPlaceOrderLoading(false);
  }
}

window.addEventListener('load', async () => {
  await loadProducts();
  loadCart();
  renderProducts();
  renderCart();
  updateAuthUI();

  const checkoutForm = $('checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  const checkoutModalEl = $('checkoutModal');
  if (checkoutModalEl) checkoutModalEl.addEventListener('show.bs.modal', populateCheckout);

  const ordersBtn = $('ordersBtn');
  if (ordersBtn) {
    ordersBtn.addEventListener('click', () => {
      const modalEl = $('ordersModal');
      const modal = new bootstrap.Modal(modalEl);
      renderOrders();
      modal.show();
    });
  }

  const clearOrdersBtn = $('clearOrdersBtn');
  if (clearOrdersBtn) clearOrdersBtn.addEventListener('click', clearOrders);

  const logoutBtn = $('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const themeToggle = $('themeToggle');
  updateThemeToggleUI();
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const registerForm = $('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!registerForm.checkValidity()) {
        registerForm.classList.add('was-validated');
        showToast("Ro'yxatdan o'tish formasini tekshiring", 'danger', 2500);
        return;
      }
      const name = $('regName').value.trim();
      const email = $('regEmail').value.trim();
      const password = $('regPassword').value;
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw data;
        showToast("Hisob yaratildi. Endi buyurtma berishingiz mumkin.", 'success', 3000);
        const modalEl = $('registerModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      } catch (err) {
        console.error('Register failed', err);
        if (err && err.error === 'user_exists') showToast("Bu email bilan hisob allaqachon mavjud", 'danger', 3000);
        else showToast("Hisob yaratib bo'lmadi. Keyinroq urinib ko'ring.", 'danger', 3000);
      }
    });
  }

  const loginForm = $('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('loginEmail').value.trim();
      const password = $('loginPassword').value;
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw data;
        localStorage.setItem(TOKEN_KEY, data.token);
        showToast('Xush kelibsiz!', 'success', 2000);
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        console.error('Login failed', err);
        showToast("Kirishda xatolik: email yoki parol noto'g'ri", 'danger', 3000);
      }
    });
  }

  const forgotForm = $('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('forgotEmail').value.trim();
      try {
        const res = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json().catch(() => ({ error: 'Serverda kutilmagan xatolik' }));
        if (!res.ok) throw data;
        showToast("Kod yuborildi. Email yoki server konsolini tekshiring.", 'success', 3000);
        bootstrap.Modal.getInstance($('forgotPasswordModal')).hide();
        new bootstrap.Modal($('resetConfirmModal')).show();
      } catch (err) {
        showToast('Xatolik: ' + (err.error || 'Bajarilmadi'), 'danger');
      }
    });
  }

  const resetForm = $('resetConfirmForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('forgotEmail').value.trim();
      const token = $('resetToken').value.trim();
      const newPassword = $('resetNewPass').value;
      try {
        const res = await fetch('/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token, newPassword })
        });
        if (!res.ok) throw await res.json();
        showToast("Parol yangilandi. Endi qayta kiring.", 'success', 3000);
        bootstrap.Modal.getInstance($('resetConfirmModal')).hide();
        new bootstrap.Modal($('loginModal')).show();
      } catch (err) {
        showToast('Xatolik: ' + (err.error || "Kod noto'g'ri"), 'danger');
      }
    });
  }

  $('search').addEventListener('input', renderProducts);
  $('categoryFilter').addEventListener('change', renderProducts);
  $('clearCart').addEventListener('click', clearCart);
  $('checkout').addEventListener('click', checkout);
  $('checkoutTop').addEventListener('click', () => {
    const modal = new bootstrap.Modal($('cartModal'));
    modal.show();
  });
});

Tech House Java backend

This backend serves the existing frontend and provides the same core API flows without Node.js dependencies.

Features:
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders`
- `DELETE /api/orders`
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `POST /api/forgot-password`
- `POST /api/reset-password`
- `POST /webhook/product`

Data storage:
- Products stay in `products.json`
- Users, sessions, orders, and reset codes are stored in `java-backend/data/*.json`

Run:

```powershell
.\start-java.ps1
```

Or:

```powershell
.\start-java.bat
```

Then open:

```text
http://localhost:3000
```

Notes:
- Password reset codes are printed to the server console.
- This implementation uses Java 21 built-in libraries only.

Tech House - demo storefront built with Bootstrap, plain JavaScript, and a Java backend.

## Features

- Product list loaded through `/api/products`
- Cart stored in `localStorage`
- Checkout flow with server-side order saving
- Registration and login
- Password reset with a 6-digit code
- Webhook-based product upsert

## Project files

- `index.html` - frontend UI
- `app.js` - frontend logic
- `java-backend/src/TechHouseServer.java` - Java API + static file server
- `start-java.ps1` / `start-java.bat` - run scripts
- `products.json` - initial product seed data
- `java-backend/data/*.json` - persisted users, sessions, orders, and reset codes

## How to run

1. Open a terminal in `Tech_House`
2. Start the Java server:

```powershell
.\start-java.ps1
```

3. Open the app in your browser:

```text
http://localhost:3000
```

Important:
- Do not open `index.html` directly with double-click or Live Server if you want login, orders, or password reset to work.
- These features need the Java backend server.

## Environment variables

Optional environment variables:

```env
PORT=3000
WEBHOOK_SECRET=change_me
```

Password reset codes are printed in the server console for testing.

## Password reset notes

- The reset form sends a request to `/api/forgot-password`
- The email must already exist in stored users data
- The reset code expires after 15 minutes

## Common issues

- `Serverda kutilmagan xatolik`
  This usually means the frontend was opened without the backend server, or the app was not opened from `http://localhost:3000`.

- `user_not_found`
  The entered email is not registered yet.

- Orders or login do not work
  Make sure `.\start-java.ps1` is running and the browser is using the correct localhost address.

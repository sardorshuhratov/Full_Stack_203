Tech_House server

This small Node/Express server serves the static demo and provides two convenience endpoints:

GET /api/products
  - Returns the contents of products.json (useful for proxying a real API or local dev)

POST /webhook/product
  - Accepts a JSON payload representing a product (must include `id`) and upserts it into products.json.
  - If `WEBHOOK_SECRET` is set in the environment, the request must include header `x-webhook-secret` with the same value.

How to run locally
1. cd Tech_House
2. npm install
3. copy .env.example to .env and adjust variables if needed
4. npm start

Example webhook (curl):
  curl -X POST http://localhost:3000/webhook/product -H "Content-Type: application/json" -d '{"id":21,"title":"New Item","price":9.99}'

Note: This server writes directly to products.json for demo purposes. For production use, replace with a proper database and secure webhook handling.
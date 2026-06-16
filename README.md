# FreshMart

FreshMart is a MERN grocery and vegetable shopping platform with JWT authentication, product browsing, cart, checkout, orders, wishlist, reviews, and admin product/order management.

## Project Structure

```text
fresh_mart/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
```

## Prerequisites

Install Node.js LTS, npm, and MongoDB Atlas or a local MongoDB server.

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000` by default.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/users/profile` | User | Get profile |
| PUT | `/api/users/profile` | User | Update profile |
| POST | `/api/users/addresses` | User | Add address |
| DELETE | `/api/users/addresses/:addressId` | User | Delete address |
| GET | `/api/users` | Admin | List users |
| GET | `/api/products` | Public | List/search/filter products |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/reviews` | User | Add/update review |
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart/items` | User | Add item to cart |
| PUT | `/api/cart/items/:productId` | User | Update cart quantity |
| DELETE | `/api/cart/items/:productId` | User | Remove cart item |
| GET | `/api/orders/my` | User | User order history |
| POST | `/api/orders` | User | Checkout/create order |
| GET | `/api/orders` | Admin | View all orders |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/wishlist` | User | Get wishlist |
| POST | `/api/wishlist/:productId` | User | Toggle wishlist item |

## MongoDB Collections

- `users`: profile, role, password hash, addresses, wishlist
- `products`: catalog data, category, stock, images, reviews, rating aggregate
- `carts`: user cart items with product refs and quantity
- `orders`: order items, shipping address, payment metadata, status history

## Deployment Guide

1. Create MongoDB Atlas cluster and set `MONGO_URI`.
2. In MongoDB Atlas, go to Network Access and whitelist your current IP: `110.226.25.170`.
3. Deploy backend to Render, Railway, Fly.io, or an AWS container.
4. Set backend env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.
5. Deploy frontend to Vercel or Netlify.
6. Set frontend env var: `VITE_API_URL=https://your-api-domain.com/api`.
7. Configure CORS to allow only your production frontend domain.
8. Use HTTPS, strong JWT secret, secure payment webhooks, and centralized logging.

## Scalability Improvements

- Add Redis for sessions, cart caching, and rate limit storage.
- Move images to Cloudinary or S3 with signed upload URLs.
- Add search indexing with MongoDB Atlas Search or Meilisearch.
- Use background jobs for email, invoices, and inventory sync.
- Add pagination everywhere admin lists can grow.
- Add API tests, frontend component tests, and CI checks before deployment.


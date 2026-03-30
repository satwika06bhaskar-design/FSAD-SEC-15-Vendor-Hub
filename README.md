# Multi-Vendor Marketplace

Full-stack marketplace scaffold with a React frontend, Express REST API, MySQL schema, JWT auth, multi-vendor order splitting, commission calculation, seller approval, disputes, payouts, and buyer/seller/admin dashboards.

## Folder Structure

```text
.
+-- client
¦   +-- src
¦   ¦   +-- components
¦   ¦   +-- context
¦   ¦   +-- pages
¦   ¦   ¦   +-- admin
¦   ¦   ¦   +-- buyer
¦   ¦   ¦   +-- seller
¦   ¦   +-- services
¦   ¦   +-- utils
¦   +-- index.html
¦   +-- package.json
¦   +-- vite.config.js
+-- server
¦   +-- src
¦   ¦   +-- config
¦   ¦   +-- middleware
¦   ¦   +-- routes
¦   ¦   +-- scripts
¦   ¦   +-- utils
¦   +-- .env
¦   +-- .env.example
¦   +-- package.json
¦   +-- schema.sql
+-- package.json
```

## Backend Features

- `POST /register`, `POST /seller-register`, `POST /login`
- Buyer flows: `GET /products`, `POST /cart/checkout`, `GET /orders`, `POST /dispute`
- Seller flows: product CRUD, seller dashboard, seller orders, payouts, analytics
- Admin flows: seller approval, commission settings, dispute resolution, platform analytics
- Checkout creates one `orders` row plus multiple seller-specific `sub_orders`
- Each sub-order generates a commission record and pending payout

## Database Notes

Core tables requested in the prompt are included, plus helper tables needed to render the marketplace cleanly:

- `order_items`
- `sub_order_items`
- `platform_settings`

Your current backend config points at `DB_NAME=multivendor`, so import the schema into that database:

```bash
mysql -u root -p < server/schema.sql
```

## Environment

The backend now loads variables explicitly from `server/.env`.
Use `server/.env.example` as the template for new environments.

## Install

```bash
cmd /c npm install --prefix server
cmd /c npm install --prefix client
```

## Run

Backend:

```bash
cmd /c npm run dev --prefix server
```

Frontend:

```bash
cmd /c npm run dev --prefix client
```

## Create Admin User

After importing the schema, create or refresh an admin user with:

```bash
cmd /c npm run create-admin --prefix server -- admin@marketplace.com admin123 "Admin User"
```

## Verified

- Backend source syntax checked with `node --check`
- Express app loaded successfully with `node -e "require('./server/src/app')"`
- Frontend production build completed with `cmd /c npm run build --prefix client`

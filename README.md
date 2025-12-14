# ReactDev1

Simple React frontend for the Distribuidora API (running on http://localhost:3002 by default).

Features:
- Top navigation menu (Proveedores, Clientes, Productos, Pedidos)
- Single-page UI: clicking a menu option shows only that section
- List, create, update, delete Providers, Clients, Products
- Grid view with all data columns, search by ID/name/SKU
- Uses Bootstrap for UI, SweetAlert2 for alerts and confirmations
- Uses Zustand for state management

Quick start:

```bash
cd C:\dev\ReactDev1
npm install
# Create a local env file if needed or copy the example
copy .env.example .env.local
# Start the app
npm start
```

Notes:
- The app expects the API to run at http://localhost:3002 by default.
- You can override the backend URL by creating `.env.local` with `REACT_APP_API_BASE=http://localhost:3002`.
- If `REACT_APP_API_BASE` is empty, CRA will use the `proxy` in `package.json` and forward API calls to http://localhost:3002.
- Start the backend (PruebaBackend1) first or change `REACT_APP_API_BASE` if the backend runs on a different host/port.

Authentication:
- The backend provides a `/auth/login` endpoint for user authentication.
- Default seeded users (seeded at server start):
  - Username: maxi, Password: admin123, Permission: admin
  - Username: cacho, Password: read123, Permission: read
- Admin users can create/update/delete entities and create orders; read-only users can view data and the orders history.

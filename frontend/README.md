# Transparent Fund Ledger - Frontend

React + Vite + React Router + Axios + plain CSS. No backend code lives here.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. The backend must be running at http://localhost:5000/api
(change it with `VITE_API_URL` in a `.env` file). The backend must allow CORS from
http://localhost:5173.

## Folder guide

```
src/
  api/         axios instance (adds the JWT) + one function per endpoint
  context/     AuthContext (login, register, logout, current user)
  hooks/       useLoad (fetch + loading + error), useCampaigns
  utils/       formatting helpers + normalize.js (maps backend fields to what the UI uses)
  components/  Navbar, Footer, Button, Card, Badge, Modal, Table, Spinner, ...
  pages/       one file per screen
  index.css    all styles (colour tokens at the top)
```

## If your backend uses different field names

Every page reads data through `src/utils/normalize.js`. If a value shows as 0 or empty,
add your backend's field name to the matching list in that file. Request bodies are built
in the form components (`CampaignForm`, `DonationForm`, `ExpenseForm`, `ProposeAllocation`).

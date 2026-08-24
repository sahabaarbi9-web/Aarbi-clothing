# Aarbi Clothing — Inventory Dashboard

Ek simple CRUD dashboard jis me products add, edit, delete aur search kar sakte hain. Data ek JSON file me store hota hai. (Workbook: *Building a CRUD Based Inventory Dashboard*)

## Tech Stack
- **Node.js + Express** — Backend API
- **JSON file** (`products.json`) — koi database nahi
- **HTML + CSS + JavaScript** (Fetch API) — Frontend
- **Git + GitHub** | Deploy: **Render + Vercel**

## Setup

1. Backend me dependencies install karein:
   ```
   cd backend
   npm install
   node server.js
   ```
2. Server chale to browser me kholen:
   `http://localhost:3000/frontend/index.html`

> Note: Server par sirf API hai. Frontend static files ko aap bina server ke bhi khol sakte hain — bas API server running hona chahiye.

## API Routes

| Method | Route         | Kaam              |
|--------|---------------|-------------------|
| GET    | `/api/products` | Saare products (Read) |
| GET    | `/api/products/:id` | Ek product (Read) |
| POST   | `/api/products` | Naya product add (Create) |
| PUT    | `/api/products/:id` | Product update (Update) |
| DELETE | `/api/products/:id` | Product delete (Delete) |

## Folder Structure

```
inventory-dashboard/
├── backend/
│   ├── server.js        # Express API + JSON file read/write
│   └── products.json    # Data file
├── frontend/
│   ├── index.html       # Dashboard UI + modal
│   ├── style.css        # Design (Aarbi brand)
│   └── script.js        # Fetch API + CRUD logic
└── README.md
```

## Features

- Complete CRUD (Create, Read, Update, Delete)
- Live search filter
- Responsive design (mobile friendly)
- Toast messages, delete confirmations, loading/empty/error states
- Stock summary cards (products, total stock, stock value)
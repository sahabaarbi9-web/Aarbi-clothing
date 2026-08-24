# Aarbi Clothing — Inventory Dashboard (Supabase)

Ek simple CRUD dashboard jis me products add, edit, delete aur search kar sakte hain.
Data ab **Supabase (PostgreSQL)** me store hota hai. (Workbook: *Building a CRUD Based Inventory Dashboard* + *MASTER GUIDE USING SUPABASE TO DEPLOY BACKEND FOR CRUD APP*)

## Tech Stack
- **Node.js + Express** — Backend API
- **Supabase (PostgreSQL)** — Database (uma: self-hosted ya Supabase cloud)
- **@supabase/supabase-js** — Supabase client
- **HTML + CSS + JavaScript** (Fetch API) — Frontend
- **dotenv** — environment variables
- **Git + GitHub** | Deploy: **Railway** (ya Render/Heroku) + **Supabase DB**

## Setup (Local)

### 1. Supabase project aur table banayein
1. [supabase.com](https://supabase.com/) par naya project banayein.
2. Dashboard → **SQL Editor** me `backend/products-schema.sql` ka pura content paste karo → **Run**.
   - Yeh `products` table banata hai (id, name, price, stock, category),
   - seed data daalta hai (6 starter products), aur
   - RLS on karta hai + anon ke liye full CRUD policy.

### 2. Credentials `.env` me daalein
```
cd inventory-dashboard/backend
cp .env.example .env
```
`.env` me bharo:
- `SUPABASE_URL` → Dashboard → **Settings → API → Project URL**
- `SUPABASE_ANON_KEY` → same page, **Project API keys → anon/public**
- `SUPABASE_SERVICE_KEY` → same page, **service_role** (secret — repo me kabhi mat dalna)

### 3. Baaki backend install karein
```
npm install
node server.js
```
- Browser me kholo: `http://localhost:3000/`
- API: `http://localhost:3000/api/products`

> `.env` file git me push NAHI hoti — `.gitignore` me listed hai.

## API Routes (same jo frontend use karta hai)
| Method | Route         | Kaam              |
|--------|---------------|-------------------|
| GET    | `/api/products` | Saare products (Read) |
| GET    | `/api/products/:id` | Ek product (Read)   |
| POST   | `/api/products` | Naya product add (Create) |
| PUT    | `/api/products/:id` | Product update (Update) |
| DELETE | `/api/products/:id` | Product delete (Delete) |

## Supabase par deploy karna

> ⚠️ **Important:** Supabase Node/Express server khud host nahi karta — wo **database** deta hai.
> Express backend aap **Railway / Render / Heroku** par deploy karte hain, aur wo Supabase DB se connect hota hai.
> Is repository me already **Railway** config hai (`Dockerfile` + `railway.toml`).

1. **Supabase** side (upar diya): project, table, keys bana liya.
2. **Backend host** par (`Railway`):
   - Railway empty project → **Deploy from repo/GitHub**
   - Project me ye files push karo (`inventory-dashboard/backend`, `Dockerfile`, `railway.toml`)
   - Railway dashboard → **Variables** me daalo:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_KEY` (ya `SUPABASE_ANON_KEY`)
   - Deploy hone ke baad base URL milega, e.g. `https://app.up.railway.app`
3. Frontend me `script.js` ka `API_URL = ''` same-origin rakh sakte hai (Express sab static + API dono same host serve karta hai).
   - Agar frontend alag (e.g. Netlify/Vercel) par toh `API_URL` full backend URL set karo + CORS on hai.
4. Test: `https://app.up.railway.app/api/products` se JSON products dikhe.

## Folder Structure
```
inventory-dashboard/
├── backend/
│   ├── server.js           # Express API (Supabase se CRUD)
│   ├── supabaseClient.js   # Supabase client (URL + key)
│   ├── products-schema.sql # SQL Editor me ye paste karo
│   ├── products.json       # (seed reference only — ab DB use hota hai)
│   ├── .env.example        # env template
│   └── .env                # (local — git ignore)
├── frontend/
│   ├── index.html          # Dashboard UI + modal
│   ├── style.css           # Design (Aarbi brand)
│   └── script.js           # Fetch API + CRUD logic
└── README.md
```

## Features
- Complete CRUD (Create, Read, Update, Delete) — ab PostgreSQL (Supabase) me
- Live search filter
- Responsive design (mobile friendly)
- Toast messages, delete confirmations, loading/empty/error states
- Stock summary cards (products, total stock, stock value)
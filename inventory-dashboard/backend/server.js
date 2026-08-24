/* ============================================================
   AARBI CLOTHING — Online Store Inventory Dashboard (Backend)
   Node.js + Express + SUPABASE (PostgreSQL)   [CRUD API]
   Data ab JSON file ki jagah Supabase `products` table me hai.
   Frontend ka /api/products BASE urls wahi rahe — koi UI nahi badla.
   ============================================================ */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const { supabase } = require('./supabaseClient');

const app = express();
// Railway/Render apne aap PORT env dete hain; locally 3000
const PORT = process.env.PORT || 3000;

/* ---------- Admin Auth (simple session) ----------
   Credentials .env me hain (ADMIN_USERNAME / ADMIN_PASSWORD).
   Agar na daalein to defaults: admin / admin1234 (best hai real password daalna). */
const ADMIN_USER   = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS   = process.env.ADMIN_PASSWORD || 'admin1234';
const sessions     = new Set(); // valid login tokens (in-memory)

function authToken(req) {
  const auth = req.headers['authorization'] || '';
  return auth.includes('Bearer ') ? auth.split('Bearer ')[1] : '';
}
function requireAuth(req, res, next) {
  const token = authToken(req);
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Unauthorized — pehle login karein' });
  }
  next();
}

app.use(cors());               // cross-origin requests allow karein
app.use(express.json());       // JSON body parse karein

// Static frontend serve karein (login overlay bhi yahi hai) — http://localhost:3000/ par dashboard khulega
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* Guard: agar Supabase URL/key `.env` me na daalein toh API ko graceful 503 mile. */
app.use('/api', (req, res, next) => {
  // Login/Logout ke liye Supabase jaroori nahi
  if (req.path === '/api/admin/login' || req.path === '/api/admin/logout') return next();
  if (!supabase) {
    return res.status(503).json({ message: 'Supabase configure nahi hua — backend/.env me SUPABASE_URL aur key daalein' });
  }
  next();
});

/* ---------- Admin login / logout (protected routes ke baad sab requireAuth niche lagta hai) ---------- */
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = crypto.randomBytes(24).toString('hex');
    sessions.add(token);
    return res.json({ success: true, username, token });
  }
  return res.status(401).json({ success: false, message: 'Invalid username ya password' });
});

app.post('/api/admin/logout', (req, res) => {
  sessions.delete(authToken(req));
  res.json({ success: true });
});

/* Ab se saare /api product routes ko admin login (Bearer token) chahiye */
app.use('/api', requireAuth);

/* Helper: PostgREST ka "not found" error detect karein (koi row nahi mili) */
function isNotFoundError(error) {
  return error && error.code === 'PGRST116';
}

/* ---------- API Routes (Supabase-backed) ---------- */

// Root
app.get('/', (req, res) => res.send('Welcome to Online Store API! (Supabase)'));

// READ : saare products
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('id');
  if (error) return res.status(500).json({ message: 'Database error', error: error.message });
  res.json(data);
});

// READ : ek product (id se)
app.get('/api/products/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', Number(req.params.id))
    .maybeSingle();

  if (error || !data) return res.status(404).json({ message: 'Product nahi mila' });
  res.json(data);
});

// CREATE : naya product add
app.post('/api/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: req.body.name,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      category: req.body.category
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: 'Naya product add nahi hua', error: error.message });
  res.status(201).json(data);
});

// UPDATE : product badlo
app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.price !== undefined) updates.price = Number(req.body.price);
  if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);
  if (req.body.category !== undefined) updates.category = req.body.category;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (isNotFoundError(error)) return res.status(404).json({ message: 'Product nahi mila' });
    return res.status(400).json({ message: 'Product update nahi hua', error: error.message });
  }
  res.json(data);
});

// DELETE : product hatao
app.delete('/api/products/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', Number(req.params.id))
    .select()
    .single();

  if (error) {
    if (isNotFoundError(error)) return res.status(404).json({ message: 'Product nahi mila' });
    return res.status(400).json({ message: 'Product delete nahi hua', error: error.message });
  }
  res.json({ message: 'Product delete ho gaya' });
});

// Railway/Render etc. ke liye 0.0.0.0 par listen karna zaroori hai
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server chal raha hai: http://localhost:' + PORT);
});
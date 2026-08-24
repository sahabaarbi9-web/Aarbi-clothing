/* ============================================================
   AARBI CLOTHING — Online Store Inventory Dashboard (Backend)
   Node.js + Express + JSON file (no database)
   Complete CRUD API: Create, Read, Update, Delete
   ============================================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
// Railway apne aap PORT env variable deta hai; locally 3000 par chalta hai
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'products.json');

app.use(cors()); // frontend (different port) se requests allow karein
app.use(express.json()); // JSON body parse karne ke liye

// Static frontend serve karein — http://localhost:3000/ par dashboard khulega
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* ---------- Helpers: file read / write ---------- */
function readProducts() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

/* ---------- API Routes ---------- */
// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Online Store API!');
});

// READ : saare products
app.get('/api/products', (req, res) => {
  res.json(readProducts());
});

// READ : ek product (id se)
app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product nahi mila' });
  res.json(product);
});

// CREATE : naya product add
app.post('/api/products', (req, res) => {
  const products = readProducts();
  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
    name: req.body.name,
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    category: req.body.category
  };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

// UPDATE : product badlo
app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Product nahi mila' });

  products[index] = {
    ...products[index],
    name: req.body.name ?? products[index].name,
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[index].stock,
    category: req.body.category ?? products[index].category,
    id: Number(req.params.id)
  };
  writeProducts(products);
  res.json(products[index]);
});

// DELETE : product hatao
app.delete('/api/products/:id', (req, res) => {
  const products = readProducts();
  const filtered = products.filter(p => p.id !== Number(req.params.id));
  if (filtered.length === products.length) {
    return res.status(404).json({ message: 'Product nahi mila' });
  }
  writeProducts(filtered);
  res.json({ message: 'Product delete ho gaya' });
});

// Railway/Render etc. ke liye 0.0.0.0 par listen karna zaroori hai
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server chal raha hai: http://localhost:' + PORT);
});
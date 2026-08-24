/* ============================================================
   AARBI CLOTHING — Inventory Dashboard Frontend Logic
   Fetch API + Complete CRUD (Add, Edit, Delete, Auto-Refresh)
   ============================================================ */

// Same-origin (relative) API URL — localhost pe bhi aur Railway deploy pe bhi kaam karega.
// Backend khud frontend ko serve karta hai, isliye '/api/products' same host par hi milega.
// Cross-origin chahiye ho to yahan full URL laga dein, jaise: const API_URL = 'https://tumhara-app.up.railway.app';
const API_URL = '';
const tbody = document.getElementById('productBody');

/* ---------- Toast messages (no library) ---------- */
function showToast(message, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ---------- Stats update ---------- */
function updateStats(products) {
  const count = products.length;
  const totalStock = products.reduce((s, p) => s + Number(p.stock), 0);
  const totalValue = products.reduce((s, p) => s + Number(p.stock) * Number(p.price), 0);
  document.getElementById('statCount').textContent = count;
  document.getElementById('statStock').textContent = totalStock;
  document.getElementById('statValue').textContent = 'Rs. ' + totalValue.toLocaleString('en-US');
}

/* ---------- Search filtering ---------- */
function filterProducts(all) {
  const q = document.getElementById('searchBox').value.trim().toLowerCase();
  if (!q) return all;
  return all.filter(p =>
    String(p.name).toLowerCase().includes(q) ||
    String(p.category).toLowerCase().includes(q) ||
    String(p.id).includes(q)
  );
}

/* ---------- Render into table ---------- */
function renderProducts(allProducts) {
  const products = filterProducts(allProducts);
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-row">Koi product nahi mila</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr data-id="${p.id}" data-name="${p.name}" data-price="${p.price}"
        data-stock="${p.stock}" data-category="${p.category}">
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>PKR ${Number(p.price).toLocaleString('en-US')}</td>
      <td class="${p.stock == 0 ? 'stock-low' : ''}">${p.stock}${p.stock <= 5 ? ' ⚠️' : ''}</td>
      <td>${p.category}</td>
      <td>
        <button class="btn btn-edit" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}
/* ---------- Load products (READ) ---------- */
async function loadProducts() {
  tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Loading products…</td></tr>';
  try {
    const res = await fetch(API_URL + '/api/products');
    if (!res.ok) throw new Error('API ne error diya');
    const allProducts = await res.json();
    window._allProducts = allProducts;
    renderProducts(allProducts);
    updateStats(allProducts);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="error-row">
      Error: Products load nahi hue. Kya server chal raha hai? ${err.message}
    </td></tr>`;
    updateStats([]);
  }
}

/* ---------- CRUD operations ---------- */
// Add: POST request
async function addProduct(product) {
  const res = await fetch(API_URL + '/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Product add nahi hua');
  await loadProducts(); // UI auto-refresh
}

// Edit: PUT request
async function updateProduct(id, product) {
  const res = await fetch(API_URL + '/api/products/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Product update nahi hua');
  await loadProducts();
}

// Delete: DELETE request
async function deleteProduct(id) {
  if (!confirm('Kya aap sach mein yeh product delete karna chahte hain?')) {
    return; // Cancel dabaya — kuch mat karein
  }
  try {
    const res = await fetch(API_URL + '/api/products/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Product delete nahi hua');
    await loadProducts();
    showToast('Product delete ho gaya ✅');
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}
/* ---------- Modal helpers ---------- */
const form = document.getElementById('productForm');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
let editingId = null; // null = add mode, number = edit mode

function openModal() { modal.classList.remove('hidden'); }
function closeModal() {
  modal.classList.add('hidden');
  form.reset();
  editingId = null;
  modalTitle.textContent = 'Add Product';
}

// Edit button: modal me current values bharo
function editProduct(id) {
  editingId = id;
  modalTitle.textContent = 'Edit Product';
  const row = tbody.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;
  document.getElementById('name').value = row.dataset.name;
  document.getElementById('price').value = row.dataset.price;
  document.getElementById('stock').value = row.dataset.stock;
  document.getElementById('category').value = row.dataset.category;
  openModal();
}
/* ---------- Form submit handler ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // page reload mat hone do!
  const product = {
    name: document.getElementById('name').value.trim(),
    price: Number(document.getElementById('price').value),
    stock: Number(document.getElementById('stock').value),
    category: document.getElementById('category').value
  };

  // Form validation
  if (!product.name) { showToast('Product name zaroori hai', 'error'); return; }
  if (product.price < 0) { showToast('Price negative nahi ho sakti', 'error'); return; }
  if (product.stock < 0) { showToast('Stock negative nahi ho sakta', 'error'); return; }

  try {
    if (editingId === null) {
      await addProduct(product);
      showToast('Product add ho gaya ✅');
    } else {
      await updateProduct(editingId, product);
      showToast('Product update ho gaya ✅');
    }
    closeModal();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
});

document.getElementById('addBtn').addEventListener('click', openModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

// Live search
document.getElementById('searchBox').addEventListener('input', () => {
  if (window._allProducts) renderProducts(window._allProducts);
});

// Page load hote hi products dikhayein
document.addEventListener('DOMContentLoaded', loadProducts);
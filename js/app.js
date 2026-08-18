/* ============================================================
   AARBI CLOTHING — Main Application Logic (vanilla JS)
   ============================================================ */
'use strict';

/* ---------- Local storage helpers ---------- */
const Store = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; }
    catch (e) { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

const CART_KEY = 'aarbi_cart_v1';
const WISH_KEY = 'aarbi_wish_v1';
const getCart = () => Store.get(CART_KEY, []);
const setCart = (c) => Store.set(CART_KEY, c);
const getWish = () => Store.get(WISH_KEY, []);
const setWish = (w) => Store.set(WISH_KEY, w);

const byId = (id) => PRODUCTS.find(p => p.id === id);
const esc = escapeXml;
const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

/* ---------- Toasts ---------- */
function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2600);
}

/* ---------- Header count badges ---------- */
function updateCounts() {
  const qty = getCart().reduce((s, i) => s + i.qty, 0);
  const wish = getWish().length;
  ['cartCount', 'drawerCartCount', 'cartTabCount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = qty;
  });
  const wc = document.getElementById('wishCount');
  if (wc) wc.textContent = wish;
  const wt = document.getElementById('wishTabCount');
  if (wt) wt.textContent = wish;
  const wb = document.getElementById('wishlistBtn');
  if (wb) wb.classList.toggle('liked', wish > 0);
}

/* ---------- Header + mobile drawer ---------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('drawerClose');

  const onScroll = () => { if (header) header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const openMenu = () => {
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('show');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  if (drawer) drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('revealed')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ---------- Generic helpers ---------- */
function addToCart(product, size, color, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.size === size && i.color === color);
  if (existing) existing.qty += qty;
  else cart.push({ id: product.id, size, color, qty });
  setCart(cart);
  updateCounts();
  showToast('✅ ' + product.name + ' added to cart', 'ok');
}

function toggleWishlist(productId) {
  let wish = getWish();
  const has = wish.includes(productId);
  if (has) { wish = wish.filter(id => id !== productId); showToast('💔 Removed from wishlist'); }
  else { wish.push(productId); showToast('❤️ Added to wishlist', 'ok'); }
  setWish(wish);
  updateCounts();
  return !has;
}

function renderProductCard(p, delay = 0) {
  const wished = getWish().includes(p.id);
  return `
  <article class="product-card" style="animation-delay:${Math.min(delay, 6) * 40}ms">
    <div class="pc-media">
      <img src="${p.image}" alt="${esc(p.name)}" loading="lazy">
      ${p.tag ? `<span class="pc-badge ${p.tag}">${p.tag === 'new' ? 'New' : 'Sale'}</span>` : ''}
      <button class="pc-wish ${wished ? 'liked' : ''}" data-wish="${p.id}" aria-label="Add to wishlist">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
    </div>
    <div class="pc-body">
      <div class="pc-meta">
        <span class="pc-cat">${CATEGORY_META[p.category].label}</span>
        <span class="pc-sub">${esc(p.ageGroup ? p.ageGroup : p.subcategory)}</span>
      </div>
      <h3 class="pc-name">${esc(p.name)}</h3>
      <div class="pc-rating"><span class="stars">${stars(p.rating)}</span> ${p.rating.toFixed(1)} (${p.reviews})</div>
      <div class="pc-price">
        <span class="price-now">${fmtPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${fmtPrice(p.oldPrice)}</span><span class="price-off">${p.discount}% OFF</span>` : ''}
      </div>
      <button class="pc-add" data-add="${p.id}">🛒 Add to Cart</button>
    </div>
  </article>`;
}

/* ============================================================
   HOME / SHOP MODULE
   ============================================================ */
const shop = {
  category: 'all', section: 'All', sort: 'featured', search: '', visible: 12
};

function currentList() {
  let list = PRODUCTS.slice();
  if (shop.category !== 'all') list = list.filter(p => p.category === shop.category);
  if (shop.section !== 'All') list = list.filter(p => p.section === shop.section);
  if (shop.search) {
    const q = shop.search.toLowerCase();
    list = list.filter(p => (p.name + ' ' + p.subcategory + ' ' + p.section + ' ' + (p.hint || '')).toLowerCase().includes(q));
  }
  switch (shop.sort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating); break;
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: list.sort((a, b) => ((b.tag ? 1 : 0) - (a.tag ? 1 : 0)) || (b.reviews - a.reviews));
  }
  return list;
}

/* AI suggestion: which subcategory best matches this search? */
function aiSuggestion(q) {
  const t = q.toLowerCase();
  let best = null, bestScore = 0;
  ['Shirts', 'Pants', 'Shoes', 'Shalwar Kameez', 'Purses', 'Heels'].forEach(section => {
    const subs = SUBCATS[section] || [];
    [section].concat(subs).forEach(s => {
      let score = 0;
      s.toLowerCase().split(/[^a-z]+/).forEach(w => { if (w.length > 2 && t.includes(w)) score += w.length; });
      if (score > bestScore) { bestScore = score; best = { section: s, isSub: subs.includes(s) }; }
    });
  });
  if (!best) return null;
  const match = best.isSub ? PRODUCTS.find(p => p.subcategory === best.section) : PRODUCTS.find(p => p.section === best.section);
  return match || null;
}

function resultInfo(list) {
  const el = document.getElementById('resultInfo');
  if (!el) return;
  if (!list.length) {
    const sug = aiSuggestion(shop.search);
    el.innerHTML = shop.search
      ? '🤖 <strong>AI:</strong> No matches for “' + esc(shop.search) + '”. Did you mean <strong>' + (sug ? esc(sug.subcategory + ' (' + CATEGORY_META[sug.category].label + ')') : 'something else') + '</strong>?'
      : 'No products found for this filter.';
    return;
  }
  const where = shop.search
    ? ' for <strong>“' + esc(shop.search) + '”</strong>'
    : (shop.section !== 'All' ? ' in <strong>' + esc(shop.section) + '</strong>' : '');
  el.innerHTML = '🤖 <strong>AI:</strong> ' + list.length + ' product' + (list.length === 1 ? '' : 's') + ' found' + where + ' · sorted by ' + shop.sort.replace('-', ' → ').replace('featured', 'featured/relevance');
}

function renderShop() {
  const grid = document.getElementById('productsGrid');
  const loadBtn = document.getElementById('loadMoreBtn');
  const wrap = document.getElementById('loadMoreWrap');
  if (!grid) return;
  const list = currentList();
  resultInfo(list);
  const shown = list.slice(0, shop.visible);
  grid.innerHTML = shown.length
    ? shown.map((p, i) => renderProductCard(p, i)).join('')
    : '<div class="empty-state"><span class="emo">🛍️</span><h3>Nothing here yet</h3><p>Try a different category or search term.</p></div>';
  if (loadBtn) loadBtn.style.display = (shop.visible >= list.length || !list.length) ? 'none' : '';
  if (wrap) wrap.style.display = list.length <= shop.visible ? 'none' : '';
}

function renderSectionChips() {
  const tabs = document.getElementById('sectionTabs');
  if (!tabs) return;
  const sections = getSections(shop.category);
  tabs.innerHTML = sections.map(s => '<button class="chip ' + (shop.section === s ? 'active' : '') + '" data-section="' + esc(s) + '">' + s + '</button>').join('');
}

function setFilter(category) {
  shop.category = category;
  shop.section = 'All';
  shop.visible = 12;
  document.querySelectorAll('#filterTabs .filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === category));
  renderSectionChips();
  renderShop();
}

function initShopEvents() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  document.querySelectorAll('#filterTabs .filter-btn').forEach(btn =>
    btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

  const tabs = document.getElementById('sectionTabs');
  if (tabs) tabs.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    shop.section = chip.dataset.section;
    shop.visible = 12;
    renderSectionChips();
    renderShop();
  });

  const sortSel = document.getElementById('sortSelect');
  if (sortSel) sortSel.addEventListener('change', () => { shop.sort = sortSel.value; shop.visible = 12; renderShop(); });

  const loadBtn = document.getElementById('loadMoreBtn');
  if (loadBtn) loadBtn.addEventListener('click', () => { shop.visible += 12; renderShop(); });

  grid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) { openQuickAdd(byId(+addBtn.dataset.add)); return; }
    const wishBtn = e.target.closest('[data-wish]');
    if (wishBtn) {
      const liked = toggleWishlist(+wishBtn.dataset.wish);
      wishBtn.classList.toggle('liked', liked);
    }
  });

  const doSearch = (q) => {
    shop.search = q.trim();
    shop.category = 'all';
    shop.section = 'All';
    shop.visible = 12;
    document.querySelectorAll('#filterTabs .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    renderSectionChips();
    renderShop();
    const sec = document.getElementById('shop');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  };
  const sForm = document.getElementById('searchForm');
  if (sForm) sForm.addEventListener('submit', (e) => { e.preventDefault(); doSearch(document.getElementById('searchInput').value); });
  const dForm = document.getElementById('drawerSearchForm');
  if (dForm) dForm.addEventListener('submit', (e) => { e.preventDefault(); doSearch(document.getElementById('drawerSearchInput').value); });

  document.querySelectorAll('[data-goto]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = a.dataset.goto;
      if (['male', 'female', 'kids'].includes(cat)) {
        if (document.getElementById('shop')) { setFilter(cat); document.getElementById('shop').scrollIntoView({ behavior: 'smooth' }); }
        else window.location.href = 'index.html?cat=' + cat + '#shop';
      }
    });
  });

  const catParam = new URLSearchParams(location.search).get('cat');
  if (catParam && ['male', 'female', 'kids'].includes(catParam)) setFilter(catParam);
  else { renderSectionChips(); renderShop(); }

  const nForm = document.getElementById('newsletterForm');
  if (nForm) nForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('newsNote');
    const email = document.getElementById('newsletterEmail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (note) { note.textContent = '⚠️ Please enter a valid email address.'; note.className = 'news-note err'; }
      return;
    }
    if (note) { note.textContent = '🎉 Welcome to the Aarbi family! Check your inbox soon.'; note.className = 'news-note ok'; }
    e.target.reset();
  });
}

/* ============================================================
   QUICK-ADD MODAL
   ============================================================ */
let modalProduct = null, modalSize = null, modalColor = null;

function openQuickAdd(p) {
  if (!p) return;
  modalProduct = p;
  modalSize = p.sizes[0];
  modalColor = p.colors[0];
  const modal = document.getElementById('quickAddModal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;
  content.innerHTML =
    '<div class="qa-grid">' +
      '<div class="qa-media"><img src="' + p.image + '" alt="' + esc(p.name) + '"></div>' +
      '<div class="qa-info">' +
        '<div class="pc-meta"><span class="pc-cat">' + CATEGORY_META[p.category].label + '</span><span class="pc-sub">' + esc(p.subcategory) + '</span></div>' +
        '<h3 class="qa-name">' + esc(p.name) + '</h3>' +
        '<div class="qa-rating"><span class="stars">' + stars(p.rating) + '</span> ' + p.rating.toFixed(1) + ' (' + p.reviews + ' reviews)</div>' +
        '<p class="qa-desc">From Aarbi\u2019s ' + esc(p.section) + ' collection — automatically organized by our smart AI. Premium quality, ready to ship.</p>' +
        '<div><span class="qa-label">Size</span><div class="qa-options" id="qaSizes">' +
          p.sizes.map(s => '<button class="qa-opt' + (s === modalSize ? ' selected' : '') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>').join('') +
        '</div></div>' +
        '<div><span class="qa-label">Colour</span><div class="qa-options" id="qaColors">' +
          p.colors.map(c => '<button class="color-dot' + (c[1] === modalColor[1] ? ' selected' : '') + '" data-color-name="' + esc(c[0]) + '" data-color-hex="' + c[1] + '" title="' + esc(c[0]) + '" style="background:' + c[1] + '"></button>').join('') +
        '</div></div>' +
        '<div class="qa-foot"><span class="qa-price">' + fmtPrice(p.price) + '</span>' +
          '<button class="btn btn-accent" id="qaAddBtn">Add to Cart</button></div>' +
      '</div>' +
    '</div>';

  content.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
    modalSize = b.dataset.size;
    content.querySelectorAll('[data-size]').forEach(x => x.classList.toggle('selected', x === b));
  }));
  content.querySelectorAll('[data-color-hex]').forEach(b => b.addEventListener('click', () => {
    modalColor = [b.dataset.colorName, b.dataset.colorHex];
    content.querySelectorAll('[data-color-hex]').forEach(x => x.classList.toggle('selected', x === b));
  }));
  const addBtn = content.querySelector('#qaAddBtn');
  if (addBtn) addBtn.addEventListener('click', () => {
    addToCart(modalProduct, modalSize, modalColor[0]);
    closeModal();
  });

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('quickAddModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initShared() {
  document.querySelectorAll('[data-close-modal]').forEach(el =>
    el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* ============================================================
   CART & WISHLIST PAGE
   ============================================================ */
const PROMO_CODES = { AARBI10: { pct: 0.10 }, SAVE20: { pct: 0.20 }, FREESHIP: { ship: true } };
let promoApplied = null;

function renderCart() {
  const list = document.getElementById('cartItems');
  if (!list) return;
  const cart = getCart();
  const content = document.getElementById('cartContent');
  if (!cart.length) {
    if (content) content.innerHTML =
      '<div class="empty-cart"><span class="emo">🛒</span><h2>Your cart is empty</h2>' +
      '<p>Looks like you haven\u2019t added anything yet.</p>' +
      '<a href="index.html#shop" class="btn btn-primary">Start Shopping</a></div>';
    const summary = document.getElementById('cartSummary');
    if (summary) summary.style.display = 'none';
    return;
  }
  if (content) content.style.display = '';
  const summary = document.getElementById('cartSummary');
  if (summary) summary.style.display = '';

  list.innerHTML = cart.map((item, i) => {
    const p = byId(item.id);
    if (!p) return '';
    return '<div class="cart-item" style="animation-delay:' + (i * 70) + 'ms">' +
      '<img src="' + p.image + '" alt="' + esc(p.name) + '">' +
      '<div>' +
        '<div class="ci-name">' + esc(p.name) + '</div>' +
        '<div class="ci-variant">Size: ' + esc(item.size) + ' · Colour: ' + esc(item.color) + '</div>' +
        '<div class="ci-price">' + fmtPrice(p.price) + '</div>' +
        '<div class="ci-qty">' +
          '<button class="qty-btn" data-dec="' + item.id + '|' + esc(item.size) + '|' + esc(item.color) + '" aria-label="Decrease quantity">−</button>' +
          '<span>' + item.qty + '</span>' +
          '<button class="qty-btn" data-inc="' + item.id + '|' + esc(item.size) + '|' + esc(item.color) + '" aria-label="Increase quantity">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="ci-actions">' +
        '<span class="ci-total">' + fmtPrice(p.price * item.qty) + '</span>' +
        '<button class="ci-remove" data-rm="' + item.id + '|' + esc(item.size) + '|' + esc(item.color) + '">Remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
  updateSummary();
}

function cartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => { const p = byId(i.id); return p ? s + p.price * i.qty : s; }, 0);
  let discount = 0;
  let shipping = 199;
  if (promoApplied && promoApplied.pct) discount = Math.round(subtotal * promoApplied.pct);
  const after = subtotal - discount;
  if (promoApplied && promoApplied.ship) shipping = 0;
  else if (after > 2499 || after === 0) shipping = 0;
  return { subtotal, discount, shipping, total: after + shipping };
}

function updateSummary() {
  const t = cartTotals();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('sumSubtotal', fmtPrice(t.subtotal));
  const dEl = document.getElementById('sumDiscount');
  if (dEl) { dEl.textContent = t.discount ? '− ' + fmtPrice(t.discount) : '—'; dEl.style.color = t.discount ? 'var(--clr-success)' : ''; }
  set('sumShipping', t.shipping ? fmtPrice(t.shipping) : 'FREE');
  set('sumTotal', fmtPrice(t.total));
}

function renderWishlist() {
  const grid = document.getElementById('wishGrid');
  if (!grid) return;
  const items = getWish().map(byId).filter(Boolean);
  grid.innerHTML = items.length
    ? items.map((p, i) => renderProductCard(p, i)).join('')
    : '<div class="empty-cart"><span class="emo">💜</span><h2>No favourites yet</h2>' +
      '<p>Tap the heart on any product to save it here.</p>' +
      '<a href="index.html#shop" class="btn btn-primary">Explore Products</a></div>';
}

function initCartPage() {
  const cartView = document.getElementById('cartView');
  if (!cartView) return;

  const wishView = document.getElementById('wishSection');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const switchTab = (tab) => {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    cartView.style.display = tab === 'cart' ? '' : 'none';
    if (wishView) wishView.style.display = tab === 'wishlist' ? '' : 'none';
  };
  tabBtns.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  if (location.hash === '#wishlist') switchTab('wishlist');

  const list = document.getElementById('cartItems');
  if (list) list.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const rm = e.target.closest('[data-rm]');
    let cart = getCart();
    if (inc) {
      const [id, size, color] = inc.dataset.inc.split('|');
      const it = cart.find(i => i.id === +id && i.size === size && i.color === color);
      if (it) it.qty++;
    } else if (dec) {
      const [id, size, color] = dec.dataset.dec.split('|');
      const it = cart.find(i => i.id === +id && i.size === size && i.color === color);
      if (it) { it.qty--; if (it.qty < 1) cart = cart.filter(x => x !== it); }
    } else if (rm) {
      const [id, size, color] = rm.dataset.rm.split('|');
      cart = cart.filter(i => !(i.id === +id && i.size === size && i.color === color));
    }
    setCart(cart);
    updateCounts();
    renderCart();
  });

  const promoForm = document.getElementById('promoForm');
  if (promoForm) promoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = promoForm.querySelector('input');
    const code = input.value.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) { showToast('Invalid promo code.', 'err'); return; }
    promoApplied = promo;
    showToast('🎉 Promo code applied!', 'ok');
    renderCart();
  });

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (!getCart().length) { showToast('Your cart is empty.', 'err'); return; }
    showToast('🎉 Order placed! Thank you for shopping with Aarbi.', 'ok');
    setCart([]);
    promoApplied = null;
    updateCounts();
    renderCart();
  });

  const wishGrid = document.getElementById('wishGrid');
  if (wishGrid) wishGrid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) { openQuickAdd(byId(+addBtn.dataset.add)); return; }
    const wishBtn = e.target.closest('[data-wish]');
    if (wishBtn) {
      const liked = toggleWishlist(+wishBtn.dataset.wish);
      wishBtn.classList.toggle('liked', liked);
      renderWishlist();
    }
  });

  renderCart();
  renderWishlist();
}

/* ============================================================
   CONTACT PAGE
   ============================================================ */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#cName').value.trim();
    const email = form.querySelector('#cEmail').value.trim();
    const subject = form.querySelector('#cSubject').value;
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please fill your name and a valid email.', 'err');
      return;
    }
    form.reset();
    showToast('✅ Message sent to ' + (subject || 'Aarbi team') + '! We\u2019ll reply within 24 hours.', 'ok');
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateCounts();
  initHeader();
  initReveal();
  initShared();
  initShopEvents();
  initCartPage();
  initContactPage();
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
});
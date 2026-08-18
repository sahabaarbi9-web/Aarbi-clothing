/* ============================================================
   AARBI CLOTHING — Product Data + AI-Powered Categorization
   Simulated smart AI: each product is auto-grouped into
   Category → Section → Subcategory (or Age Group for kids).
   ============================================================ */

const CATEGORY_META = {
  male:   { label: 'Male',   icon: '👔', sections: ['Shirts', 'Pants', 'Shoes'] },
  female: { label: 'Female', icon: '👗', sections: ['Shalwar Kameez', 'Purses', 'Heels'] },
  kids:   { label: 'Kids',   icon: '🧒', sections: ['0–2 Years', '3–5 Years', '6–8 Years', '9–12 Years', '13–16 Years'] }
};

const SUBCATS = {
  'Shirts': ['T-Shirts', 'Polo Shirts', 'Full-Sleeve Shirts', 'Casual Shirts', 'Formal Shirts'],
  'Pants': ['Jeans', 'Joggers', 'Trousers', 'Cargo Pants', 'Shorts'],
  'Shoes': ['Sneakers', 'Running Shoes', 'Sandals', 'Loafers', 'Formal Shoes'],
  'Shalwar Kameez': ['Casual', 'Formal', 'Lawn', 'Embroidered', 'Party Wear'],
  'Purses': ['Handbags', 'Tote Bags', 'Clutches', 'Shoulder Bags', 'Crossbody Bags'],
  'Heels': ['High Heels', 'Block Heels', 'Wedge Heels', 'Pumps', 'Sandal Heels']
};

const KID_AGE_GROUPS = [
  { label: '0–2 Years', re: /0-?2|baby|infant|newborn|toddler/i, sizes: ['0-3M', '3-6M', '6-12M', '1-2Y'] },
  { label: '3–5 Years', re: /3-?5|3-5\s*years|preschool/i,       sizes: ['2-3Y', '3-4Y', '4-5Y'] },
  { label: '6–8 Years', re: /6-?8|elementary/i,                  sizes: ['5-6Y', '6-7Y', '7-8Y'] },
  { label: '9–12 Years', re: /9-?12|tween|preteen/i,             sizes: ['9-10Y', '10-11Y', '11-12Y'] },
  { label: '13–16 Years', re: /13-?16|teen|teenage|teenager/i,   sizes: ['13-14Y', '15-16Y'] }
];

const EMOJI = {
  'T-Shirts': '👕', 'Polo Shirts': '👕', 'Full-Sleeve Shirts': '👔',
  'Casual Shirts': '👔', 'Formal Shirts': '🤵',
  'Jeans': '👖', 'Joggers': '👖', 'Trousers': '👖', 'Cargo Pants': '👖', 'Shorts': '🩳',
  'Sneakers': '👟', 'Running Shoes': '👟', 'Sandals': '🩴', 'Loafers': '🥿', 'Formal Shoes': '👞',
  'Casual': '👗', 'Formal': '👗', 'Lawn': '🪷', 'Embroidered': '✨', 'Party Wear': '🎀',
  'Handbags': '👜', 'Tote Bags': '🛍️', 'Clutches': '👛', 'Shoulder Bags': '👜', 'Crossbody Bags': '👝',
  'High Heels': '👠', 'Block Heels': '👠', 'Wedge Heels': '👠', 'Pumps': '👠', 'Sandal Heels': '👡',
  'Clothing': '👕', 'Footwear': '👟', 'Accessories': '🎒',
  '0–2 Years': '👶', '3–5 Years': '🧒', '6–8 Years': '🧒', '9–12 Years': '🧑', '13–16 Years': '🧑',
  fallback: '🛍️'
};

const CATEGORY_PALETTES = {
  male: ['#eef1f5', '#dbe3ec'],
  female: ['#fdf0f3', '#f3d9e1'],
  kids: ['#edf6ee', '#d8ecd9'],
  fallback: ['#f7f5f2', '#efe6d8']
};

/* ---------- SVG image generator (self-contained product images) ---------- */
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function makeAarbiImage(p) {
  const pal = CATEGORY_PALETTES[p.category] || CATEGORY_PALETTES.fallback;
  const emoji = EMOJI[p.subcategory] || EMOJI.fallback;
  const name = escapeXml(p.name.length > 26 ? p.name.slice(0, 25) + '…' : p.name);
  const sub = escapeXml(p.section || '');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="600" height="600" fill="url(#bg)"/>' +
    '<circle cx="520" cy="80" r="135" fill="#ffffff" opacity="0.35"/>' +
    '<circle cx="70" cy="545" r="155" fill="#ffffff" opacity="0.25"/>' +
    '<circle cx="300" cy="262" r="152" fill="#ffffff" opacity="0.88"/>' +
    '<circle cx="300" cy="262" r="152" fill="none" stroke="#b9864f" stroke-width="2" opacity="0.5"/>' +
    '<text x="300" y="308" font-size="148" text-anchor="middle">' + emoji + '</text>' +
    '<text x="300" y="458" font-family="Georgia, serif" font-size="33" font-weight="700" fill="#26221c" text-anchor="middle">' + name + '</text>' +
    '<text x="300" y="498" font-family="Arial, sans-serif" font-size="19" letter-spacing="5" fill="#8f6537" text-anchor="middle">' + sub + '</text>' +
    '<text x="300" y="540" font-family="Arial, sans-serif" font-size="13" letter-spacing="4" fill="#b9b3ab" text-anchor="middle">AARBI CLOTHING</text>' +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------- Raw product feed (the "AI" reads this) ---------- */
const RAW_PRODUCTS = [
  { id: 1,  name: 'Classic Crew Neck T-Shirt', hint: 'male crew tee cotton',
    price: 1499, oldPrice: 1999, rating: 4.5, reviews: 214, tag: 'new',
    colors: [['Black', '#1c1c1c'], ['White', '#f4f4f4'], ['Navy', '#2c3e6b']], sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 2,  name: 'Sport Polo Shirt', hint: 'polo shirt mens',
    price: 1899, oldPrice: 2499, rating: 4.3, reviews: 156, tag: null,
    colors: [['Olive', '#5c6248'], ['Grey', '#9a9a9a'], ['Navy', '#2c3e6b']], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 3,  name: 'Oxford Full-Sleeve Shirt', hint: 'full sleeve shirt oxford',
    price: 2999, oldPrice: null, rating: 4.6, reviews: 98, tag: null,
    colors: [['White', '#f4f4f4'], ['Sky Blue', '#a8c7e0']], sizes: ['M', 'L', 'XL', 'XXL'] },
  { id: 4,  name: 'Slim Fit Casual Shirt', hint: 'casual shirt slim fit',
    price: 2799, oldPrice: 3299, rating: 4.4, reviews: 187, tag: null,
    colors: [['Beige', '#d9c5a3'], ['Charcoal', '#3a3a3a'], ['Burgundy', '#6d2b34']], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 5,  name: 'Executive Formal Shirt', hint: 'formal shirt office',
    price: 3499, oldPrice: null, rating: 4.7, reviews: 132, tag: 'new',
    colors: [['White', '#f4f4f4'], ['Light Blue', '#c3d4e2']], sizes: ['M', 'L', 'XL', 'XXL'] },
  { id: 6,  name: 'Vintage Skinny Jeans', hint: 'denim jeans skinny',
    price: 3999, oldPrice: 4999, rating: 4.6, reviews: 301, tag: 'sale',
    colors: [['Indigo', '#33407a'], ['Black', '#1c1c1c']], sizes: ['28', '30', '32', '34', '36'] },
  { id: 7,  name: 'Flex Comfort Joggers', hint: 'joggers sweatpants',
    price: 2599, oldPrice: null, rating: 4.4, reviews: 145, tag: null,
    colors: [['Grey', '#9a9a9a'], ['Black', '#1c1c1c'], ['Olive', '#5c6248']], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 8,  name: 'Tailored Slim Trousers', hint: 'trousers chino pants',
    price: 3299, oldPrice: 3899, rating: 4.5, reviews: 87, tag: null,
    colors: [['Charcoal', '#3a3a3a'], ['Navy', '#2c3e6b']], sizes: ['30', '32', '34', '36'] },
  { id: 9,  name: 'Utility Cargo Pants', hint: 'cargo pants pockets',
    price: 3599, oldPrice: null, rating: 4.6, reviews: 203, tag: null,
    colors: [['Khaki', '#b3a47d'], ['Black', '#1c1c1c'], ['Forest', '#3a5a3a']], sizes: ['30', '32', '34', '36', '38'] },
  { id: 10, name: 'Weekend Cotton Shorts', hint: 'casual shorts cotton',
    price: 1799, oldPrice: 2199, rating: 4.2, reviews: 119, tag: null,
    colors: [['Beige', '#d9c5a3'], ['Navy', '#2c3e6b']], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 11, name: 'Urban Knit Sneakers', hint: 'sneakers knit casual',
    price: 4499, oldPrice: 5499, rating: 4.7, reviews: 264, tag: 'new',
    colors: [['White', '#f4f4f4'], ['Grey', '#9a9a9a']], sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'] },
  { id: 12, name: 'AirFlex Running Shoes', hint: 'running shoes sports',
    price: 5499, oldPrice: 6599, rating: 4.8, reviews: 342, tag: 'sale',
    colors: [['Neon Green', '#8fd14f'], ['Black', '#1c1c1c']], sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] },
  { id: 13, name: 'Breeze Leather Sandals', hint: 'sandals leather summer',
    price: 2499, oldPrice: null, rating: 4.3, reviews: 76, tag: null,
    colors: [['Tan', '#b98a4f'], ['Brown', '#5f4433']], sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] },
  { id: 14, name: 'Gancini Penny Loafers', hint: 'loafers slip on',
    price: 4299, oldPrice: null, rating: 4.5, reviews: 94, tag: null,
    colors: [['Black', '#1c1c1c'], ['Tan', '#b98a4f']], sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] },
  { id: 15, name: 'Classic Derby Formal Shoes', hint: 'formal shoes leather',
    price: 5499, oldPrice: 6499, rating: 4.7, reviews: 158, tag: 'new',
    colors: [['Black', '#1c1c1c'], ['Brown', '#5f4433']], sizes: ['UK 8', 'UK 9', 'UK 10', 'UK 11'] }
];

/* Female — appended to RAW_PRODUCTS */
RAW_PRODUCTS.push(
  { id: 16, name: 'Everyday Casual Shalwar Kameez', hint: 'shalwar kameez casual women',
    price: 3499, oldPrice: 4299, rating: 4.6, reviews: 231, tag: null,
    colors: [['Beige', '#d9c5a3'], ['Mint', '#a5d6b8'], ['Dusty Rose', '#c99a9a']], sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 17, name: 'Formal Silk Shalwar Kameez', hint: 'shalwar kameez formal silk',
    price: 5499, oldPrice: 6499, rating: 4.8, reviews: 178, tag: 'new',
    colors: [['Emerald', '#2f6d52'], ['Maroon', '#6d2b34'], ['Royal Blue', '#2c4a8c']], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 18, name: 'Summer Lawn Suit', hint: 'lawn suit summer floral',
    price: 2999, oldPrice: 3699, rating: 4.5, reviews: 312, tag: 'sale',
    colors: [['Pastel Pink', '#f0c3cd'], ['Sky Blue', '#a8c7e0']], sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 19, name: 'Hand-Embroidered Kameez', hint: 'embroidered shalwar kameez festiv',
    price: 7499, oldPrice: 8999, rating: 4.9, reviews: 145, tag: 'new',
    colors: [['Ivory', '#f5efe2'], ['Deep Teal', '#14636c']], sizes: ['M', 'L', 'XL'] },
  { id: 20, name: 'Party Wear Chiffon Set', hint: 'party wear chiffon shalwar',
    price: 6499, oldPrice: 7999, rating: 4.7, reviews: 189, tag: 'sale',
    colors: [['Gold', '#c9a227'], ['Charcoal', '#3a3a3a'], ['Blush', '#e7b1b8']], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 21, name: 'Tuscany Handbag', hint: 'handbag women leather',
    price: 4299, oldPrice: 5299, rating: 4.6, reviews: 96, tag: null,
    colors: [['Tan', '#b98a4f'], ['Black', '#1c1c1c']], sizes: ['One Size'] },
  { id: 22, name: 'Everyday Tote Bag', hint: 'tote bag large women',
    price: 3499, oldPrice: null, rating: 4.4, reviews: 74, tag: null,
    colors: [['Oat', '#e8dcc4'], ['Black', '#1c1c1c'], ['Bottle Green', '#2f6d52']], sizes: ['One Size'] },
  { id: 23, name: 'Evening Clutch', hint: 'clutch bag evening',
    price: 2799, oldPrice: 3299, rating: 4.3, reviews: 61, tag: null,
    colors: [['Silver', '#c9ccd1'], ['Gold', '#c9a227']], sizes: ['One Size'] },
  { id: 24, name: 'Metro Shoulder Bag', hint: 'shoulder bag women',
    price: 3899, oldPrice: 4599, rating: 4.5, reviews: 112, tag: null,
    colors: [['Camel', '#b08d57'], ['Black', '#1c1c1c']], sizes: ['One Size'] },
  { id: 25, name: 'Mini Crossbody Bag', hint: 'crossbody bag compact',
    price: 3199, oldPrice: 3799, rating: 4.6, reviews: 133, tag: 'new',
    colors: [['Amber', '#cf8450'], ['Navy', '#2c3e6b']], sizes: ['One Size'] },
  { id: 26, name: 'Stiletto High Heels', hint: 'high heels stiletto women',
    price: 4999, oldPrice: 5999, rating: 4.7, reviews: 142, tag: 'new',
    colors: [['Black', '#1c1c1c'], ['Nude', '#d9b39a']], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40'] },
  { id: 27, name: 'Classic Block Heels', hint: 'block heels comfortable',
    price: 4299, oldPrice: 5099, rating: 4.5, reviews: 118, tag: null,
    colors: [['Tan', '#b98a4f'], ['Black', '#1c1c1c']], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40'] },
  { id: 28, name: 'Boho Wedge Heels', hint: 'wedge heels summer',
    price: 4599, oldPrice: null, rating: 4.4, reviews: 87, tag: null,
    colors: [['Jute', '#c9a96e'], ['Olive', '#5c6248']], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39'] },
  { id: 29, name: 'Satin Pumps', hint: 'pumps formal satin',
    price: 5299, oldPrice: 6199, rating: 4.8, reviews: 167, tag: 'sale',
    colors: [['Blush', '#e7b1b8'], ['Black', '#1c1c1c'], ['Emerald', '#2f6d52']], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40'] },
  { id: 30, name: 'Strappy Sandal Heels', hint: 'sandal heels strappy',
    price: 3799, oldPrice: 4499, rating: 4.5, reviews: 104, tag: null,
    colors: [['Gold', '#c9a227'], ['Black', '#1c1c1c']], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39'] }
);

/* Kids — appended to RAW_PRODUCTS */
RAW_PRODUCTS.push(
  { id: 31, name: 'Baby Bodysuit Set (0-2)', hint: 'baby bodysuit newborn 0-2 years',
    price: 1299, oldPrice: 1599, rating: 4.8, reviews: 265, tag: 'new',
    colors: [['White', '#f4f4f4'], ['Lemon', '#f4e17d'], ['Peach', '#f7c9b6']], sizes: ['0-3M', '3-6M', '6-12M'] },
  { id: 32, name: 'Soft Cotton Romper (0-2)', hint: 'romper toddler baby 0-2 years',
    price: 1399, oldPrice: null, rating: 4.6, reviews: 178, tag: null,
    colors: [['Mint', '#a5d6b8'], ['Grey', '#9a9a9a'], ['Rose', '#e7b1b8']], sizes: ['3-6M', '6-12M', '1-2Y'] },
  { id: 33, name: 'Toddler Sleepsuits 2-Pack (0-2)', hint: 'sleepsuit infant 0-2 years',
    price: 1699, oldPrice: 1999, rating: 4.7, reviews: 142, tag: null,
    colors: [['Cloud', '#e4ecf2'], ['Mint', '#a5d6b8']], sizes: ['0-3M', '3-6M', '6-12M', '1-2Y'] },
  { id: 34, name: 'Baby Knit Booties (0-2)', hint: 'booties baby 0-2 years',
    price: 899, oldPrice: null, rating: 4.5, reviews: 96, tag: 'new',
    colors: [['Cream', '#f5efe2'], ['Sage', '#b7c4a8']], sizes: ['0-6M', '6-12M', '1-2Y'] },
  { id: 35, name: 'Little Explorer Set (3-5)', hint: 'kids shirt shorts set 3-5 years',
    price: 1799, oldPrice: 2199, rating: 4.7, reviews: 203, tag: 'new',
    colors: [['Sky Blue', '#a8c7e0'], ['Khaki', '#b3a47d']], sizes: ['2-3Y', '3-4Y', '4-5Y'] },
  { id: 36, name: 'Rainbow Party Dress (3-5)', hint: 'girls dress party 3-5 years',
    price: 2499, oldPrice: 2999, rating: 4.8, reviews: 156, tag: 'sale',
    colors: [['Multi', '#e8b4c8'], ['Coral', '#f2a48c']], sizes: ['2-3Y', '3-4Y', '4-5Y'] },
  { id: 37, name: 'Comfy Tee & Jean Set (3-5)', hint: 'kids tshirt jeans 3-5 years',
    price: 1999, oldPrice: null, rating: 4.6, reviews: 121, tag: null,
    colors: [['Grey', '#9a9a9a'], ['Navy', '#2c3e6b']], sizes: ['2-3Y', '3-4Y', '4-5Y'] },
  { id: 38, name: 'Kids Running Sneakers (3-5)', hint: 'kids sneakers 3-5 years',
    price: 2299, oldPrice: 2699, rating: 4.5, reviews: 88, tag: null,
    colors: [['White', '#f4f4f4'], ['Lemon', '#f4e17d']], sizes: ['2-3Y', '3-4Y', '4-5Y'] },
  { id: 39, name: 'Adventure Cargo Set (6-8)', hint: 'kids cargo jogger 6-8 years',
    price: 2299, oldPrice: 2799, rating: 4.6, reviews: 134, tag: null,
    colors: [['Olive', '#5c6248'], ['Black', '#1c1c1c']], sizes: ['5-6Y', '6-7Y', '7-8Y'] },
  { id: 40, name: 'Cricket Jersey (6-8)', hint: 'kids sport jersey 6-8 years',
    price: 1599, oldPrice: 1899, rating: 4.7, reviews: 117, tag: 'new',
    colors: [['Green', '#3a6b3a'], ['Blue', '#2c4a8c']], sizes: ['5-6Y', '6-7Y', '7-8Y'] },
  { id: 41, name: 'Denim Skirt & Top Set (6-8)', hint: 'girls skirt set 6-8 years',
    price: 2599, oldPrice: 3099, rating: 4.7, reviews: 98, tag: null,
    colors: [['Denim', '#4d6bb0'], ['White', '#f4f4f4']], sizes: ['5-6Y', '6-7Y', '7-8Y'] },
  { id: 42, name: 'Kids Sport Sandals (6-8)', hint: 'kids sandals 6-8 years',
    price: 1699, oldPrice: null, rating: 4.4, reviews: 74, tag: null,
    colors: [['Navy', '#2c3e6b'], ['Red', '#a0322c']], sizes: ['5-6Y', '6-7Y', '7-8Y'] },
  { id: 43, name: 'Hooded Sweatshirt (9-12)', hint: 'kids hoodie 9-12 years',
    price: 2499, oldPrice: 2999, rating: 4.6, reviews: 167, tag: 'new',
    colors: [['Charcoal', '#3a3a3a'], ['Burgundy', '#6d2b34'], ['Navy', '#2c3e6b']], sizes: ['9-10Y', '10-11Y', '11-12Y'] },
  { id: 44, name: 'Teen Slim Jeans (9-12)', hint: 'kids jeans tween 9-12 years',
    price: 2699, oldPrice: null, rating: 4.5, reviews: 109, tag: null,
    colors: [['Indigo', '#33407a'], ['Black', '#1c1c1c']], sizes: ['9-10Y', '10-11Y', '11-12Y'] },
  { id: 45, name: 'Sports Training Shoes (9-12)', hint: 'kids training shoes 9-12 years',
    price: 3199, oldPrice: 3799, rating: 4.7, reviews: 143, tag: 'sale',
    colors: [['Black', '#1c1c1c'], ['Neon', '#8fd14f']], sizes: ['9-10Y', '10-11Y', '11-12Y'] },
  { id: 46, name: 'Boys Smart Formal Shirt (9-12)', hint: 'kids formal shirt 9-12 years',
    price: 2499, oldPrice: 2899, rating: 4.5, reviews: 81, tag: null,
    colors: [['White', '#f4f4f4'], ['Light Blue', '#c3d4e2']], sizes: ['9-10Y', '10-11Y', '11-12Y'] },
  { id: 47, name: 'Streetwear Oversized Tee (13-16)', hint: 'teens streetwear 13-16 years',
    price: 1799, oldPrice: 2199, rating: 4.7, reviews: 192, tag: 'new',
    colors: [['Black', '#1c1c1c'], ['Sand', '#d9c5a3']], sizes: ['13-14Y', '15-16Y'] },
  { id: 48, name: 'Trendy Denim Jacket (13-16)', hint: 'teens denim jacket 13-16 years',
    price: 3499, oldPrice: 4199, rating: 4.8, reviews: 128, tag: 'sale',
    colors: [['Washed Blue', '#7d9bd1'], ['Black', '#1c1c1c']], sizes: ['13-14Y', '15-16Y'] },
  { id: 49, name: 'Casual Varsity Jacket (13-16)', hint: 'teens varsity jacket 13-16 years',
    price: 3899, oldPrice: null, rating: 4.6, reviews: 87, tag: 'new',
    colors: [['Navy', '#2c3e6b'], ['Cream', '#f5efe2']], sizes: ['13-14Y', '15-16Y'] },
  { id: 50, name: 'Sling Bag & Heels Set (13-16)', hint: 'teens bag heels 13-16 years',
    price: 2999, oldPrice: 3599, rating: 4.6, reviews: 76, tag: null,
    colors: [['Pink', '#d98aa8'], ['Black', '#1c1c1c']], sizes: ['One Size'] }
);

/* ============================================================
   AI-Powered Categorization Engine
   Reads each product's name + hints and automatically assigns:
   category → section → subcategory (or age group for kids).
   ============================================================ */

const KID_RANGE_MAP = [
  { label: '0–2 Years',  lo: 0,  hi: 2 },
  { label: '3–5 Years',  lo: 3,  hi: 5 },
  { label: '6–8 Years',  lo: 6,  hi: 8 },
  { label: '9–12 Years', lo: 9,  hi: 12 },
  { label: '13–16 Years', lo: 13, hi: 16 }
];

function aiCategorize(raw) {
  const t = (raw.name + ' ' + (raw.hint || '')).toLowerCase();
  const out = Object.assign({}, raw);

  /* ---- Step 1 · detect main category ---- */
  if (/(baby|infant|newborn|toddler|kid\b|kids|child|children|girls|boys|teen|tween|\d{1,2}-\d{1,2}\s*years|\/\d{1,2}-\d{1,2}\/)/.test(t)) {
    out.category = 'kids';
  } else if (/(women|woman|female|ladies|shalwar|kameez|lawn|handbag|tote|clutch|shoulder bag|crossbody|heels|pumps|wedge|sandal heel)/.test(t)) {
    out.category = 'female';
  } else {
    out.category = 'male';
  }

  /* ---- Step 2 · kids → age group + item type ---- */
  if (out.category === 'kids') {
    const m = raw.name.match(/\((\d{1,2})-(\d{1,2})\)/);
    let grp = null;
    if (m) grp = KID_RANGE_MAP.find(g => +m[1] >= g.lo && +m[2] <= g.hi);
    if (!grp) grp = KID_RANGE_MAP.find(g => KID_AGE_GROUPS.find(a => a.label === g.label).re.test(t));
    out.section = grp ? grp.label : '6–8 Years';
    out.ageGroup = out.section;
    if (/(shoe|sneaker|sandal|bootie|boot|trainer)/.test(t)) out.subcategory = 'Footwear';
    else if (/(bag|sling|purse)/.test(t)) out.subcategory = 'Accessories';
    else out.subcategory = 'Clothing';
  }

  /* ---- Step 3 · male → section + subcategory ---- */
  if (out.category === 'male') {
    if (/(shirt|tshirt|t-shirt|tee|polo|crew|oxford|sleeve)/.test(t)) {
      out.section = 'Shirts';
      if (/tshirt|t-shirt|\btee\b|crew/.test(t)) out.subcategory = 'T-Shirts';
      else if (/polo/.test(t)) out.subcategory = 'Polo Shirts';
      else if (/full sleeve|full-sleeve|oxford/.test(t)) out.subcategory = 'Full-Sleeve Shirts';
      else if (/formal|executive/.test(t)) out.subcategory = 'Formal Shirts';
      else out.subcategory = 'Casual Shirts';
    } else if (/(jean|denim|jogger|sweatpant|trouser|chino|cargo|short|pant)/.test(t)) {
      out.section = 'Pants';
      if (/jean|denim|skinny/.test(t)) out.subcategory = 'Jeans';
      else if (/jogger|sweatpant/.test(t)) out.subcategory = 'Joggers';
      else if (/trouser|chino/.test(t)) out.subcategory = 'Trousers';
      else if (/cargo/.test(t)) out.subcategory = 'Cargo Pants';
      else if (/short/.test(t)) out.subcategory = 'Shorts';
      else out.subcategory = 'Trousers';
    } else if (/(shoe|sneaker|sandal|loafer|derby)/.test(t)) {
      out.section = 'Shoes';
      if (/sneaker/.test(t)) out.subcategory = 'Sneakers';
      else if (/running/.test(t)) out.subcategory = 'Running Shoes';
      else if (/sandal/.test(t)) out.subcategory = 'Sandals';
      else if (/loafer/.test(t)) out.subcategory = 'Loafers';
      else if (/formal|derby/.test(t)) out.subcategory = 'Formal Shoes';
      else out.subcategory = 'Sneakers';
    } else {
      out.section = 'Shirts';
      out.subcategory = 'Casual Shirts';
    }
  }

  /* ---- Step 4 · female → section + subcategory ---- */
  if (out.category === 'female') {
    if (/(shalwar|kameez|lawn|chiffon|embroider|party wear)/.test(t)) {
      out.section = 'Shalwar Kameez';
      if (/lawn/.test(t)) out.subcategory = 'Lawn';
      else if (/embroider/.test(t)) out.subcategory = 'Embroidered';
      else if (/party wear|chiffon/.test(t)) out.subcategory = 'Party Wear';
      else if (/formal/.test(t)) out.subcategory = 'Formal';
      else out.subcategory = 'Casual';
    } else if (/(handbag|tote|clutch|shoulder bag|crossbody|bag)/.test(t)) {
      out.section = 'Purses';
      if (/tote/.test(t)) out.subcategory = 'Tote Bags';
      else if (/clutch/.test(t)) out.subcategory = 'Clutches';
      else if (/shoulder/.test(t)) out.subcategory = 'Shoulder Bags';
      else if (/crossbody/.test(t)) out.subcategory = 'Crossbody Bags';
      else if (/handbag/.test(t)) out.subcategory = 'Handbags';
      else out.subcategory = 'Handbags';
    } else if (/(heel|pump|wedge|stiletto|sandal heel)/.test(t)) {
      out.section = 'Heels';
      if (/block/.test(t)) out.subcategory = 'Block Heels';
      else if (/wedge/.test(t)) out.subcategory = 'Wedge Heels';
      else if (/pump/.test(t)) out.subcategory = 'Pumps';
      else if (/sandal heel/.test(t)) out.subcategory = 'Sandal Heels';
      else if (/high heel|stiletto/.test(t)) out.subcategory = 'High Heels';
      else out.subcategory = 'High Heels';
    } else {
      out.section = 'Shalwar Kameez';
      out.subcategory = 'Casual';
    }
  }

  /* ---- Step 5 · finalize ---- */
  out.emoji = EMOJI[out.subcategory] || EMOJI.fallback;
  out.image = makeAarbiImage(out);
  out.discount = out.oldPrice ? Math.round((1 - out.price / out.oldPrice) * 100) : 0;
  return out;
}

/* ---------- Final product list + helpers ---------- */
const PRODUCTS = RAW_PRODUCTS.map(aiCategorize);

const fmtPrice = (n) => 'Rs. ' + Number(n).toLocaleString('en-US');

function getSections(category) {
  if (category === 'all') return ['All'];
  return CATEGORY_META[category].sections;
}

function getSubcats(category, section) {
  if (category === 'kids') return null;
  return SUBCATS[section] || [];
}
// admin.js — Local version with category loading, default display, search, and export

let products = [];
let filteredProducts = [];
const productsContainer = document.getElementById('productsContainer');
const categorySelect = document.getElementById('categorySelect');
const subcategorySelect = document.getElementById('subcategorySelect');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');
const formContainer = document.getElementById('addForm');
const form = document.getElementById('productForm');
const toggleAdd = document.getElementById('toggleAdd');
const cancelBtn = document.getElementById('cancelBtn');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

let editingId = null;

// Load products.json on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('products.json');
    products = await response.json();
    filteredProducts = [...products];

    populateCategorySelect();
    renderProducts(products);
  } catch (error) {
    console.error('Error loading products.json:', error);
    productsContainer.innerHTML = '<p style="text-align:center;color:#999;">Failed to load products.json</p>';
  }
});

// Populate categories dynamically
function populateCategorySelect() {
  const categories = [...new Set(products.map(p => p.category))].sort();
  categorySelect.innerHTML = '<option value="">All categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// Populate subcategories dynamically based on selected category
categorySelect.addEventListener('change', () => {
  const selectedCategory = categorySelect.value;
  if (!selectedCategory) {
    subcategorySelect.innerHTML = '<option value="">All subcategories</option>';
    subcategorySelect.disabled = true;
    renderProducts(products);
    return;
  }

  const subs = [...new Set(products
    .filter(p => p.category === selectedCategory)
    .map(p => p.subcategory))].sort();

  subcategorySelect.innerHTML = '<option value="">All subcategories</option>';
  subs.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.textContent = sub;
    subcategorySelect.appendChild(opt);
  });
  subcategorySelect.disabled = false;

  filterProducts();
});

// Filter by subcategory
subcategorySelect.addEventListener('change', filterProducts);

// Search functionality
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.subcategory.toLowerCase().includes(query)
  );
  renderProducts(filteredProducts);
});

// Filtering logic
function filterProducts() {
  const cat = categorySelect.value;
  const sub = subcategorySelect.value;
  filteredProducts = products.filter(p => {
    const catMatch = !cat || p.category === cat;
    const subMatch = !sub || p.subcategory === sub;
    return catMatch && subMatch;
  });
  renderProducts(filteredProducts);
}

// Render product cards
function renderProducts(list) {
  productsContainer.innerHTML = '';
  if (!list.length) {
    resultsCount.textContent = 'No products found';
    return;
  }

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${p.image || 'https://via.placeholder.com/200'}" alt="${p.name}">
      </div>
      <div class="product-info">
        <div>
          <div class="product-name">${p.name}</div>
          <div class="product-price">RWF ${p.price.toLocaleString()}</div>
        </div>
        <div class="product-actions">
          <button class="small-btn edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="small-btn delete" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  resultsCount.textContent = `${list.length} product${list.length !== 1 ? 's' : ''} displayed`;
}

// Show/hide Add form
toggleAdd.addEventListener('click', () => {
  formContainer.style.display = formContainer.style.display === 'block' ? 'none' : 'block';
  form.reset();
  editingId = null;
});

cancelBtn.addEventListener('click', () => {
  formContainer.style.display = 'none';
  form.reset();
  editingId = null;
});

// Handle form submission
form.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('pName').value.trim();
  const price = parseFloat(document.getElementById('pPrice').value);
  const image = document.getElementById('pImage').value.trim();
  const category = document.getElementById('pCategory').value;
  const subcategory = document.getElementById('pSubcategory').value;

  if (!name || !price || !category || !subcategory) {
    alert('Please fill all required fields.');
    return;
  }

  if (editingId) {
    const index = products.findIndex(p => p.id === editingId);
    products[index] = { id: editingId, name, price, image, category, subcategory };
    editingId = null;
  } else {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, price, image, category, subcategory });
  }

  form.reset();
  formContainer.style.display = 'none';
  populateCategorySelect();
  renderProducts(products);
});

// Edit product
function editProduct(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  formContainer.style.display = 'block';
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pImage').value = p.image;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pSubcategory').value = p.subcategory;
  editingId = id;
}

// Delete product
function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  products = products.filter(p => p.id !== id);
  renderProducts(products);
}

// Export JSON
exportBtn.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
  const dl = document.createElement('a');
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", "products.json");
  dl.click();
});

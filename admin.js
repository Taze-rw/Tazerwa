let products = [];
let filteredProducts = [];
let editingProductId = null;

// ✅ Load products from products.json
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    products = data.products || [];
    filteredProducts = [...products];
    displayProducts(filteredProducts);
    loadCategories();
  } catch (error) {
    console.error("Error loading products.json:", error);
  }
}

// ✅ Display all products in table or grid
function displayProducts(list) {
  const container = document.getElementById('productList');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p style="text-align:center">No products found.</p>';
    return;
  }

  list.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'product-item';
    row.innerHTML = `
      <img src="${p.image || 'img/placeholder.jpg'}" alt="${p.name}" class="product-image">
      <div class="product-details">
        <h4>${p.name}</h4>
        <p><strong>Category:</strong> ${p.category}</p>
        <p><strong>Subcategory:</strong> ${p.subcategory}</p>
        <p><strong>Price:</strong> ${p.price} RWF</p>
      </div>
      <div class="product-actions">
        <button class="btn btn-sm btn-primary" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    `;
    container.appendChild(row);
  });
}

// ✅ Load unique categories & subcategories into select
function loadCategories() {
  const categorySelect = document.getElementById('pCategory');
  const subcategorySelect = document.getElementById('pSubcategory');

  const categories = [...new Set(products.map(p => p.category))];
  categorySelect.innerHTML = '<option value="">Select category</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  categorySelect.addEventListener('change', () => {
    const selected = categorySelect.value;
    const subs = [...new Set(products.filter(p => p.category === selected).map(p => p.subcategory))];
    subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
    subs.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      subcategorySelect.appendChild(opt);
    });
  });
}

// ✅ Handle Add/Edit Form
const form = document.getElementById('productForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = editingProductId || Date.now();
  const newProduct = {
    id,
    name: document.getElementById('pName').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    image: document.getElementById('pImage').value.trim(),
    category: document.getElementById('pCategory').value,
    subcategory: document.getElementById('pSubcategory').value
  };

  if (editingProductId) {
    const index = products.findIndex(p => p.id === editingProductId);
    products[index] = newProduct;
    editingProductId = null;
  } else {
    products.push(newProduct);
  }

  filteredProducts = [...products];
  displayProducts(filteredProducts);
  form.reset();
  document.getElementById('addForm').style.display = 'none';
});

// ✅ Edit product
function editProduct(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;

  editingProductId = id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pImage').value = p.image;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pSubcategory').value = p.subcategory;
  document.getElementById('addForm').style.display = 'block';
}

// ✅ Delete product
function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  products = products.filter(p => p.id !== id);
  filteredProducts = [...products];
  displayProducts(filteredProducts);
}

// ✅ Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm) ||
    p.subcategory.toLowerCase().includes(searchTerm)
  );
  displayProducts(filteredProducts);
});

// ✅ Export JSON (downloads updated products)
document.getElementById('exportBtn').addEventListener('click', () => {
  const dataStr = JSON.stringify({ products }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "products.json";
  a.click();
  URL.revokeObjectURL(url);
});

// ✅ Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
  form.reset();
  editingProductId = null;
  document.getElementById('addForm').style.display = 'none';
});

// ✅ Show form
document.getElementById('showAddFormBtn')?.addEventListener('click', () => {
  document.getElementById('addForm').style.display = 'block';
});

// ✅ Initialize
loadProducts();

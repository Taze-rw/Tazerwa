let products = [];
let editingProductId = null;

// Example category map (update as needed)
const categoryMap = {
  "Food": [
    "Vegetables","Fruits","Canned Foods","Cooking Foods","Local Fresh Produce",
    "Edible Oil","Flour","Powder","Grains","Spices & Ingredients","Pasta",
    "Sugar & Salt","Meat Fish Chicken & Poultry","Breakfast & Dairy",
    "Chocolate Snacks & Biscuits"
  ],
  "Drinks": [
    "Water","Hot Drinks","Cold Drinks","Carbonated Drinks",
    "Dairy-Based Drinks","Non Alcoholic Categories"
  ],
  "Beauty": ["Skincare","Makeup","Haircare","Personal Care"],
  "Gifts": ["Flowers","Gift Ideas","Sweet Gift"],
  "Baby Stuff": [
    "Mother Care","Bell & Toys","Baby Hygiene","Baby Essentials",
    "Baby Food & Drinks","Wipes & Diapers"
  ],
  "Hot Deals": ["Veggie Boost","Snacks Time","Sip & Bite","Family Choice","Your 5 Choice Pack"]
};

// Load JSON data
async function loadProducts() {
  try {
    const res = await fetch("products.json");
    const data = await res.json();
    products = data.products || [];
    populateCategories();
    displayProducts(products);
  } catch (err) {
    console.error("Error loading products.json:", err);
  }
}

// Display all products
function displayProducts(list) {
  const container = document.getElementById("productList");
  if (!container) return;
  container.innerHTML = "";

  list.forEach(p => {
    const item = document.createElement("div");
    item.className = "product-item";
    item.innerHTML = `
      <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
      <div class="product-details">
        <h4>${p.name}</h4>
        <p>${p.category} — ${p.subcategory}</p>
        <p><strong>${p.price.toLocaleString()} RWF</strong></p>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    `;
    container.appendChild(item);
  });
}

// Populate category select fields
function populateCategories() {
  const catSelect = document.getElementById("pCategory");
  if (!catSelect) return;
  catSelect.innerHTML = "<option value=''>Select category</option>";
  for (let cat in categoryMap) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  }
}

// Populate subcategories dynamically
function populateSubcategories(category) {
  const subSelect = document.getElementById("pSubcategory");
  subSelect.innerHTML = "<option value=''>Select subcategory</option>";
  if (category && categoryMap[category]) {
    categoryMap[category].forEach(sc => {
      const opt = document.createElement("option");
      opt.value = sc;
      opt.textContent = sc;
      subSelect.appendChild(opt);
    });
  }
}

// Category change listener
document.addEventListener("change", e => {
  if (e.target.id === "pCategory") {
    populateSubcategories(e.target.value);
  }
});

// Handle Add/Edit Form
document.getElementById("productForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const image = document.getElementById("pImage").value.trim();
  const category = document.getElementById("pCategory").value;
  const subcategory = document.getElementById("pSubcategory").value;

  if (!name || !price || !category || !subcategory) {
    alert("Please fill in all required fields.");
    return;
  }

  if (editingProductId) {
    const prod = products.find(p => p.id === editingProductId);
    if (prod) {
      prod.name = name;
      prod.price = price;
      prod.image = image;
      prod.category = category;
      prod.subcategory = subcategory;
    }
    editingProductId = null;
  } else {
    const newProduct = {
      id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name, price, image, category, subcategory
    };
    products.push(newProduct);
  }

  displayProducts(products);
  toggleForm(false);
  e.target.reset();
});

// Edit product
function editProduct(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  editingProductId = id;

  document.getElementById("pName").value = prod.name;
  document.getElementById("pPrice").value = prod.price;
  document.getElementById("pImage").value = prod.image;
  document.getElementById("pCategory").value = prod.category;
  populateSubcategories(prod.category);
  document.getElementById("pSubcategory").value = prod.subcategory;

  toggleForm(true);
}

// Delete product
function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    products = products.filter(p => p.id !== id);
    displayProducts(products);
  }
}

// Show/hide form
function toggleForm(show) {
  document.getElementById("addForm").style.display = show ? "block" : "none";
}

// Show form button
document.getElementById("showAddFormBtn").addEventListener("click", () => {
  editingProductId = null;
  document.getElementById("productForm").reset();
  toggleForm(true);
});

// Cancel form button
document.getElementById("cancelBtn").addEventListener("click", () => {
  toggleForm(false);
});

// Search functionality
document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.subcategory.toLowerCase().includes(q)
  );
  displayProducts(filtered);
});

// Export JSON
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ products }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.json";
  a.click();
});

// Initialize
loadProducts();

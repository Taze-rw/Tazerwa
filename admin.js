// API Endpoint
const API_URL = "http://localhost/Tazerwa/api.php";
let allProducts = [];

// ================== CATEGORY MAP ==================
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

// ================== POPULATE CATEGORIES ==================
const categorySelect = document.getElementById("categorySelect");
for (let cat in categoryMap) {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categorySelect.appendChild(opt);
}

categorySelect.addEventListener("change", () => {
  const subSelect = document.getElementById("subcategorySelect");
  subSelect.innerHTML = "<option value=''>Select subcategory</option>";
  if (categorySelect.value) {
    categoryMap[categorySelect.value].forEach(sc => {
      let o = document.createElement("option");
      o.value = sc;
      o.textContent = sc;
      subSelect.appendChild(o);
    });
    subSelect.disabled = false;
  } else {
    subSelect.disabled = true;
  }
});

// ================== TOGGLE ADD FORM ==================
document.getElementById("toggleAdd").addEventListener("click", () => {
  const form = document.getElementById("addForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
  document.getElementById("pCategory").value = categorySelect.value;
  document.getElementById("pSubcategory").value = document.getElementById("subcategorySelect").value;
});

// ================== LOAD PRODUCTS ==================
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // ✅ Get the array inside the "products" property
    allProducts = data.products || [];

    // show empty initially
    displayProducts([]);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// ================== DISPLAY PRODUCTS ==================
function displayProducts(products) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
      <div class="product-info">
        <h4 class="product-name">${p.name}</h4>
        <p class="product-price"><strong>${p.price} RWF</strong></p>
        <div class="product-actions">
          <button class="small-btn edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="small-btn delete" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// ================== FILTER PRODUCTS ==================
document.getElementById("subcategorySelect").addEventListener("change", () => {
  const cat = categorySelect.value;
  const sub = document.getElementById("subcategorySelect").value;
  const filtered = allProducts.filter(p => p.category === cat && p.subcategory === sub);
  document.getElementById("resultsCount").textContent = `${filtered.length} products found`;
  displayProducts(filtered);
});

// ================== EDIT PRODUCT ==================
function editProduct(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  document.getElementById("pName").value = product.name;
  document.getElementById("pPrice").value = product.price;
  document.getElementById("pUnit").value = product.unit || "";
  document.getElementById("pImage").value = product.image || "";
  document.getElementById("pCategory").value = product.category;
  document.getElementById("pSubcategory").value = product.subcategory;
  document.getElementById("addForm").style.display = "block";
}

// ================== DELETE PRODUCT ==================
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await fetch(API_URL, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action:"delete",id})
  });
  loadProducts();
}

// ================== INIT ==================
window.onload = loadProducts;
document.getElementById("year").textContent = new Date().getFullYear();

// Cancel button inside Add/Edit form
const cancelBtn = document.getElementById("cancelBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    document.getElementById("addForm").style.display = "none";
  });
}
// ================== CONFIG ==================
const API_URL = "https://taze.fwh.is/api.php";
let allProducts = [];
let isEditMode = false;
let editingProductId = null;

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
if (categorySelect) {
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
}

// ================== POPULATE FORM SUBCATEGORIES ==================
function populateFormSubcategories(category) {
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

// Category change in form
document.getElementById("pCategory").addEventListener("change", (e) => {
  populateFormSubcategories(e.target.value);
});

// ================== TOGGLE ADD FORM ==================
document.getElementById("toggleAdd").addEventListener("click", () => {
  const form = document.getElementById("addForm");
  const formTitle = document.querySelector("#addForm h3");
  
  // Reset form and mode
  document.getElementById("productForm").reset();
  isEditMode = false;
  editingProductId = null;
  formTitle.textContent = "Add New Product";
  
  // Show/hide form
  if (form.style.display === "none" || !form.style.display) {
    form.style.display = "block";
    // Populate subcategories if category is selected
    populateFormSubcategories(document.getElementById("pCategory").value);
  } else {
    form.style.display = "none";
  }
});

// ================== LOAD PRODUCTS ==================
async function loadProducts() {
  try {
    const res = await fetch(API_URL, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    allProducts = data.products || [];
    displayProducts(allProducts);
    
    console.log(`Loaded ${allProducts.length} products successfully`);
  } catch (err) {
    console.error("Error loading products:", err);
    alert("Failed to load products. Check console for details.");
  }
}

// ================== DISPLAY PRODUCTS ==================
function displayProducts(products) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";
  
  if (!products || products.length === 0) {
    container.innerHTML = "<p style='text-align: center; padding: 40px; color: #666;'>No products found.</p>";
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">
        <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150'">
      </div>
      <div class="product-info">
        <h4 class="product-name">${p.name}</h4>
        <p class="product-price"><strong>${parseFloat(p.price).toLocaleString()} RWF</strong></p>
        <p class="product-category"><small>${p.category} > ${p.subcategory}</small></p>
        <div class="product-actions">
          <button class="small-btn edit" onclick="editProduct(${p.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="small-btn delete" onclick="deleteProduct(${p.id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// ================== FILTER PRODUCTS ==================
document.getElementById("subcategorySelect").addEventListener("change", () => {
  const cat = categorySelect.value;
  const sub = document.getElementById("subcategorySelect").value;
  
  if (!cat || !sub) {
    displayProducts(allProducts);
    document.getElementById("resultsCount").textContent = `${allProducts.length} products found`;
    return;
  }
  
  const filtered = allProducts.filter(p => 
    p.category === cat && p.subcategory === sub
  );
  
  document.getElementById("resultsCount").textContent = `${filtered.length} products found`;
  displayProducts(filtered);
});

// ================== ADD PRODUCT ==================
async function addProduct(product) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert("Product added successfully!");
      await loadProducts();
      return true;
    } else {
      alert("Error adding product: " + (data.error || "Unknown error"));
      return false;
    }
  } catch (err) {
    console.error("Error adding product:", err);
    alert("Failed to add product. Check console for details.");
    return false;
  }
}

// ================== UPDATE PRODUCT ==================
async function updateProduct(product) {
  try {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert("Product updated successfully!");
      await loadProducts();
      return true;
    } else {
      alert("Error updating product: " + (data.error || "Unknown error"));
      return false;
    }
  } catch (err) {
    console.error("Error updating product:", err);
    alert("Failed to update product. Check console for details.");
    return false;
  }
}

// ================== DELETE PRODUCT ==================
async function deleteProduct(id) {
  const product = allProducts.find(p => p.id == id);
  if (!product) {
    alert("Product not found!");
    return;
  }
  
  if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
    return;
  }
  
  try {
    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: id })
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert("Product deleted successfully!");
      await loadProducts();
    } else {
      alert("Error deleting product: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("Failed to delete product. Check console for details.");
  }
}

// ================== EDIT PRODUCT ==================
function editProduct(id) {
  const product = allProducts.find(p => p.id == id);
  if (!product) {
    alert("Product not found!");
    return;
  }

  // Set edit mode
  isEditMode = true;
  editingProductId = id;

  // Show form
  const form = document.getElementById("addForm");
  const formTitle = document.querySelector("#addForm h3");
  form.style.display = "block";
  formTitle.textContent = "Edit Product";

  // Populate form fields
  document.getElementById("pName").value = product.name;
  document.getElementById("pPrice").value = product.price;
  document.getElementById("pImage").value = product.image || '';
  document.getElementById("pCategory").value = product.category;
  
  // Populate subcategories then set value
  populateFormSubcategories(product.category);
  document.getElementById("pSubcategory").value = product.subcategory;

  // Scroll to form
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ================== FORM SUBMISSION ==================
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const productData = {
    name: document.getElementById("pName").value.trim(),
    price: parseFloat(document.getElementById("pPrice").value),
    image: document.getElementById("pImage").value.trim(),
    category: document.getElementById("pCategory").value,
    subcategory: document.getElementById("pSubcategory").value
  };
  
  // Validation
  if (!productData.name || !productData.price || !productData.category || !productData.subcategory) {
    alert("Please fill in all required fields!");
    return;
  }
  
  if (productData.price <= 0) {
    alert("Price must be greater than 0!");
    return;
  }
  
  let success = false;
  
  if (isEditMode && editingProductId) {
    // Update existing product
    productData.id = editingProductId;
    success = await updateProduct(productData);
  } else {
    // Add new product
    success = await addProduct(productData);
  }
  
  if (success) {
    // Reset form and hide
    document.getElementById("productForm").reset();
    document.getElementById("addForm").style.display = "none";
    isEditMode = false;
    editingProductId = null;
  }
});

// ================== CANCEL BUTTON ==================
const cancelBtn = document.getElementById("cancelBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    document.getElementById("productForm").reset();
    document.getElementById("addForm").style.display = "none";
    isEditMode = false;
    editingProductId = null;
  });
}

// ================== INIT ==================
window.onload = () => {
  loadProducts();
  
  // Set footer year
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  console.log("Admin dashboard initialized");
};
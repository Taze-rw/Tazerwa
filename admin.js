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

// ================== POPULATE FILTER CATEGORIES ==================
const categorySelect = document.getElementById("categorySelect");
if (categorySelect) {
  // Populate filter category dropdown
  for (let cat in categoryMap) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  }

  // When filter category changes, populate filter subcategory
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

// ================== POPULATE FORM CATEGORIES ==================
function populateFormCategories() {
  const pCategory = document.getElementById("pCategory");
  if (!pCategory) return;
  
  // Clear existing options
  pCategory.innerHTML = "<option value=''>Select category</option>";
  
  // Add all categories
  for (let cat in categoryMap) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    pCategory.appendChild(opt);
  }
}

// ================== POPULATE FORM SUBCATEGORIES ==================
function populateFormSubcategories(category) {
  const subSelect = document.getElementById("pSubcategory");
  if (!subSelect) return;
  
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
const pCategory = document.getElementById("pCategory");
if (pCategory) {
  pCategory.addEventListener("change", (e) => {
    populateFormSubcategories(e.target.value);
  });
}

// ================== TOGGLE ADD FORM ==================
const toggleAddBtn = document.getElementById("toggleAdd");
if (toggleAddBtn) {
  toggleAddBtn.addEventListener("click", () => {
    const form = document.getElementById("addForm");
    const formTitle = document.querySelector("#addForm h3");
    
    // Reset form and mode
    const productForm = document.getElementById("productForm");
    if (productForm) productForm.reset();
    
    isEditMode = false;
    editingProductId = null;
    if (formTitle) formTitle.textContent = "Add New Product";
    
    // Populate form categories
    populateFormCategories();
    
    // Show/hide form
    if (form.style.display === "none" || !form.style.display) {
      form.style.display = "block";
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      form.style.display = "none";
    }
  });
}

// ================== LOAD PRODUCTS ==================
async function loadProducts() {
  try {
    console.log("Loading products from:", API_URL);
    
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
    console.log("API Response:", data);
    
    allProducts = data.products || [];
    displayProducts(allProducts);
    
    // Update results count
    const resultsCount = document.getElementById("resultsCount");
    if (resultsCount) {
      resultsCount.textContent = `${allProducts.length} products loaded`;
    }
    
    console.log(`Loaded ${allProducts.length} products successfully`);
  } catch (err) {
    console.error("Error loading products:", err);
    alert("Failed to load products. Check console for details.");
  }
}

// ================== DISPLAY PRODUCTS ==================
function displayProducts(products) {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (!products || products.length === 0) {
    container.innerHTML = "<p style='text-align: center; padding: 40px; color: #666;'>No products found. Select a category above or add a new product.</p>";
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
        <p class="product-category" style="color:#6c757d;font-size:12px;margin:4px 0"><small>${p.category} > ${p.subcategory}</small></p>
        <div class="product-actions">
          <button class="small-btn edit" onclick="editProduct(${p.id})">
            Edit
          </button>
          <button class="small-btn delete" onclick="deleteProduct(${p.id})">
            Delete
          </button>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// ================== FILTER PRODUCTS ==================
const subcategorySelect = document.getElementById("subcategorySelect");
if (subcategorySelect) {
  subcategorySelect.addEventListener("change", () => {
    const cat = categorySelect ? categorySelect.value : '';
    const sub = subcategorySelect.value;
    
    if (!cat || !sub) {
      displayProducts(allProducts);
      const resultsCount = document.getElementById("resultsCount");
      if (resultsCount) {
        resultsCount.textContent = `${allProducts.length} products found`;
      }
      return;
    }
    
    const filtered = allProducts.filter(p => 
      p.category === cat && p.subcategory === sub
    );
    
    const resultsCount = document.getElementById("resultsCount");
    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} products found`;
    }
    displayProducts(filtered);
  });
}

// ================== ADD PRODUCT ==================
async function addProduct(product) {
  try {
    console.log("Adding product:", product);
    
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });
    
    const data = await res.json();
    console.log("Add response:", data);
    
    if (data.success) {
      alert("✅ Product added successfully!");
      await loadProducts();
      return true;
    } else {
      alert("❌ Error adding product: " + (data.error || "Unknown error"));
      return false;
    }
  } catch (err) {
    console.error("Error adding product:", err);
    alert("❌ Failed to add product: " + err.message);
    return false;
  }
}

// ================== UPDATE PRODUCT ==================
async function updateProduct(product) {
  try {
    console.log("Updating product:", product);
    
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });
    
    const data = await res.json();
    console.log("Update response:", data);
    
    if (data.success) {
      alert("✅ Product updated successfully!");
      await loadProducts();
      return true;
    } else {
      alert("❌ Error updating product: " + (data.error || "Unknown error"));
      return false;
    }
  } catch (err) {
    console.error("Error updating product:", err);
    alert("❌ Failed to update product: " + err.message);
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
  
  if (!confirm(`⚠️ Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`)) {
    return;
  }
  
  try {
    console.log("Deleting product:", id);
    
    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: parseInt(id) })
    });
    
    const data = await res.json();
    console.log("Delete response:", data);
    
    if (data.success) {
      alert("✅ Product deleted successfully!");
      await loadProducts();
    } else {
      alert("❌ Error deleting product: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("❌ Failed to delete product: " + err.message);
  }
}

// ================== EDIT PRODUCT ==================
function editProduct(id) {
  const product = allProducts.find(p => p.id == id);
  if (!product) {
    alert("Product not found!");
    return;
  }

  console.log("Editing product:", product);

  // Set edit mode
  isEditMode = true;
  editingProductId = id;

  // Show form
  const form = document.getElementById("addForm");
  const formTitle = document.querySelector("#addForm h3");

  if (!form) {
    console.error("Form element not found");
    return;
  }

  form.style.display = "block";
  if (formTitle) formTitle.textContent = "Edit Product";

  // Always populate categories
  populateFormCategories();

  // Set all field values
  document.getElementById("pName").value = product.name;
  document.getElementById("pPrice").value = product.price;
  document.getElementById("pImage").value = product.image || "";

  // Set category first
  const pCategoryEl = document.getElementById("pCategory");
  if (pCategoryEl) {
    pCategoryEl.value = product.category;
  }

  // Now populate subcategories of that category
  populateFormSubcategories(product.category);

  // Wait briefly before setting subcategory (to ensure options exist)
  setTimeout(() => {
    const pSubcategoryEl = document.getElementById("pSubcategory");
    if (pSubcategoryEl) {
      pSubcategoryEl.value = product.subcategory;
    }
  }, 100);

  // Scroll smoothly to form
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ================== FORM SUBMISSION ==================
const productForm = document.getElementById("productForm");
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const productData = {
      name: document.getElementById("pName").value.trim(),
      price: parseInt(document.getElementById("pPrice").value),
      image: document.getElementById("pImage").value.trim(),
      category: document.getElementById("pCategory").value,
      subcategory: document.getElementById("pSubcategory").value
    };
    
    console.log("Form data:", productData);
    
    // Validation
    if (!productData.name || !productData.price || !productData.category || !productData.subcategory) {
      alert("⚠️ Please fill in all required fields (Name, Price, Category, Subcategory)!");
      return;
    }
    
    if (productData.price <= 0 || isNaN(productData.price)) {
      alert("⚠️ Price must be a valid number greater than 0!");
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
      productForm.reset();
      const addForm = document.getElementById("addForm");
      if (addForm) addForm.style.display = "none";
      isEditMode = false;
      editingProductId = null;
    }
  });
}

// ================== CANCEL BUTTON ==================
const cancelBtn = document.getElementById("cancelBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    const productForm = document.getElementById("productForm");
    const addForm = document.getElementById("addForm");
    
    if (productForm) productForm.reset();
    if (addForm) addForm.style.display = "none";
    
    isEditMode = false;
    editingProductId = null;
  });
}

// ================== INIT ==================
window.onload = () => {
  console.log("Initializing admin dashboard...");
  console.log("API URL:", API_URL);

  // Always populate the form categories on page load
  populateFormCategories();

  // Load all products
  loadProducts();

  // Set footer year
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  console.log("Admin dashboard initialized successfully");
};

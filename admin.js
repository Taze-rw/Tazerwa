// ================== CATEGORY MAP ==================
const categoryMap = {
  "Fashion": ["Men", "Women", "Accessories", "Footwear"],
  "Beauty": ["Makeup", "Skincare", "Haircare", "Fragrance"],
  "Electronics": ["Phones", "Laptops", "Accessories", "Appliances"],
  "Home Décor": ["Furniture", "Lighting", "Kitchen", "Decor"],
  "Food & Beverages": ["Fresh Produce", "Bakery", "Beverages", "Snacks"],
  "Children": ["Toys", "Clothes", "Books", "Baby Care"]
};

// ================== INITIALIZATION ==================
document.addEventListener("DOMContentLoaded", () => {
  populateFormCategories();
  loadProducts();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportProducts);
  }
});

// ================== POPULATE FORM CATEGORIES ==================
function populateFormCategories() {
  const pCategory = document.getElementById("pCategory");
  if (!pCategory) return;

  pCategory.innerHTML = "<option value=''>Select category</option>";

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

// ================== CATEGORY CHANGE LISTENER ==================
const pCategory = document.getElementById("pCategory");
if (pCategory) {
  pCategory.addEventListener("change", (e) => {
    populateFormSubcategories(e.target.value);
  });
}

// ================== SAVE PRODUCT ==================
const productForm = document.getElementById("productForm");
if (productForm) {
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("productId").value;
    const name = document.getElementById("pName").value.trim();
    const price = document.getElementById("pPrice").value.trim();
    const image = document.getElementById("pImage").value.trim() || "https://via.placeholder.com/150";
    const category = document.getElementById("pCategory").value;
    const subcategory = document.getElementById("pSubcategory").value;

    if (!name || !price || !category || !subcategory) {
      alert("Please fill all required fields.");
      return;
    }

    const products = JSON.parse(localStorage.getItem("products")) || [];

    const newProduct = {
      id: id || Date.now(),
      name,
      price,
      image,
      category,
      subcategory
    };

    if (id) {
      const index = products.findIndex(p => p.id == id);
      if (index !== -1) {
        products[index] = newProduct;
      }
    } else {
      products.push(newProduct);
    }

    localStorage.setItem("products", JSON.stringify(products));
    productForm.reset();
    document.getElementById("productId").value = "";
    loadProducts();
    alert("✅ Product saved successfully!");
  });
}

// ================== LOAD PRODUCTS ==================
function loadProducts(searchTerm = "") {
  const productList = document.getElementById("productList");
  if (!productList) return;

  productList.innerHTML = "";
  const products = JSON.parse(localStorage.getItem("products")) || [];

  // Filter if search term is provided
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    productList.innerHTML = "<p style='text-align:center;color:gray;'>No products found.</p>";
    return;
  }

  filteredProducts.forEach(product => {
    const item = document.createElement("div");
    item.className = "product-item";
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-thumb">
      <div class="product-info">
        <h4>${product.name}</h4>
        <p><strong>${product.price} RWF</strong></p>
        <p>${product.category} → ${product.subcategory}</p>
        <div class="product-actions">
          <button onclick="editProduct(${product.id})" class="btn btn-sm btn-primary">Edit</button>
          <button onclick="deleteProduct(${product.id})" class="btn btn-sm btn-danger">Delete</button>
        </div>
      </div>
    `;
    productList.appendChild(item);
  });
}

// ================== SEARCH FUNCTIONALITY ==================
function handleSearch(e) {
  const term = e.target.value;
  loadProducts(term);
}

// ================== EDIT PRODUCT ==================
function editProduct(id) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find(p => p.id == id);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("pName").value = product.name;
  document.getElementById("pPrice").value = product.price;
  document.getElementById("pImage").value = product.image;
  document.getElementById("pCategory").value = product.category;
  populateFormSubcategories(product.category);
  document.getElementById("pSubcategory").value = product.subcategory;
}

// ================== DELETE PRODUCT ==================
function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  let products = JSON.parse(localStorage.getItem("products")) || [];
  products = products.filter(p => p.id != id);
  localStorage.setItem("products", JSON.stringify(products));
  loadProducts();
}

// ================== EXPORT JSON ==================
function exportProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "products.json";
  link.click();
}

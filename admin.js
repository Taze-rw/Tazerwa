let products = [];
const categorySelect = document.getElementById("pCategory");
const subcategorySelect = document.getElementById("pSubcategory");
const tableBody = document.getElementById("productTableBody");
const searchInput = document.getElementById("searchInput");

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

// Load products from JSON file
async function loadProducts() {
  try {
    const res = await fetch("products.json");
    const data = await res.json();
    products = data.products || [];
    displayProducts(products);
    populateCategoryDropdown();
  } catch (error) {
    console.error("Error loading products.json:", error);
  }
}

// Display products in table
function displayProducts(filteredProducts = products) {
  if (!tableBody) return;
  tableBody.innerHTML = "";
  filteredProducts.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.price} RWF</td>
      <td><img src="${p.image}" width="50" height="50"></td>
      <td>${p.category}</td>
      <td>${p.subcategory}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Populate category dropdown dynamically
function populateCategoryDropdown() {
  categorySelect.innerHTML = `<option value="">Select category</option>`;
  Object.keys(categoryMap).forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Also populate global filter dropdown if it exists
  const filterCategory = document.getElementById("filterCategory");
  if (filterCategory) {
    filterCategory.innerHTML = `<option value="">All categories</option>`;
    Object.keys(categoryMap).forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      filterCategory.appendChild(option);
    });
  }
}


// Populate subcategory dropdown based on selected category
function populateSubcategoryDropdown(selectedCategory) {
  const subs = categoryMap[selectedCategory] || [];
  subcategorySelect.innerHTML = `<option value="">Select subcategory</option>`;
  subs.forEach((sub) => {
    const option = document.createElement("option");
    option.value = sub;
    option.textContent = sub;
    subcategorySelect.appendChild(option);
  });

  // Also populate global filter subcategory dropdown
  const filterSub = document.getElementById("filterSubcategory");
  if (filterSub) {
    filterSub.innerHTML = `<option value="">All subcategories</option>`;
    subs.forEach((sub) => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      filterSub.appendChild(option);
    });
  }
}

// When category changes in form, populate subcategories
categorySelect?.addEventListener("change", (e) => {
  populateSubcategoryDropdown(e.target.value);
});

// Filtering products by category & subcategory
function filterProducts() {
  const selectedCategory = document.getElementById("filterCategory")?.value || "";
  const selectedSubcategory = document.getElementById("filterSubcategory")?.value || "";
  let filtered = products;

  if (selectedCategory) {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }
  if (selectedSubcategory) {
    filtered = filtered.filter((p) => p.subcategory === selectedSubcategory);
  }

  displayProducts(filtered);
}

// Handle search input (filter across all)
searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.subcategory.toLowerCase().includes(query)
  );
  displayProducts(filtered);
});

// Add new product
document.getElementById("productForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const image = document.getElementById("pImage").value.trim();
  const category = document.getElementById("pCategory").value;
  const subcategory = document.getElementById("pSubcategory").value;

  if (!name || !price || !category || !subcategory) {
    alert("Please fill all required fields!");
    return;
  }

  if (id) {
    const index = products.findIndex((p) => p.id == id);
    if (index !== -1) {
      products[index] = { id: parseInt(id), name, price, image, category, subcategory };
    }
  } else {
    const newProduct = {
      id: Date.now(),
      name,
      price,
      image,
      category,
      subcategory,
    };
    products.push(newProduct);
  }

  displayProducts(products);
  populateCategoryDropdown();
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  alert("Product saved successfully!");
});

// Edit product
function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  document.getElementById("productId").value = product.id;
  document.getElementById("pName").value = product.name;
  document.getElementById("pPrice").value = product.price;
  document.getElementById("pImage").value = product.image;
  document.getElementById("pCategory").value = product.category;
  populateSubcategoryDropdown(product.category);
  document.getElementById("pSubcategory").value = product.subcategory;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete product
function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  products = products.filter((p) => p.id !== id);
  displayProducts(products);
  alert("Product deleted successfully!");
}

// Export products.json
function exportJSON() {
  const blob = new Blob([JSON.stringify({ products }, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.json";
  a.click();
}

document.getElementById("exportBtn")?.addEventListener("click", exportJSON);

// Filter dropdown change
document.getElementById("filterCategory")?.addEventListener("change", (e) => {
  populateSubcategoryDropdown(e.target.value);
  filterProducts();
});
document.getElementById("filterSubcategory")?.addEventListener("change", filterProducts);

// Load products on page start
loadProducts();

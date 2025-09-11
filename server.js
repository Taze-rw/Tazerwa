require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load products from JSON file
let products = [];
try {
  const data = fs.readFileSync("products.json", "utf8");
  products = JSON.parse(data);
} catch (err) {
  console.error("Error loading products.json", err);
}

// Health check
app.get("/", (req, res) => {
  res.send("Search API is running ✅");
});

// Search API
app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase();

  if (!query) {
    return res.json([]); // return empty if no search
  }

  const results = products.filter((p) =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query))
  );

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

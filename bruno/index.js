// index.js
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

const app = express();

// --- Simple CORS so your frontend can call the API ---
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // change to your domain in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// --- Multer in-memory storage for quick Rekognition calls ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// --- AWS SDK v2 clients ---
AWS.config.update({ region: process.env.AWS_REGION });
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

// --- Load products index ---
const productsPath = path.join(__dirname, 'data', 'products.json');
if (!fs.existsSync(productsPath)) {
  console.error('Missing data/products.json');
  process.exit(1);
}
const PRODUCTS = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// --- Helpers ---
const MIN_CONF = Number(process.env.MIN_CONFIDENCE || 75);
const SIGNED_URL_EXPIRY = Number(process.env.SIGNED_URL_EXPIRY || 3600);
const BUCKET = process.env.S3_BUCKET_NAME;

function makeImageUrl(key) {
  // Return a presigned URL (bucket can remain private)
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET,
    Key: key,
    Expires: SIGNED_URL_EXPIRY
  });
}

function normalize(str) {
  return String(str || '').toLowerCase();
}

// Simple mapping to bridge Rekognition labels to your tags (optional, extend as needed)
const LABEL_SYNONYMS = {
  beverage: ['drink', 'drinks', 'beverage'],
  dairy: ['milk', 'dairy'],
  bread: ['bread', 'bakery', 'loaf', 'baked goods'],
  fruit: ['fruit', 'produce'],
  banana: ['banana'],
  bottle: ['bottle', 'carton', 'container']
};

// Expand labels with synonyms
function expandLabels(labels) {
  const base = new Set(labels.map(l => normalize(l)));
  const expanded = new Set(base);
  for (const l of base) {
    for (const [key, list] of Object.entries(LABEL_SYNONYMS)) {
      if (l === key || list.includes(l)) {
        expanded.add(key);
        list.forEach(s => expanded.add(s));
      }
    }
  }
  return Array.from(expanded);
}

// Score product by how many tags intersect with labels
function scoreProduct(product, labelSet) {
  let score = 0;
  for (const t of product.tags || []) {
    if (labelSet.has(normalize(t))) score += 1;
  }
  return score;
}

// --- Routes ---

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Upload field name must be "image"
app.post('/api/search/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No image uploaded (field name should be "image").' });
    }

    // Call Rekognition DetectLabels
    const params = {
      Image: { Bytes: req.file.buffer },
      MaxLabels: 30,
      MinConfidence: MIN_CONF
    };

    const result = await rekognition.detectLabels(params).promise();
    const labels = (result.Labels || [])
      .filter(l => (l.Confidence || 0) >= MIN_CONF)
      .map(l => l.Name);

    // Expand for better matching
    const expanded = expandLabels(labels);
    const labelSet = new Set(expanded.map(normalize));

    // Rank catalog
    const scored = PRODUCTS.map(p => ({
      ...p,
      score: scoreProduct(p, labelSet)
    }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24) // top matches
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: makeImageUrl(p.imageKey),
        tags: p.tags,
        score: p.score
      }));

    res.json({
      queryLabels: labels,
      matchedLabels: Array.from(labelSet),
      results: scored
    });
  } catch (err) {
    console.error('Rekognition error:', err);
    res.status(500).json({ error: 'Image search failed', details: err.message });
  }
});

// (Optional) simple text search hits your same catalog
app.get('/api/search/text', (req, res) => {
  const q = normalize(req.query.q || '');
  if (!q) return res.json({ results: [] });
  const results = PRODUCTS.filter(p =>
    normalize(p.name).includes(q) || (p.tags || []).some(t => normalize(t).includes(q))
  )
    .slice(0, 50)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: makeImageUrl(p.imageKey),
      tags: p.tags
    }));

  res.json({ results });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

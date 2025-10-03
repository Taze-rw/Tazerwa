<?php
// import_products.php - One-time script to move products.json into MySQL

// --- DB CONFIG ---
$db_host = "sql302.infinityfree.com";
$db_user = "if0_39993795";
$db_pass = "SqULqsnG51";
$db_name = "if0_39993795_tazerwa";

// Connect
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
    die("DB connection failed: " . $mysqli->connect_error);
}
$mysqli->set_charset("utf8mb4");

// Load JSON file
$jsonFile = __DIR__ . "/products.json";
if (!file_exists($jsonFile)) {
    die("products.json not found!");
}
$data = json_decode(file_get_contents($jsonFile), true);
if (!$data || !isset($data['products'])) {
    die("Invalid JSON structure.");
}

$count = 0;
foreach ($data['products'] as $p) {
    $id = $p['id'] ?? null;  // keep existing id if available
    $name = $p['name'] ?? "";
    $price = (int)($p['price'] ?? 0);
    $image = $p['image'] ?? null;
    $category = $p['category'] ?? null;
    $subcategory = $p['subcategory'] ?? null;

    $stmt = $mysqli->prepare("INSERT INTO products (id, name, price, image, category, subcategory) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isisss", $id, $name, $price, $image, $category, $subcategory);
    if ($stmt->execute()) {
        $count++;
    }
}

echo "✅ Imported {$count} products into database.";

<?php
header("Content-Type: application/json");

// Path to products.json
$file = __DIR__ . "/products.json";

// Ensure products.json exists
if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

// Read products.json
$products = json_decode(file_get_contents($file), true);

// Handle request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode($products);
        break;

    case 'POST': // Add product
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) { http_response_code(400); exit; }

        // Generate new ID
        $lastId = !empty($products) ? max(array_column($products, 'id')) : 0;
        $data['id'] = $lastId + 1;

        $products[] = $data;
        file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT));
        echo json_encode(["message" => "Product added", "product" => $data]);
        break;

    case 'PUT': // Edit product
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['id'])) { http_response_code(400); exit; }

        foreach ($products as &$product) {
            if ($product['id'] == $data['id']) {
                $product = array_merge($product, $data);
                break;
            }
        }
        file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT));
        echo json_encode(["message" => "Product updated"]);
        break;

    case 'DELETE': // Delete product
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['id'])) { http_response_code(400); exit; }

        $products = array_filter($products, fn($p) => $p['id'] != $data['id']);
        file_put_contents($file, json_encode(array_values($products), JSON_PRETTY_PRINT));
        echo json_encode(["message" => "Product deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
}
?>

<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$file = "products.json";
$data = json_decode(file_get_contents($file), true);

// GET all products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($data);
    exit;
}

// ADD product
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $data['products'][] = $input;
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["success" => true]);
    exit;
}

// UPDATE product
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents("php://input"), true);
    foreach ($data['products'] as &$product) {
        if ($product['id'] == $input['id']) {
            $product = $input; // overwrite with new values
            break;
        }
    }
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["success" => true]);
    exit;
}

// DELETE product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);
    $data['products'] = array_values(array_filter(
        $data['products'],
        fn($p) => $p['id'] != $input['id']
    ));
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["success" => true]);
    exit;
}

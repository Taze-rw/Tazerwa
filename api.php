<?php
// api.php - Handle CRUD for products

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- DB CONFIG ---
$db_host = "sql302.infinityfree.com";
$db_user = "if0_39993795";
$db_pass = "SqULqsnG51";
$db_name = "if0_39993795_tazerwa";

$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed: " . $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset("utf8mb4");

// --- ROUTER ---
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "GET":
        // Fetch products
        $result = $mysqli->query("SELECT * FROM products ORDER BY id DESC");
        if (!$result) {
            echo json_encode(["error" => "Query failed: " . $mysqli->error]);
            exit;
        }
        $products = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(["products" => $products]);
        break;

    case "POST":
        // Add product
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input) { 
            echo json_encode(["error" => "Invalid JSON input"]); 
            exit; 
        }

        // Validate required fields
        if (empty($input['name']) || empty($input['price']) || empty($input['category']) || empty($input['subcategory'])) {
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        // Convert price to integer (cents) if needed, or keep as integer
        $price = intval($input['price']);
        
        $stmt = $mysqli->prepare("INSERT INTO products (name, price, image, category, subcategory) VALUES (?, ?, ?, ?, ?)");
        if (!$stmt) {
            echo json_encode(["error" => "Prepare failed: " . $mysqli->error]);
            exit;
        }
        
        // Changed 'd' to 'i' for integer price
        $stmt->bind_param("sisss", 
            $input['name'], 
            $price, 
            $input['image'], 
            $input['category'], 
            $input['subcategory']
        );
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $mysqli->insert_id]);
        } else {
            echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case "PUT":
        // Update product
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || !isset($input['id'])) { 
            echo json_encode(["error" => "Missing product ID"]); 
            exit; 
        }

        // Validate required fields
        if (empty($input['name']) || empty($input['price']) || empty($input['category']) || empty($input['subcategory'])) {
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        $price = intval($input['price']);
        $id = intval($input['id']);

        $stmt = $mysqli->prepare("UPDATE products SET name=?, price=?, image=?, category=?, subcategory=? WHERE id=?");
        if (!$stmt) {
            echo json_encode(["error" => "Prepare failed: " . $mysqli->error]);
            exit;
        }
        
        // Changed 'd' to 'i' for integer price, added 'i' for id
        $stmt->bind_param("sisssi", 
            $input['name'], 
            $price, 
            $input['image'], 
            $input['category'], 
            $input['subcategory'], 
            $id
        );
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
            } else {
                echo json_encode(["success" => true, "message" => "No changes made or product not found"]);
            }
        } else {
            echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case "DELETE":
        // Delete product
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || !isset($input['id'])) { 
            echo json_encode(["error" => "Missing product ID"]); 
            exit; 
        }

        $id = intval($input['id']);
        
        $stmt = $mysqli->prepare("DELETE FROM products WHERE id=?");
        if (!$stmt) {
            echo json_encode(["error" => "Prepare failed: " . $mysqli->error]);
            exit;
        }
        
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
            } else {
                echo json_encode(["success" => false, "error" => "Product not found or already deleted"]);
            }
        } else {
            echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}

$mysqli->close();
?>
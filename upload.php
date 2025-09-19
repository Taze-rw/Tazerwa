<?php
$targetDir = "uploads/";
if (!is_dir($targetDir)) mkdir($targetDir);

if (isset($_FILES['image'])) {
    $fileName = time() . "_" . basename($_FILES['image']['name']);
    $targetFile = $targetDir . $fileName;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        echo json_encode(["success" => true, "url" => $targetFile]);
    } else {
        echo json_encode(["success" => false, "message" => "Upload failed"]);
    }
}
?>

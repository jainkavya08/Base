<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Authentication required"]);
    exit;
}

require_once '../config/database.php';
$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['name'])) {
        $name = trim($input['name']);
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Name cannot be empty"]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE users SET name = :name WHERE id = :user_id");
            $stmt->execute(['name' => $name, 'user_id' => $user_id]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "No updatable fields provided"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);

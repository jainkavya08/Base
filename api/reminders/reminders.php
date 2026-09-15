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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, title, fire_at as fireAt, created_at as createdAt FROM reminders WHERE user_id = :user_id ORDER BY fire_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        $reminders = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Format dates as ISO 8601 for frontend compatibility
            $row['fireAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['fireAt']));
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            $reminders[] = $row;
        }
        
        echo json_encode(["success" => true, "reminders" => $reminders]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? uniqid();
    $title = $input['title'] ?? '';
    $fireAt = $input['fireAt'] ?? '';
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($title) || empty($fireAt)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit;
    }

    try {
        // Convert ISO 8601 string to MySQL DATETIME
        $mysqlFireAt = date('Y-m-d H:i:s', strtotime($fireAt));
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        $stmt = $pdo->prepare("INSERT INTO reminders (id, user_id, title, fire_at, created_at) VALUES (:id, :user_id, :title, :fire_at, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'title' => $title,
            'fire_at' => $mysqlFireAt,
            'created_at' => $mysqlCreatedAt
        ]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing reminder id"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM reminders WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);

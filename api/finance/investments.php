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
        $stmt = $pdo->prepare("SELECT id, name, type, invested_amount as investedAmount, current_value as currentValue, created_at as createdAt FROM investments WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->execute(['user_id' => $user_id]);
        $investments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['investedAmount'] = (float)$row['investedAmount'];
            $row['currentValue'] = (float)$row['currentValue'];
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            $investments[] = $row;
        }
        echo json_encode(["success" => true, "investments" => $investments]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? uniqid();
    $name = $input['name'] ?? '';
    $type = $input['type'] ?? 'Other';
    $investedAmount = $input['investedAmount'] ?? 0;
    $currentValue = $input['currentValue'] ?? 0;
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($name) || empty($type)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit;
    }

    try {
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        $stmt = $pdo->prepare("INSERT INTO investments (id, user_id, name, type, invested_amount, current_value, created_at) VALUES (:id, :user_id, :name, :type, :invested, :current, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'name' => $name,
            'type' => $type,
            'invested' => $investedAmount,
            'current' => $currentValue,
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
        echo json_encode(["success" => false, "error" => "Missing id"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM investments WHERE id = :id AND user_id = :user_id");
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

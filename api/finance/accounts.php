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
        $stmt = $pdo->prepare("SELECT id, name, opening_balance as balance, color, is_active as isActive, created_at as createdAt FROM bank_accounts WHERE user_id = :user_id ORDER BY created_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        $accounts = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['balance'] = (float)$row['balance'];
            $row['isActive'] = (bool)$row['isActive'];
            $accounts[] = $row;
        }
        echo json_encode(["success" => true, "accounts" => $accounts]);
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
    $balance = $input['balance'] ?? 0;
    $color = $input['color'] ?? '';
    $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 1;
    
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Name is required"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO bank_accounts (id, user_id, name, bank_name, account_type, opening_balance, color, is_active) VALUES (:id, :user_id, :name, :bank_name, :account_type, :opening_balance, :color, :is_active)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'name' => $name,
            'bank_name' => 'General', // Default since UI doesn't collect it
            'account_type' => 'General',
            'opening_balance' => $balance,
            'color' => $color,
            'is_active' => $isActive
        ]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing account id"]);
        exit;
    }

    try {
        $updateFields = [];
        $params = ['id' => $id, 'user_id' => $user_id];
        
        if (isset($input['name'])) {
            $updateFields[] = "name = :name";
            $params['name'] = $input['name'];
        }
        if (isset($input['balance'])) {
            $updateFields[] = "opening_balance = :balance";
            $params['balance'] = $input['balance'];
        }
        if (isset($input['color'])) {
            $updateFields[] = "color = :color";
            $params['color'] = $input['color'];
        }
        if (isset($input['isActive'])) {
            $updateFields[] = "is_active = :is_active";
            $params['is_active'] = (int)$input['isActive'];
        }

        if (count($updateFields) > 0) {
            $sql = "UPDATE bank_accounts SET " . implode(", ", $updateFields) . " WHERE id = :id AND user_id = :user_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
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
        echo json_encode(["success" => false, "error" => "Missing account id"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM bank_accounts WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error or account has linked records"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);

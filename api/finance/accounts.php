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
        $stmt = $pdo->prepare("
            SELECT 
                id, 
                name, 
                bank_name as bankName,
                account_type as accountType,
                account_number_last_4 as accountNumberLast4,
                opening_balance as balance, 
                currency,
                color, 
                logo,
                is_active as isActive, 
                created_at as createdAt 
            FROM bank_accounts 
            WHERE user_id = :user_id 
            ORDER BY created_at ASC
        ");
        $stmt->execute(['user_id' => $user_id]);
        $accounts = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['balance'] = (float)$row['balance'];
            $row['isActive'] = (bool)$row['isActive'];
            // Return raw nulls or values directly
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
    $bankName = $input['bankName'] ?? null;
    $accountType = $input['accountType'] ?? null;
    $last4 = $input['accountNumberLast4'] ?? null;
    $balance = $input['balance'] ?? 0;
    $currency = $input['currency'] ?? 'USD';
    $color = $input['color'] ?? '';
    $logo = $input['logo'] ?? null;
    $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 1;
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Name is required"]);
        exit;
    }

    try {
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        $stmt = $pdo->prepare("INSERT INTO bank_accounts (id, user_id, name, bank_name, account_type, account_number_last_4, opening_balance, currency, color, logo, is_active, created_at) VALUES (:id, :user_id, :name, :bank_name, :account_type, :last_4, :opening_balance, :currency, :color, :logo, :is_active, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'name' => $name,
            'bank_name' => $bankName,
            'account_type' => $accountType,
            'last_4' => $last4,
            'opening_balance' => $balance,
            'currency' => $currency,
            'color' => $color,
            'logo' => $logo,
            'is_active' => $isActive,
            'created_at' => $mysqlCreatedAt
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
        if (isset($input['bankName'])) {
            $updateFields[] = "bank_name = :bankName";
            $params['bankName'] = $input['bankName'];
        }
        if (isset($input['accountType'])) {
            $updateFields[] = "account_type = :accountType";
            $params['accountType'] = $input['accountType'];
        }
        if (array_key_exists('accountNumberLast4', $input)) {
            $updateFields[] = "account_number_last_4 = :accountNumberLast4";
            $params['accountNumberLast4'] = $input['accountNumberLast4'];
        }
        if (isset($input['balance'])) {
            $updateFields[] = "opening_balance = :balance";
            $params['balance'] = $input['balance'];
        }
        if (isset($input['color'])) {
            $updateFields[] = "color = :color";
            $params['color'] = $input['color'];
        }
        if (array_key_exists('logo', $input)) {
            $updateFields[] = "logo = :logo";
            $params['logo'] = $input['logo'];
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

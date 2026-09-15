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
                r.id, 
                r.account_id as accountId, 
                c.name as categoryId, 
                r.name, 
                r.amount, 
                r.frequency, 
                r.start_date as startDate, 
                r.next_due_date as nextDueDate, 
                r.is_active as isActive, 
                r.created_at as createdAt 
            FROM recurring_payments r 
            LEFT JOIN finance_categories c ON r.category_id = c.id 
            WHERE r.user_id = :user_id 
            ORDER BY r.next_due_date ASC
        ");
        $stmt->execute(['user_id' => $user_id]);
        $recurring = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['amount'] = (float)$row['amount'];
            $row['isActive'] = (bool)$row['isActive'];
            $row['startDate'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['startDate']));
            $row['nextDueDate'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['nextDueDate']));
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            if (!$row['categoryId']) $row['categoryId'] = 'Subscriptions';
            $recurring[] = $row;
        }
        echo json_encode(["success" => true, "recurring" => $recurring]);
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
    $amount = $input['amount'] ?? 0;
    $accountId = $input['accountId'] ?? '';
    $category_name = $input['categoryId'] ?? 'Subscriptions';
    $frequency = $input['frequency'] ?? 'monthly';
    $startDate = $input['startDate'] ?? '';
    $nextDueDate = $input['nextDueDate'] ?? '';
    $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 1;
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($name) || empty($amount) || empty($accountId) || empty($startDate)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Resolve category
        $stmt = $pdo->prepare("SELECT id FROM finance_categories WHERE user_id = :user_id AND name = :name LIMIT 1");
        $stmt->execute(['user_id' => $user_id, 'name' => $category_name]);
        $category = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($category) {
            $category_id = $category['id'];
        } else {
            $category_id = uniqid();
            $stmt = $pdo->prepare("INSERT INTO finance_categories (id, user_id, name, type) VALUES (:id, :user_id, :name, 'expense')");
            $stmt->execute(['id' => $category_id, 'user_id' => $user_id, 'name' => $category_name]);
        }

        // 2. Insert recurring payment
        $mysqlStartDate = date('Y-m-d', strtotime($startDate));
        $mysqlNextDueDate = date('Y-m-d', strtotime($nextDueDate ?: $startDate));
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        $stmt = $pdo->prepare("INSERT INTO recurring_payments (id, user_id, account_id, category_id, name, amount, frequency, start_date, next_due_date, is_active, created_at) VALUES (:id, :user_id, :account_id, :category_id, :name, :amount, :freq, :start_date, :next_due_date, :is_active, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'account_id' => $accountId,
            'category_id' => $category_id,
            'name' => $name,
            'amount' => $amount,
            'freq' => $frequency,
            'start_date' => $mysqlStartDate,
            'next_due_date' => $mysqlNextDueDate,
            'is_active' => $isActive,
            'created_at' => $mysqlCreatedAt
        ]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
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
        $stmt = $pdo->prepare("DELETE FROM recurring_payments WHERE id = :id AND user_id = :user_id");
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

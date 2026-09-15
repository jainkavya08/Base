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
                t.id, 
                t.account_id as accountId, 
                c.name as category, 
                t.type, 
                t.amount, 
                t.title, 
                t.date, 
                t.notes, 
                t.created_at as createdAt 
            FROM transactions t 
            LEFT JOIN finance_categories c ON t.category_id = c.id 
            WHERE t.user_id = :user_id 
            ORDER BY t.date DESC, t.created_at DESC
        ");
        $stmt->execute(['user_id' => $user_id]);
        $transactions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['amount'] = (float)$row['amount'];
            // UI expects date to be an ISO string, but MySQL DATE is YYYY-MM-DD
            // We convert to ISO so the frontend is happy
            $row['date'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['date']));
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            // UI fallback
            if (!$row['category']) $row['category'] = 'Uncategorized';
            $transactions[] = $row;
        }
        echo json_encode(["success" => true, "transactions" => $transactions]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? uniqid();
    $type = $input['type'] ?? '';
    $amount = $input['amount'] ?? 0;
    $category_name = $input['category'] ?? 'Uncategorized';
    $account_id = $input['accountId'] ?? '';
    $date = $input['date'] ?? '';
    $title = $input['title'] ?? '';
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($type) || empty($amount) || empty($account_id) || empty($date)) {
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
            $stmt = $pdo->prepare("INSERT INTO finance_categories (id, user_id, name, type) VALUES (:id, :user_id, :name, :type)");
            $stmt->execute(['id' => $category_id, 'user_id' => $user_id, 'name' => $category_name, 'type' => $type]);
        }

        // 2. Insert transaction
        $mysqlDate = date('Y-m-d', strtotime($date));
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        $stmt = $pdo->prepare("INSERT INTO transactions (id, user_id, account_id, category_id, type, amount, title, date, created_at) VALUES (:id, :user_id, :account_id, :category_id, :type, :amount, :title, :date, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'account_id' => $account_id,
            'category_id' => $category_id,
            'type' => $type,
            'amount' => $amount,
            'title' => $title,
            'date' => $mysqlDate,
            'created_at' => $mysqlCreatedAt
        ]);

        // 3. Update bank account balance safely
        $balanceChange = ($type === 'income') ? $amount : -$amount;
        $stmt = $pdo->prepare("UPDATE bank_accounts SET opening_balance = opening_balance + :change WHERE id = :account_id AND user_id = :user_id");
        $stmt->execute([
            'change' => $balanceChange,
            'account_id' => $account_id,
            'user_id' => $user_id
        ]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error", "details" => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing transaction id"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Need to get the transaction to revert the balance
        $stmt = $pdo->prepare("SELECT type, amount, account_id FROM transactions WHERE id = :id AND user_id = :user_id LIMIT 1");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        $tx = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($tx) {
            // Revert balance
            $balanceChange = ($tx['type'] === 'income') ? -$tx['amount'] : $tx['amount'];
            $stmt = $pdo->prepare("UPDATE bank_accounts SET opening_balance = opening_balance + :change WHERE id = :account_id AND user_id = :user_id");
            $stmt->execute([
                'change' => $balanceChange,
                'account_id' => $tx['account_id'],
                'user_id' => $user_id
            ]);

            // Delete transaction
            $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = :id AND user_id = :user_id");
            $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        }

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);

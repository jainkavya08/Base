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
        $stmt = $pdo->prepare("SELECT id, from_account_id as fromAccountId, to_account_id as toAccountId, amount, date, description, created_at as createdAt FROM transfers WHERE user_id = :user_id ORDER BY date DESC, created_at DESC");
        $stmt->execute(['user_id' => $user_id]);
        $transfers = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['amount'] = (float)$row['amount'];
            $row['date'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['date']));
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            $transfers[] = $row;
        }
        echo json_encode(["success" => true, "transfers" => $transfers]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? uniqid();
    $fromAccountId = $input['fromAccountId'] ?? '';
    $toAccountId = $input['toAccountId'] ?? '';
    $amount = $input['amount'] ?? 0;
    $date = $input['date'] ?? '';
    $description = $input['description'] ?? '';
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($fromAccountId) || empty($toAccountId) || empty($amount) || empty($date)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $mysqlDate = date('Y-m-d', strtotime($date));
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        // 1. Insert transfer
        $stmt = $pdo->prepare("INSERT INTO transfers (id, user_id, from_account_id, to_account_id, amount, date, description, created_at) VALUES (:id, :user_id, :from, :to, :amount, :date, :desc, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'from' => $fromAccountId,
            'to' => $toAccountId,
            'amount' => $amount,
            'date' => $mysqlDate,
            'desc' => $description,
            'created_at' => $mysqlCreatedAt
        ]);

        // 2. Deduct from source account
        $stmt = $pdo->prepare("UPDATE bank_accounts SET opening_balance = opening_balance - :amount WHERE id = :account_id AND user_id = :user_id");
        $stmt->execute([
            'amount' => $amount,
            'account_id' => $fromAccountId,
            'user_id' => $user_id
        ]);

        // 3. Add to destination account
        $stmt = $pdo->prepare("UPDATE bank_accounts SET opening_balance = opening_balance + :amount WHERE id = :account_id AND user_id = :user_id");
        $stmt->execute([
            'amount' => $amount,
            'account_id' => $toAccountId,
            'user_id' => $user_id
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
        echo json_encode(["success" => false, "error" => "Missing transfer id"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Get transfer details to revert balances
        $stmt = $pdo->prepare("SELECT amount, from_account_id, to_account_id FROM transfers WHERE id = :id AND user_id = :user_id LIMIT 1");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        $tx = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($tx) {
            // Revert source account (add back)
            $stmt = $pdo->prepare("UPDATE bank_accounts SET opening_balance = opening_balance + :amount WHERE id = :account_id AND user_id = :user_id");
            $stmt->execute([
                'amount' => $tx['amount'],
                'account_id' => $tx['from_account_id'],
                'user_id' => $user_id
            ]);

            // Revert destination account (deduct)
            $stmt = $pdo->prepare("UPDATE bank_accounts SET opening_balance = opening_balance - :amount WHERE id = :account_id AND user_id = :user_id");
            $stmt->execute([
                'amount' => $tx['amount'],
                'account_id' => $tx['to_account_id'],
                'user_id' => $user_id
            ]);

            // Delete transfer
            $stmt = $pdo->prepare("DELETE FROM transfers WHERE id = :id AND user_id = :user_id");
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

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
    $debt_id = $_GET['debt_id'] ?? null;
    if (!$debt_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing debt_id"]);
        exit;
    }
    try {
        // Validate ownership of debt
        $stmt = $pdo->prepare("SELECT id FROM debts WHERE id = :debt_id AND user_id = :user_id");
        $stmt->execute(['debt_id' => $debt_id, 'user_id' => $user_id]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Unauthorized access to this debt"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, amount, payment_date as paymentDate, notes, created_at as createdAt FROM debt_payments WHERE user_id = :user_id AND debt_id = :debt_id ORDER BY payment_date DESC, created_at DESC");
        $stmt->execute(['user_id' => $user_id, 'debt_id' => $debt_id]);
        $payments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['amount'] = (float)$row['amount'];
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            $payments[] = $row;
        }
        echo json_encode(["success" => true, "payments" => $payments]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = $input['id'] ?? uniqid();
    $debt_id = $input['debtId'] ?? null;
    $amount = isset($input['amount']) ? (float)$input['amount'] : 0;
    $paymentDate = $input['paymentDate'] ?? date('Y-m-d');
    $notes = $input['notes'] ?? null;
    
    if (!$debt_id || $amount <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields or invalid amount"]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Check ownership and current remaining amount
        $stmt = $pdo->prepare("SELECT id, remaining_amount as remainingAmount, original_amount as originalAmount FROM debts WHERE id = :debt_id AND user_id = :user_id FOR UPDATE");
        $stmt->execute(['debt_id' => $debt_id, 'user_id' => $user_id]);
        $debt = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$debt) {
            $pdo->rollBack();
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Unauthorized access to this debt"]);
            exit;
        }

        $remaining = (float)$debt['remainingAmount'];
        if ($amount > $remaining) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Payment amount exceeds remaining debt"]);
            exit;
        }

        $newRemaining = $remaining - $amount;
        $newStatus = $newRemaining <= 0 ? 'paid' : 'partially_paid';

        // Insert payment
        $stmt = $pdo->prepare("INSERT INTO debt_payments (id, user_id, debt_id, amount, payment_date, notes) VALUES (:id, :user_id, :debt_id, :amount, :payment_date, :notes)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'debt_id' => $debt_id,
            'amount' => $amount,
            'payment_date' => $paymentDate,
            'notes' => $notes
        ]);

        // Update debt
        $stmt = $pdo->prepare("UPDATE debts SET remaining_amount = :remaining, status = :status WHERE id = :debt_id AND user_id = :user_id");
        $stmt->execute([
            'remaining' => $newRemaining,
            'status' => $newStatus,
            'debt_id' => $debt_id,
            'user_id' => $user_id
        ]);

        $pdo->commit();
        echo json_encode(["success" => true, "remainingAmount" => $newRemaining, "status" => $newStatus]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);

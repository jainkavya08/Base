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
        $stmt = $pdo->prepare("SELECT id, type, person_or_organization as person, title, original_amount as originalAmount, remaining_amount as remainingAmount, status, notes, due_date as dueDate, created_at as createdAt FROM debts WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->execute(['user_id' => $user_id]);
        $debts = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['originalAmount'] = (float)$row['originalAmount'];
            $row['remainingAmount'] = (float)$row['remainingAmount'];
            $row['createdAt'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['createdAt']));
            $debts[] = $row;
        }
        echo json_encode(["success" => true, "debts" => $debts]);
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
    $person = $input['personOrOrganization'] ?? 'Unknown';
    $type = $input['type'] ?? 'owed_to_you';
    $originalAmount = $input['originalAmount'] ?? 0;
    $remainingAmount = $input['remainingAmount'] ?? $originalAmount;
    $status = $input['status'] ?? 'outstanding';
    $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
    
    if (empty($title) || empty($type)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit;
    }

    try {
        $mysqlCreatedAt = date('Y-m-d H:i:s', strtotime($createdAt));

        $stmt = $pdo->prepare("INSERT INTO debts (id, user_id, title, person_or_organization, type, original_amount, remaining_amount, status, created_at) VALUES (:id, :user_id, :title, :person, :type, :original, :remaining, :status, :created_at)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'title' => $title,
            'person' => $person,
            'type' => $type,
            'original' => $originalAmount,
            'remaining' => $remainingAmount,
            'status' => $status,
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
        $stmt = $pdo->prepare("DELETE FROM debts WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
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
        echo json_encode(["success" => false, "error" => "Missing id"]);
        exit;
    }

    $title = $input['title'] ?? null;
    $person = $input['personOrOrganization'] ?? null;
    $type = $input['type'] ?? null;
    $originalAmount = isset($input['originalAmount']) ? (float)$input['originalAmount'] : null;
    $notes = $input['notes'] ?? null;
    $dueDate = $input['dueDate'] ?? null;

    if (!$title || !$type || $originalAmount === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        exit;
    }

    try {
        // Fetch current debt to adjust remaining_amount if original_amount changes
        $stmt = $pdo->prepare("SELECT original_amount as originalAmount, remaining_amount as remainingAmount FROM debts WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        $debt = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$debt) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Debt not found"]);
            exit;
        }

        $oldOriginal = (float)$debt['originalAmount'];
        $oldRemaining = (float)$debt['remainingAmount'];
        
        $paidAmount = $oldOriginal - $oldRemaining;
        
        // Ensure the new original amount isn't less than what is already paid
        if ($originalAmount < $paidAmount) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Original amount cannot be less than the already paid amount"]);
            exit;
        }

        $newRemaining = $originalAmount - $paidAmount;
        $newStatus = $newRemaining <= 0 ? 'paid' : ($newRemaining < $originalAmount ? 'partially_paid' : 'outstanding');

        $stmt = $pdo->prepare("UPDATE debts SET title = :title, person_or_organization = :person, type = :type, original_amount = :original, remaining_amount = :remaining, status = :status, notes = :notes, due_date = :due_date WHERE id = :id AND user_id = :user_id");
        $stmt->execute([
            'title' => $title,
            'person' => $person,
            'type' => $type,
            'original' => $originalAmount,
            'remaining' => $newRemaining,
            'status' => $newStatus,
            'notes' => $notes,
            'due_date' => $dueDate,
            'id' => $id,
            'user_id' => $user_id
        ]);

        echo json_encode(["success" => true, "remainingAmount" => $newRemaining, "status" => $newStatus]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);

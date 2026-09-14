<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "synced" => false,
        "error" => "Authentication required"
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$id = $input['id'] ?? null;
$duration_minutes = isset($input['duration_minutes']) ? (int)$input['duration_minutes'] : null;
$completed_at = isset($input['completed_at']) ? date('Y-m-d H:i:s', strtotime($input['completed_at'])) : null;
$type = $input['type'] ?? null;
$status = $input['status'] ?? null;
$task_id = $input['task_id'] ?? null;

// Validation
if (!$id || !$duration_minutes || !$completed_at || !$type || !$status) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "synced" => false,
        "error" => "Missing required fields"
    ]);
    exit;
}

require_once '../config/database.php';

try {
    // Duplicate protection
    $checkStmt = $pdo->prepare("SELECT id FROM pomodoro_sessions WHERE id = :id AND user_id = :user_id");
    $checkStmt->execute([
        'id' => $id,
        'user_id' => $_SESSION['user_id']
    ]);
    
    if ($checkStmt->fetch()) {
        // Already exists, return success idempotently
        echo json_encode([
            "success" => true,
            "synced" => true,
            "duplicate" => true
        ]);
        exit;
    }

    // Verify task ownership if a task_id is provided
    if ($task_id !== null) {
        $taskCheck = $pdo->prepare("SELECT id FROM tasks WHERE id = :task_id AND user_id = :user_id");
        $taskCheck->execute([
            'task_id' => $task_id,
            'user_id' => $_SESSION['user_id']
        ]);
        if (!$taskCheck->fetch()) {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "synced" => false,
                "error" => "Invalid task"
            ]);
            exit;
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO pomodoro_sessions 
        (id, user_id, task_id, duration_minutes, completed_at, type, status) 
        VALUES 
        (:id, :user_id, :task_id, :duration_minutes, :completed_at, :type, :status)
    ");
    
    $stmt->execute([
        'id' => $id,
        'user_id' => $_SESSION['user_id'],
        'task_id' => $task_id,
        'duration_minutes' => $duration_minutes,
        'completed_at' => $completed_at,
        'type' => $type,
        'status' => $status
    ]);
    
    echo json_encode([
        "success" => true,
        "synced" => true
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "synced" => false,
        "error" => "Database error"
    ]);
}

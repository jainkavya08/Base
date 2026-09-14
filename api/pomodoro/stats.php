<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => "Authentication required"
    ]);
    exit;
}

require_once '../config/database.php';

try {
    // Get all valid pomodoro sessions for the user, ordered by completion date descending
    $stmt = $pdo->prepare("
        SELECT id, task_id, duration_minutes, completed_at, type, status 
        FROM pomodoro_sessions 
        WHERE user_id = :user_id 
        ORDER BY completed_at DESC
    ");
    
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    
    $sessions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Convert integer fields appropriately
        $row['duration_minutes'] = (int)$row['duration_minutes'];
        // Format datetime to ISO 8601 for JS compatibility
        $row['completed_at'] = date('Y-m-d\TH:i:s.000\Z', strtotime($row['completed_at']));
        // Map db keys to frontend keys
        $sessions[] = [
            'id' => $row['id'],
            'taskId' => $row['task_id'],
            'durationMinutes' => $row['duration_minutes'],
            'completedAt' => $row['completed_at'],
            'type' => $row['type'],
            'status' => $row['status']
        ];
    }
    
    echo json_encode([
        "success" => true,
        "sessions" => $sessions
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error"
    ]);
}

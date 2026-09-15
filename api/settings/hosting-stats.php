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
    $user_id = $_SESSION['user_id'];
    
    // Total files for the user
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM files WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $files_count = (int)$stmt->fetchColumn();

    // User-scoped records across all relevant tables
    $tables = [
        'files', 'todo_lists', 'tasks', 'habits', 'habit_completions', 
        'pomodoro_sessions', 'pomodoro_settings', 'reminders', 'bank_accounts', 
        'finance_categories', 'recurring_payments', 'transactions', 'transfers', 
        'investments', 'debts', 'debt_payments'
    ];
    
    $total_records = 0;
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $user_id]);
        $total_records += (int)$stmt->fetchColumn();
    }
    
    // Add 1 for the user record itself
    $total_records += 1;

    // Database size query (Information Schema) - we'll try it safely
    // $pdo->query("SELECT database()") returns current database name
    $db_name_stmt = $pdo->query("SELECT DATABASE()");
    $db_name = $db_name_stmt->fetchColumn();
    
    $db_size_mb = null;
    if ($db_name) {
        try {
            $size_stmt = $pdo->prepare("
                SELECT SUM(data_length + index_length) / 1024 / 1024 AS size_mb 
                FROM information_schema.TABLES 
                WHERE table_schema = :db_name
            ");
            $size_stmt->execute(['db_name' => $db_name]);
            $result = $size_stmt->fetchColumn();
            if ($result !== null) {
                $db_size_mb = round((float)$result, 2);
            }
        } catch (PDOException $e) {
            // information_schema might be restricted on InfinityFree, ignore if it fails
        }
    }

    echo json_encode([
        "success" => true,
        "files" => [
            "count" => $files_count,
            "bytes" => null // Not applicable/available for Todo Files
        ],
        "database" => [
            "tables" => count($tables) + 1, // +1 for users table
            "user_records" => $total_records,
            "size_mb" => $db_size_mb
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error"
    ]);
}

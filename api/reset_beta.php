<?php
// /api/reset_beta.php
require_once __DIR__ . '/config/database.php';

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");

    $tables = [
        'tasks',
        'todo_lists',
        'files',
        'habit_completions',
        'habits',
        'pomodoro_sessions',
        'pomodoro_settings',
        'reminders',
        'transactions',
        'transfers',
        'recurring_payments',
        'debt_payments',
        'debts',
        'investments',
        'finance_categories',
        'bank_accounts'
    ];

    foreach ($tables as $table) {
        $stmt = $pdo->prepare("DELETE FROM $table WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $_SESSION['user_id']]);
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo json_encode([
        'success' => true,
        'message' => 'Beta data reset successfully for the authenticated user.'
    ]);
} catch (PDOException $e) {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

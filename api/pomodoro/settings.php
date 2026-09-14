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
        $stmt = $pdo->prepare("SELECT focus_duration, short_break_duration, long_break_duration, auto_start_break, auto_start_focus FROM pomodoro_settings WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            echo json_encode([
                "success" => true,
                "settings" => [
                    "focusDuration" => (int)$row['focus_duration'],
                    "shortBreakDuration" => (int)$row['short_break_duration'],
                    "longBreakDuration" => (int)$row['long_break_duration'],
                    "autoStartBreaks" => (bool)$row['auto_start_break'],
                    "autoStartFocus" => (bool)$row['auto_start_focus']
                ]
            ]);
        } else {
            // Return defaults if not set
            echo json_encode([
                "success" => true,
                "settings" => null
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $focus = isset($input['focusDuration']) ? (int)$input['focusDuration'] : 25;
    $short = isset($input['shortBreakDuration']) ? (int)$input['shortBreakDuration'] : 5;
    $long = isset($input['longBreakDuration']) ? (int)$input['longBreakDuration'] : 15;
    $autoBreak = isset($input['autoStartBreaks']) ? (int)(bool)$input['autoStartBreaks'] : 0;
    $autoFocus = isset($input['autoStartFocus']) ? (int)(bool)$input['autoStartFocus'] : 0;

    try {
        $id = uniqid();
        $stmt = $pdo->prepare("
            INSERT INTO pomodoro_settings (id, user_id, focus_duration, short_break_duration, long_break_duration, auto_start_break, auto_start_focus)
            VALUES (:id, :user_id, :focus, :short, :long, :autoBreak, :autoFocus)
            ON DUPLICATE KEY UPDATE
            focus_duration = VALUES(focus_duration),
            short_break_duration = VALUES(short_break_duration),
            long_break_duration = VALUES(long_break_duration),
            auto_start_break = VALUES(auto_start_break),
            auto_start_focus = VALUES(auto_start_focus)
        ");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'focus' => $focus,
            'short' => $short,
            'long' => $long,
            'autoBreak' => $autoBreak,
            'autoFocus' => $autoFocus
        ]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);

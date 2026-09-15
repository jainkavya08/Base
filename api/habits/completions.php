<?php
require_once __DIR__ . '/../config/database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

header('Content-Type: application/json');

try {
    if ($method === 'GET') {
        $stmt = $db->prepare("SELECT 
            id, 
            habit_id as habitId, 
            date, 
            value 
            FROM habit_completions WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $user_id]);
        
        $completions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transform for frontend
        foreach ($completions as &$completion) {
            if ($completion['value'] !== null) {
                $completion['value'] = (int)$completion['value'];
            }
        }
        
        echo json_encode(['success' => true, 'completions' => $completions]);
    } 
    elseif ($method === 'POST') {
        // Upsert logic for completions
        $id = $input['id'] ?? uniqid('', true);
        $habit_id = $input['habitId'];
        $date = $input['date']; // Expect YYYY-MM-DD
        $value = $input['value'] ?? null;
        
        // Verify habit ownership
        $habitCheck = $db->prepare("SELECT id FROM habits WHERE id = :habit_id AND user_id = :user_id");
        $habitCheck->execute(['habit_id' => $habit_id, 'user_id' => $user_id]);
        if (!$habitCheck->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Invalid habit']);
            exit;
        }

        // Insert or update (upsert)
        $stmt = $db->prepare("INSERT INTO habit_completions (id, user_id, habit_id, date, value) 
                              VALUES (:id, :user_id, :habit_id, :date, :value)
                              ON DUPLICATE KEY UPDATE value = :value2");
        
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'habit_id' => $habit_id,
            'date' => $date,
            'value' => $value,
            'value2' => $value
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    }
    elseif ($method === 'DELETE') {
        // Delete a completion record
        if (isset($input['id'])) {
            $stmt = $db->prepare("DELETE FROM habit_completions WHERE id = :id AND user_id = :user_id");
            $stmt->execute(['id' => $input['id'], 'user_id' => $user_id]);
        } else if (isset($input['habitId']) && isset($input['date'])) {
            $stmt = $db->prepare("DELETE FROM habit_completions WHERE habit_id = :habit_id AND date = :date AND user_id = :user_id");
            $stmt->execute([
                'habit_id' => $input['habitId'],
                'date' => $input['date'],
                'user_id' => $user_id
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing id or habitId/date']);
            exit;
        }
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

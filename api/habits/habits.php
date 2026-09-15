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
        $stmt = $pdo->prepare("SELECT 
            id, 
            title, 
            type, 
            description, 
            active_days as activeDays, 
            target, 
            unit, 
            icon, 
            color, 
            reminder_time as reminderTime, 
            paused, 
            created_at as createdAt 
            FROM habits WHERE user_id = :user_id ORDER BY created_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        
        $habits = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transform JSON strings and booleans for frontend
        foreach ($habits as &$habit) {
            $habit['activeDays'] = $habit['activeDays'] ? json_decode($habit['activeDays'], true) : [];
            $habit['paused'] = (bool)$habit['paused'];
            // Frontend might expect target as number
            if ($habit['target'] !== null) {
                $habit['target'] = (int)$habit['target'];
            }
        }
        
        echo json_encode(['success' => true, 'habits' => $habits]);
    } 
    elseif ($method === 'POST') {
        $id = $input['id'] ?? uniqid('', true);
        $title = $input['title'];
        $type = $input['type'];
        $description = $input['description'] ?? null;
        $active_days = isset($input['activeDays']) ? json_encode($input['activeDays']) : null;
        $target = $input['target'] ?? null;
        $unit = $input['unit'] ?? null;
        $icon = $input['icon'] ?? null;
        $color = $input['color'] ?? null;
        $reminder_time = $input['reminderTime'] ?? null;
        $paused = isset($input['paused']) && $input['paused'] ? 1 : 0;
        
        $stmt = $pdo->prepare("INSERT INTO habits (id, user_id, title, type, description, active_days, target, unit, icon, color, reminder_time, paused) 
                              VALUES (:id, :user_id, :title, :type, :description, :active_days, :target, :unit, :icon, :color, :reminder_time, :paused)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'title' => $title,
            'type' => $type,
            'description' => $description,
            'active_days' => $active_days,
            'target' => $target,
            'unit' => $unit,
            'icon' => $icon,
            'color' => $color,
            'reminder_time' => $reminder_time,
            'paused' => $paused
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    }
    elseif ($method === 'PUT') {
        $id = $input['id'];
        
        // Build dynamic update query based on provided fields
        $fields = [];
        $params = ['id' => $id, 'user_id' => $user_id];
        
        if (isset($input['title'])) { $fields[] = 'title = :title'; $params['title'] = $input['title']; }
        if (isset($input['type'])) { $fields[] = 'type = :type'; $params['type'] = $input['type']; }
        if (array_key_exists('description', $input)) { $fields[] = 'description = :description'; $params['description'] = $input['description']; }
        if (isset($input['activeDays'])) { $fields[] = 'active_days = :active_days'; $params['active_days'] = json_encode($input['activeDays']); }
        if (array_key_exists('target', $input)) { $fields[] = 'target = :target'; $params['target'] = $input['target']; }
        if (array_key_exists('unit', $input)) { $fields[] = 'unit = :unit'; $params['unit'] = $input['unit']; }
        if (array_key_exists('icon', $input)) { $fields[] = 'icon = :icon'; $params['icon'] = $input['icon']; }
        if (array_key_exists('color', $input)) { $fields[] = 'color = :color'; $params['color'] = $input['color']; }
        if (array_key_exists('reminderTime', $input)) { $fields[] = 'reminder_time = :reminder_time'; $params['reminder_time'] = $input['reminderTime']; }
        if (isset($input['paused'])) { $fields[] = 'paused = :paused'; $params['paused'] = $input['paused'] ? 1 : 0; }
        
        if (empty($fields)) {
            echo json_encode(['success' => true]);
            exit;
        }

        $sql = "UPDATE habits SET " . implode(', ', $fields) . " WHERE id = :id AND user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $input['id'];
        
        // On delete cascade handles completions
        $stmt = $pdo->prepare("DELETE FROM habits WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}

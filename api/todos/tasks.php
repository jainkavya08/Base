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
        $stmt = $pdo->prepare("SELECT id, list_id as listId, parent_task_id as parentTaskId, title, description, completed, due_date as dueDate, priority, status, position, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE user_id = :user_id ORDER BY created_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Cast completed to boolean for frontend
        foreach ($tasks as &$task) {
            $task['completed'] = (bool)$task['completed'];
        }
        
        echo json_encode(['success' => true, 'tasks' => $tasks]);
    } 
    elseif ($method === 'PUT') {
        if (isset($input['action']) && $input['action'] === 'toggle') {
            $id = $input['id'];
            $completed = $input['completed'] ? 1 : 0;
            $updated_at = date('Y-m-d H:i:s');
            
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE tasks SET completed = :completed, updated_at = :updated_at WHERE id = :id AND user_id = :user_id");
            $stmt->execute([
                'id' => $id,
                'user_id' => $user_id,
                'completed' => $completed,
                'updated_at' => $updated_at
            ]);
            
            // Note: In Dexie we had recursive toggle, we'll keep it simple or implement recursive if needed
            
            $pdo->commit();
            echo json_encode(['success' => true]);
            exit;
        }

        $id = $input['id'] ?? uniqid('', true);
        $list_id = $input['listId'];
        $parent_task_id = $input['parentTaskId'] ?? null;
        $title = $input['title'];
        $desc = $input['description'] ?? null;
        $completed = ($input['completed'] ?? false) ? 1 : 0;
        $due_date = $input['dueDate'] ?? null;
        $priority = $input['priority'] ?? 'medium';
        
        // Verify list ownership
        $stmtList = $pdo->prepare("SELECT id FROM todo_lists WHERE id = :list_id AND user_id = :user_id");
        $stmtList->execute(['list_id' => $list_id, 'user_id' => $user_id]);
        if (!$stmtList->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'List not found or access denied']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO tasks (id, user_id, list_id, parent_task_id, title, description, completed, due_date, priority) VALUES (:id, :user_id, :list_id, :parent_task_id, :title, :description, :completed, :due_date, :priority)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'list_id' => $list_id,
            'parent_task_id' => $parent_task_id,
            'title' => $title,
            'description' => $desc,
            'completed' => $completed,
            'due_date' => $due_date,
            'priority' => $priority
        ]);
        
        $fields = [];
        $params = ['id' => $id, 'user_id' => $user_id];
        
        if (isset($input['title'])) { $fields[] = 'title = :title'; $params['title'] = $input['title']; }
        if (isset($input['description'])) { $fields[] = 'description = :description'; $params['description'] = $input['description']; }
        if (isset($input['completed'])) { $fields[] = 'completed = :completed'; $params['completed'] = $input['completed'] ? 1 : 0; }
        if (isset($input['dueDate'])) { $fields[] = 'due_date = :due_date'; $params['due_date'] = $input['dueDate']; }
        if (isset($input['priority'])) { $fields[] = 'priority = :priority'; $params['priority'] = $input['priority']; }
        if (isset($input['listId'])) { $fields[] = 'list_id = :list_id'; $params['list_id'] = $input['listId']; }
        
        if (empty($fields)) {
            echo json_encode(['success' => true]);
            exit;
        }
        
        $sql = "UPDATE tasks SET " . implode(", ", $fields) . " WHERE id = :id AND user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $input['id'];
        
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}

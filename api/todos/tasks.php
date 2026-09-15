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
        $stmt = $db->prepare("SELECT id, list_id as listId, parent_task_id as parentTaskId, title, description, completed, due_date as dueDate, priority, status, position, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE user_id = :user_id ORDER BY created_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Cast completed to boolean for frontend compatibility
        foreach ($tasks as &$task) {
            $task['completed'] = (bool)$task['completed'];
        }
        
        echo json_encode(['success' => true, 'tasks' => $tasks]);
    } 
    elseif ($method === 'POST') {
        if (isset($input['bulk']) && $input['bulk'] === true) {
            // Handle bulk updates (like toggling parent + subtasks)
            $updates = $input['updates'];
            $db->beginTransaction();
            $stmt = $db->prepare("UPDATE tasks SET completed = :completed, updated_at = :updated_at WHERE id = :id AND user_id = :user_id");
            foreach ($updates as $update) {
                $stmt->execute([
                    'completed' => $update['changes']['completed'] ? 1 : 0,
                    'updated_at' => $update['changes']['updatedAt'] ?? date('Y-m-d H:i:s'),
                    'id' => $update['key'],
                    'user_id' => $user_id
                ]);
            }
            $db->commit();
            echo json_encode(['success' => true]);
            exit;
        }

        $id = $input['id'] ?? uniqid('', true);
        $list_id = $input['listId'];
        $title = $input['title'];
        $desc = $input['description'] ?? null;
        $completed = $input['completed'] ? 1 : 0;
        $due_date = $input['dueDate'] ?? null;
        $priority = $input['priority'] ?? 'medium';
        $parent_task_id = $input['parentTaskId'] ?? null;
        
        // Verify ownership of the list
        $stmtList = $db->prepare("SELECT id FROM todo_lists WHERE id = :list_id AND user_id = :user_id");
        $stmtList->execute(['list_id' => $list_id, 'user_id' => $user_id]);
        if (!$stmtList->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'List not found or access denied']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO tasks (id, user_id, list_id, parent_task_id, title, description, completed, due_date, priority) VALUES (:id, :user_id, :list_id, :parent_task_id, :title, :description, :completed, :due_date, :priority)");
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
        
        echo json_encode(['success' => true, 'id' => $id]);
    }
    elseif ($method === 'PUT') {
        $id = $input['id'];
        
        // Build dynamic update query based on provided fields
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

        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $input['id'];
        
        $stmt = $db->prepare("DELETE FROM tasks WHERE id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $id, 'user_id' => $user_id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    }
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}

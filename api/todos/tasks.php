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
        $stmt = $pdo->prepare("SELECT id, list_id as listId, parent_task_id as parentTaskId, title, description, completed, due_date as dueDate, priority, status, position, created_at as createdAt, updated_at as updatedAt FROM tasks WHERE user_id = :user_id ORDER BY position ASC, created_at ASC");
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
            $status = $completed ? 'completed' : 'todo';
            $updated_at = date('Y-m-d H:i:s');
            
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE tasks SET completed = :completed, status = :status, updated_at = :updated_at WHERE id = :id AND user_id = :user_id");
            $stmt->execute([
                'id' => $id,
                'user_id' => $user_id,
                'completed' => $completed,
                'status' => $status,
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

        // Check if task exists
        $stmtCheck = $pdo->prepare("SELECT id FROM tasks WHERE id = :id AND user_id = :user_id");
        $stmtCheck->execute(['id' => $id, 'user_id' => $user_id]);
        $exists = $stmtCheck->fetch();

        if (!$exists) {
            $stmt = $pdo->prepare("INSERT INTO tasks (id, user_id, list_id, parent_task_id, title, description, completed, due_date, priority, status, position) VALUES (:id, :user_id, :list_id, :parent_task_id, :title, :description, :completed, :due_date, :priority, :status, :position)");
            $stmt->execute([
                'id' => $id,
                'user_id' => $user_id,
                'list_id' => $list_id,
                'parent_task_id' => $parent_task_id,
                'title' => $title,
                'description' => $desc,
                'completed' => $completed,
                'due_date' => $due_date,
                'priority' => $priority,
                'status' => $input['status'] ?? ($completed ? 'completed' : 'todo'),
                'position' => $input['position'] ?? 0
            ]);
        }
        
        $fields = [];
        $params = ['id' => $id, 'user_id' => $user_id];
        
        if (isset($input['title'])) { $fields[] = 'title = :title'; $params['title'] = $input['title']; }
        if (isset($input['description'])) { $fields[] = 'description = :description'; $params['description'] = $input['description']; }
        if (isset($input['completed'])) { 
            $fields[] = 'completed = :completed'; 
            $params['completed'] = $input['completed'] ? 1 : 0;
            // Also sync status if completed changes directly
            $fields[] = 'status = :status_val';
            $params['status_val'] = $input['completed'] ? 'completed' : 'todo';
        }
        if (isset($input['dueDate'])) { $fields[] = 'due_date = :due_date'; $params['due_date'] = $input['dueDate']; }
        if (isset($input['priority'])) { $fields[] = 'priority = :priority'; $params['priority'] = $input['priority']; }
        if (isset($input['listId'])) { $fields[] = 'list_id = :list_id'; $params['list_id'] = $input['listId']; }
        if (isset($input['status'])) { $fields[] = 'status = :status'; $params['status'] = $input['status']; }
        if (isset($input['position'])) { $fields[] = 'position = :position'; $params['position'] = $input['position']; }
        if (isset($input['parentTaskId'])) { $fields[] = 'parent_task_id = :parent_task_id'; $params['parent_task_id'] = $input['parentTaskId']; }
        
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

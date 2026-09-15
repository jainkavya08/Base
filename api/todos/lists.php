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
        $stmt = $db->prepare("SELECT id, file_id as fileId, name, description, default_view as defaultView, created_at as createdAt, updated_at as updatedAt FROM todo_lists WHERE user_id = :user_id ORDER BY created_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        echo json_encode(['success' => true, 'lists' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 
    elseif ($method === 'POST') {
        $id = $input['id'] ?? uniqid('', true);
        $file_id = $input['fileId'];
        $name = $input['name'];
        $desc = $input['description'] ?? null;
        $default_view = $input['defaultView'] ?? 'list';
        
        // Verify ownership of the file
        $stmtFile = $db->prepare("SELECT id FROM files WHERE id = :file_id AND user_id = :user_id");
        $stmtFile->execute(['file_id' => $file_id, 'user_id' => $user_id]);
        if (!$stmtFile->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'File not found or access denied']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO todo_lists (id, user_id, file_id, name, description, default_view) VALUES (:id, :user_id, :file_id, :name, :description, :default_view)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'file_id' => $file_id,
            'name' => $name,
            'description' => $desc,
            'default_view' => $default_view
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    }
    elseif ($method === 'PUT') {
        $id = $input['id'];
        $name = $input['name'] ?? null;
        $desc = $input['description'] ?? null;
        $default_view = $input['defaultView'] ?? null;
        
        if ($default_view !== null) {
            $stmt = $db->prepare("UPDATE todo_lists SET default_view = :default_view WHERE id = :id AND user_id = :user_id");
            $stmt->execute(['id' => $id, 'user_id' => $user_id, 'default_view' => $default_view]);
        } else {
            $stmt = $db->prepare("UPDATE todo_lists SET name = :name, description = :description WHERE id = :id AND user_id = :user_id");
            $stmt->execute(['id' => $id, 'user_id' => $user_id, 'name' => $name, 'description' => $desc]);
        }
        
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $input['id'];
        
        $stmt = $db->prepare("DELETE FROM todo_lists WHERE id = :id AND user_id = :user_id");
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

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
        $stmt = $pdo->prepare("SELECT id, name, description, created_at as createdAt, updated_at as updatedAt FROM files WHERE user_id = :user_id ORDER BY created_at ASC");
        $stmt->execute(['user_id' => $user_id]);
        echo json_encode(['success' => true, 'files' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 
    elseif ($method === 'POST') {
        $id = $input['id'] ?? uniqid('', true); // fallback if not provided
        $name = $input['name'];
        $desc = $input['description'] ?? null;
        
        $stmt = $pdo->prepare("INSERT INTO files (id, user_id, name, description) VALUES (:id, :user_id, :name, :description)");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'name' => $name,
            'description' => $desc
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    }
    elseif ($method === 'PUT') {
        $id = $input['id'];
        $name = $input['name'];
        $desc = $input['description'] ?? null;
        
        $stmt = $pdo->prepare("UPDATE files SET name = :name, description = :description WHERE id = :id AND user_id = :user_id");
        $stmt->execute([
            'id' => $id,
            'user_id' => $user_id,
            'name' => $name,
            'description' => $desc
        ]);
        
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $input['id'];
        
        $stmt = $pdo->prepare("DELETE FROM files WHERE id = :id AND user_id = :user_id");
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

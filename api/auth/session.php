<?php
session_start();
header('Content-Type: application/json');

// Check if already authenticated
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["authenticated" => false]);
    exit;
}

require_once '../config/database.php';

try {
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode([
            "authenticated" => true,
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email']
            ]
        ]);
    } else {
        // Session ID doesn't exist in DB (e.g. user deleted)
        session_destroy();
        echo json_encode(["authenticated" => false]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["authenticated" => false, "error" => "Database error"]);
}

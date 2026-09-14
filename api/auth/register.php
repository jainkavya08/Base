<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$confirmPassword = $input['confirmPassword'] ?? '';

// Validation
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email, and password are required."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format."]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 8 characters."]);
    exit;
}

if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(["error" => "Passwords do not match."]);
    exit;
}

require_once '../config/database.php';

try {
    // Check for existing email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Email is already registered."]);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // UUID v4 equivalent generation for MySQL insertion (if db doesn't default to it, we can use UUID() in query)
    $stmt = $pdo->prepare("
        INSERT INTO users (id, name, email, password_hash, created_at, updated_at) 
        VALUES (UUID(), :name, :email, :password_hash, NOW(), NOW())
    ");
    
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'password_hash' => $passwordHash
    ]);
    
    // Fetch the newly created user (since UUID() was generated in the DB)
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();
    
    // Set PHP Session
    $_SESSION['user_id'] = $user['id'];
    
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email']
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed. Please try again."]);
}

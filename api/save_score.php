<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['name']) && isset($data['score'])) {
        try {
            $stmt = $pdo->prepare("INSERT INTO scores (username, score) VALUES (?, ?)");
            $stmt->execute([$data['name'], $data['score']]);
            
            echo json_encode(['success' => true, 'message' => 'Score saved successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error saving score: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?> 
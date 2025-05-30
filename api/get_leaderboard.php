<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT username, score, created_at FROM scores ORDER BY score DESC LIMIT 100");
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'scores' => $scores]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching leaderboard: ' . $e->getMessage()]);
}
?> 
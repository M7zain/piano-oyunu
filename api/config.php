<?php
// Google Drive Links for Leaderboard
$LEADERBOARD_URL = "https://docs.google.com/spreadsheets/d/1YXwxX8wyI6c0T5zY_W7LK3eGDY8RDX-y5HQjVHsjOYE/edit?usp=sharing";
$SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvbVZYgBgS5XOdX_5V3qGwZM2HJTZwRvWVUNxhvYYM4nd1LiRf4LL0KwxGfWZhsXNB/exec";

// Database configuration for Hostinger
$host = 'srv1924.hstgr.io';
$dbname = 'u274988421_pianotiles';
$username = 'u274988421_admin';
$password = 'TP#b)d3BN5oY0SxoKByg*tG(';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?> 
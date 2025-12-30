<?php
// backend/api/db.php

// CORS Headers for development (Allow local React app)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = '127.0.0.1'; // Localhost or Server IP if remote
$db   = 'bitnami_app'; // Default Bitnami DB or custom
$user = 'root';
$pass = 'XvHxGox84PU/'; // Provided by user
$charset = 'utf8mb4';

// When running on the actual server (15.164.161.165), localhost is correct.
// If connecting remotely, IP would be needed, but usually we deploy code to server.

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // In production, log this error instead of returning it
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>

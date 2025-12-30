<?php
// backend/api/auth.php - Google Login & Rate Limiting
require_once 'db.php';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Admin emails (no limit)
$ADMIN_EMAILS = ['phploveme@gmail.com'];
$DAILY_LIMIT = 2;

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_GET['action'] ?? '';

    switch ($action) {
        case 'login':
            // Google login - store/update user
            $email = $input['email'] ?? '';
            $name = $input['name'] ?? '';
            $picture = $input['picture'] ?? '';
            
            if (empty($email)) {
                throw new Exception('Email is required');
            }

            // Check if user exists
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user) {
                // Update last login
                $stmt = $pdo->prepare("UPDATE users SET name = ?, picture = ?, last_login = NOW() WHERE email = ?");
                $stmt->execute([$name, $picture, $email]);
            } else {
                // Create new user
                $stmt = $pdo->prepare("INSERT INTO users (email, name, picture, created_at, last_login) VALUES (?, ?, ?, NOW(), NOW())");
                $stmt->execute([$email, $name, $picture]);
            }

            // Get user with today's count
            $isAdmin = in_array($email, $ADMIN_EMAILS);
            $todayCount = getTodayCount($pdo, $email);

            echo json_encode([
                'success' => true,
                'user' => [
                    'email' => $email,
                    'name' => $name,
                    'picture' => $picture,
                    'isAdmin' => $isAdmin,
                    'todayCount' => $todayCount,
                    'dailyLimit' => $isAdmin ? -1 : $DAILY_LIMIT,
                    'remaining' => $isAdmin ? -1 : max(0, $DAILY_LIMIT - $todayCount)
                ]
            ]);
            break;

        case 'check':
            // Check if user can generate
            $email = $input['email'] ?? '';
            
            if (empty($email)) {
                echo json_encode(['success' => false, 'canGenerate' => false, 'error' => 'Not logged in']);
                exit;
            }

            $isAdmin = in_array($email, $ADMIN_EMAILS);
            $todayCount = getTodayCount($pdo, $email);
            $canGenerate = $isAdmin || ($todayCount < $DAILY_LIMIT);

            echo json_encode([
                'success' => true,
                'canGenerate' => $canGenerate,
                'todayCount' => $todayCount,
                'dailyLimit' => $isAdmin ? -1 : $DAILY_LIMIT,
                'remaining' => $isAdmin ? -1 : max(0, $DAILY_LIMIT - $todayCount),
                'isAdmin' => $isAdmin
            ]);
            break;

        case 'increment':
            // Increment user's daily count after successful generation
            $email = $input['email'] ?? '';
            
            if (empty($email)) {
                throw new Exception('Email is required');
            }

            // Insert usage record
            $stmt = $pdo->prepare("INSERT INTO user_usage (email, created_at) VALUES (?, NOW())");
            $stmt->execute([$email]);

            $todayCount = getTodayCount($pdo, $email);
            $isAdmin = in_array($email, $ADMIN_EMAILS);

            echo json_encode([
                'success' => true,
                'todayCount' => $todayCount,
                'remaining' => $isAdmin ? -1 : max(0, $DAILY_LIMIT - $todayCount)
            ]);
            break;

        case 'status':
            // Get user status
            $email = $input['email'] ?? $_GET['email'] ?? '';
            
            if (empty($email)) {
                echo json_encode(['success' => false, 'error' => 'Not logged in']);
                exit;
            }

            $isAdmin = in_array($email, $ADMIN_EMAILS);
            $todayCount = getTodayCount($pdo, $email);

            echo json_encode([
                'success' => true,
                'email' => $email,
                'isAdmin' => $isAdmin,
                'todayCount' => $todayCount,
                'dailyLimit' => $isAdmin ? -1 : $DAILY_LIMIT,
                'remaining' => $isAdmin ? -1 : max(0, $DAILY_LIMIT - $todayCount)
            ]);
            break;

        default:
            throw new Exception('Invalid action');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// Helper function to get today's generation count
function getTodayCount($pdo, $email) {
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM user_usage WHERE email = ? AND DATE(created_at) = CURDATE()");
    $stmt->execute([$email]);
    $result = $stmt->fetch();
    return (int)($result['cnt'] ?? 0);
}
?>

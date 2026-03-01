<?php
/**
 * Обработчик AJAX запросов для сохранения настроек
 */

require_once 'accessibility.php';

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Проверка CSRF токена (если используете)
if (isset($_POST['csrf_token']) && $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
    exit;
}

$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action) {
    case 'save':
        if (isset($_POST['settings'])) {
            $settings = json_decode($_POST['settings'], true);
            if ($settings) {
                $result = $accessibility->saveSettings($settings);
                echo json_encode([
                    'success' => $result,
                    'settings' => $accessibility->getSettings(),
                    'body_classes' => $accessibility->getBodyClasses()
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid settings format']);
            }
        }
        break;
        
    case 'reset':
        $result = $accessibility->resetSettings();
        echo json_encode([
            'success' => $result,
            'settings' => $accessibility->getSettings(),
            'body_classes' => $accessibility->getBodyClasses()
        ]);
        break;
        
    case 'get':
        echo json_encode([
            'success' => true,
            'settings' => $accessibility->getSettings(),
            'body_classes' => $accessibility->getBodyClasses()
        ]);
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'Unknown action']);
}
?>

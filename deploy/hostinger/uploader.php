<?php
/**
 * Hostinger shared-hosting media receiver.
 * Upload to public_html/uploader.php. Our Astro server (never the browser) POSTs here
 * with header X-Upload-Secret; set the same value as HOSTINGER_UPLOAD_SECRET in .env.
 */
header('Content-Type: application/json');

$secret = getenv('UPLOAD_SECRET') ?: 'CHANGE_ME';           // or hard-code, then chmod 600
$allowed = ['jpg','jpeg','png','webp','avif','gif','mp4','webm'];
$dir = __DIR__ . '/uploads/';

if (($_SERVER['HTTP_X_UPLOAD_SECRET'] ?? '') !== $secret) {
    http_response_code(403); echo json_encode(['error' => 'Unauthorized']); exit;
}
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400); echo json_encode(['error' => 'No file']); exit;
}

$ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowed, true)) {
    http_response_code(415); echo json_encode(['error' => 'Unsupported type']); exit;
}

if (!is_dir($dir)) mkdir($dir, 0755, true);
$name = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $dir . $name)) {
    http_response_code(500); echo json_encode(['error' => 'Failed to save']); exit;
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
echo json_encode(['url' => "$scheme://{$_SERVER['HTTP_HOST']}/uploads/$name"]);

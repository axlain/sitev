<?php
namespace App\Middleware;

final class Cors
{
    public static function handle(): void
    {
        $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            // agrega tu dominio de prod aquí
        ];

        if ($origin && in_array($origin, $allowed, true)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header('Access-Control-Allow-Origin: *');
        }
        header('Vary: Origin');

        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        // NO pongas Allow-Credentials si NO usas cookies

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

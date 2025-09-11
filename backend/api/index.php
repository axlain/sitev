<?php
// --------------------------
// Mostrar errores en desarrollo
// --------------------------
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --------------------------
// Cabecera JSON
// --------------------------
header("Content-Type: application/json");

// --------------------------
// Determinar ruta y método
// --------------------------
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// --------------------------
// Ruteo hacia tus Routes
// --------------------------
if (strpos($request_uri, '/api/sitev') === 0) {
    include __DIR__ . '/../src/usuario/index.php'; // esto incluye tus Routes
} else {
    http_response_code(404);
    echo json_encode(["error" => "Ruta no encontrada"]);
}

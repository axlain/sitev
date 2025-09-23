<?php
use App\Escuela\Controllers\EscuelaController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'POST' && $request_uri === '/api/sitev/escuela/crear') {
    EscuelaController::crear();

} elseif ($request_method === 'PUT' && $request_uri === '/api/sitev/escuela/editar') {
    EscuelaController::editar();

} elseif ($request_method === 'DELETE' && $request_uri === '/api/sitev/escuela/eliminar') {
    EscuelaController::eliminar();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/escuela/buscar') {
    EscuelaController::buscar();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/escuela/todos') {
    EscuelaController::todos();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/escuela/detalle') {
    EscuelaController::detalle();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/escuela/porClave') {
    EscuelaController::porClave();

} else {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada en escuela'], JSON_UNESCAPED_UNICODE);
}

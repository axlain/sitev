<?php
use App\Maestro\Controllers\MaestroController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'POST' && $request_uri === '/api/sitev/maestro/crear') {
    MaestroController::crear();

} elseif ($request_method === 'PUT' && $request_uri === '/api/sitev/maestro/editar') {
    MaestroController::editar();

} elseif ($request_method === 'DELETE' && $request_uri === '/api/sitev/maestro/eliminar') {
    MaestroController::eliminar();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/maestro/buscar') {
    MaestroController::buscar();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/maestro/todos') {
    MaestroController::todos();

} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/maestro/detalle') {
    MaestroController::detalle();

} else {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada en maestro'], JSON_UNESCAPED_UNICODE);
}

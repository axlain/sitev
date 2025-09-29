<?php
use App\Middleware\AuthMiddleware;
use App\Tramite\Controllers\TramiteController;
use App\Tramite\Controllers\RequisitoController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

try {
    // Verificación de token en todas estas rutas
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null; // info básica del usuario logueado

    // --- Rutas para Trámites ---
    if ($request_method === "POST" && $request_uri === '/api/sitev/tramite/crear') {
        TramiteController::crear($usr);
    } elseif ($request_method === "PUT" && $request_uri === '/api/sitev/tramite/editar') {
        TramiteController::editar($usr);
    } elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/tramite/eliminar') {
        TramiteController::eliminar($usr);
    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/buscar') {
        TramiteController::buscar($usr);
    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/todos') {
        TramiteController::todos($usr);
    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/porArea') {
        TramiteController::porArea($usr);

    // --- Rutas para Requisitos ---
    } elseif ($request_method === "POST" && $request_uri === '/api/sitev/requisito/agregar') {
        RequisitoController::agregar($usr);
    } elseif ($request_method === "PUT" && $request_uri === '/api/sitev/requisito/editar') {
        RequisitoController::editar($usr);
    } elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/requisito/eliminar') {
        RequisitoController::eliminar($usr);
    } elseif ($request_method === "POST" && $request_uri === '/api/sitev/requisito/llenar') {
        RequisitoController::llenar($usr);
    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/requisito/porTramite') {
        RequisitoController::porTramite($usr);

    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
    }
} catch (\RuntimeException $ex) {
    // Errores de AuthMiddleware (401/403)
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()]);
}

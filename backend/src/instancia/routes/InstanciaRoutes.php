<?php
// src/instancia/routes/InstanciaRoutes.php
use App\Middleware\AuthMiddleware;
use App\Instancia\Controllers\InstanciaController;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Todas estas rutas requieren JWT:
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null; // ['id','nombre','email','id_area','rol']

    if ($method === 'POST' && $path === '/api/sitev/instancia/crear') {
        InstanciaController::crear($usr); // Body: { id_tramite, maestro_nombre }
        return;
    }

    if ($method === 'GET' && $path === '/api/sitev/instancia/detalle') {
        InstanciaController::detalle($usr); // ?id=ID_INSTANCIA
        return;
    }

    if ($method === 'POST' && $path === '/api/sitev/instancia/llenar') {
        InstanciaController::llenar($usr);  // Body: { id_instancia, id_requisito, valor }
        return;
    }

    if ($method === 'GET' && $path === '/api/sitev/instancia/buscar') {
        InstanciaController::buscar($usr);  // ?q=Nombre Maestro
        return;
    }

    if ($method === 'GET' && $path === '/api/sitev/instancia/mis') {
        InstanciaController::mis($usr);     // instancias del usuario autenticado
        return;
    }

    if ($method === 'GET' && $path === '/api/sitev/instancia/porTramite') {
        InstanciaController::porTramite($usr); // ?id_tramite=...
        return;
    }

    if ($method === 'GET' && $path === '/api/sitev/instancias') {
        // Historial con filtros: ?id_area=&q=&tipo=&maestro=
        InstanciaController::listar($usr);
        return;
    }

    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()]);
}

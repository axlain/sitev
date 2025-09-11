<?php
require_once __DIR__ . '/../controllers/UsuarioController.php';

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === "GET" && $request_uri === '/api/sitev/usuario/obtenerTodos') {
    UsuarioController::index();
} elseif ($request_method === 'POST' && $request_uri === '/api/sitev/usuario/crear') {
    UsuarioController::crearUsuario();
} elseif ($request_method === 'POST' && $request_uri === '/api/sitev/usuario/asignarArea') {
    UsuarioController::asignarAreaUsuario();
} 
?>

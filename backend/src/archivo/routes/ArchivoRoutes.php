<?php
use App\Archivo\Controllers\ArchivoController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Ruta para subir archivo
if ($request_method === "POST" && $request_uri === '/api/sitev/archivo/subir') {
    ArchivoController::subir();
}

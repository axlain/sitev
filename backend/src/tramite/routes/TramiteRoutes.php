<?php
use App\Tramite\Controllers\TramiteController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];
// ...
if ($request_method === "POST" && $request_uri === '/api/sitev/tramite/crear') { TramiteController::crear(); }
elseif ($request_method === "PUT" && $request_uri === '/api/sitev/tramite/editar') { TramiteController::editar(); }
elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/tramite/eliminar') { TramiteController::eliminar(); }
elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/buscar') { TramiteController::buscar(); }
elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/todos') { TramiteController::todos(); }
elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/porArea') { TramiteController::porArea(); }



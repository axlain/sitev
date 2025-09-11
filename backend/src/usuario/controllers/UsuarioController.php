<?php
// src/usuario/controllers/UsuarioController.php
require_once __DIR__ . '/../services/UsuarioService.php';

class UsuarioController
{
    public static function crearUsuario()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = UsuarioService::crearUsuario($input);
            http_response_code(201);
            echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/sitev/usuario/obtenerTodos */
    public static function index()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $usuarios = UsuarioService::obtenerTodosUsuarios();
            echo json_encode(['ok' => true, 'data' => $usuarios], JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/sitev/usuario/buscar?q=termino */
    public static function buscar()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $term = trim($_GET['q'] ?? '');
            if ($term === '') {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'Falta parámetro q'], JSON_UNESCAPED_UNICODE);
                return;
            }
            $res = UsuarioService::buscarUsuario($term);
            echo json_encode(['ok' => true, 'data' => $res], JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** PUT /api/sitev/usuario/editar?id=123  (o id en body) */
    public static function editar()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            // id por querystring o body
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'ID inválido'], JSON_UNESCAPED_UNICODE);
                return;
            }

            // No permitir body vacío
            $payload = $input;
            unset($payload['id']); // por seguridad
            if (empty($payload)) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'No hay campos para actualizar'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $ok = UsuarioService::editarUsuario($id, $payload);
            echo json_encode(['ok' => $ok], JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** DELETE /api/sitev/usuario/eliminar?id=123 */
    public static function eliminar()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'ID inválido'], JSON_UNESCAPED_UNICODE);
                return;
            }
            $ok = UsuarioService::eliminarUsuario($id);
            if (!$ok) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado'], JSON_UNESCAPED_UNICODE);
                return;
            }
            echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    /** GET /api/sitev/usuario/mostrarNombre?id=123 */
    public static function mostrarNombre()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'ID inválido'], JSON_UNESCAPED_UNICODE);
                return;
            }
            $nombre = UsuarioService::mostrarNombreUsuario($id);
            if ($nombre === null) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado'], JSON_UNESCAPED_UNICODE);
                return;
            }
            echo json_encode(['ok' => true, 'nombre' => $nombre], JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}

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
}

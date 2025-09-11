<?php
// src/usuario/services/UsuarioService.php
require_once __DIR__ . '/../models/Usuario.php';

class UsuarioService
{
    public static function crearUsuario(array $data): int
    {
        return Usuario::crearUsuario(
            $data['nombre'] ?? '',
            $data['email'] ?? '',
            $data['password'] ?? '',
            (int)($data['id_area'] ?? 0),
            $data['rol'] ?? ''
        );
    }
}

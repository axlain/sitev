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

    public static function editarUsuario(int $id, array $data): bool
    {
        // Filtrar sólo campos válidos
        $permitidos = ['nombre','email','password','id_area','rol'];
        $payload = array_intersect_key($data, array_flip($permitidos));
        return Usuario::editarUsuario($id, $payload);
    }

    public static function eliminarUsuario(int $id): bool
    {
        return Usuario::eliminarUsuario($id);
    }

    public static function buscarUsuario(string $term): array
    {
        return Usuario::buscarUsuario($term);
    }

    public static function obtenerTodosUsuarios(): array
    {
        return Usuario::obtenerTodosUsuarios();
    }

    public static function mostrarNombreUsuario(int $id): ?string
    {
        return Usuario::mostrarNombreUsuario($id);
    }
}

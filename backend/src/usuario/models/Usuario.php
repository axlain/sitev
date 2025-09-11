<?php
// src/usuario/models/Usuario.php
require_once __DIR__ . '/../../config/database.php';

class Usuario
{
    public static function crearUsuario(string $nombre, string $email, string $password, int $id_area, string $rol): int
    {
        $mysqli = db(); // ← AQUÍ obtenemos la conexión válida

        $sql = "INSERT INTO usuarios (nombre, email, password, id_area, rol) VALUES (?, ?, ?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException("Prepare failed: " . $mysqli->error);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        // tipos: nombre (s), email (s), password hash (s), id_area (i), rol (s)
        $stmt->bind_param("sssis", $nombre, $email, $hash, $id_area, $rol);

        if (!$stmt->execute()) {
            throw new RuntimeException("Execute failed: " . $stmt->error);
        }

        $id = $mysqli->insert_id;
        $stmt->close();
        return $id;
    }
}

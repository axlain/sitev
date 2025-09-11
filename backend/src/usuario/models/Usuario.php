<?php
// src/usuario/models/Usuario.php
require_once __DIR__ . '/../../config/database.php';

class Usuario
{
    public static function crearUsuario(string $nombre, string $email, string $password, int $id_area, string $rol): int
    {
        $mysqli = db();

        $sql = "INSERT INTO usuarios (nombre, email, password, id_area, rol) VALUES (?, ?, ?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException("Prepare failed: " . $mysqli->error);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt->bind_param("sssis", $nombre, $email, $hash, $id_area, $rol);

        if (!$stmt->execute()) {
            throw new RuntimeException("Execute failed: " . $stmt->error);
        }

        // funciona aunque la PK se llame id_usuario
        $id = $mysqli->insert_id;
        $stmt->close();
        return $id;
    }

    /** EDITAR (parcial: sólo campos enviados) */
    public static function editarUsuario(int $id, array $data): bool
    {
        $mysqli = db();

        $sets = [];
        $tipos = '';
        $params = [];

        if (isset($data['nombre'])) {
            $sets[] = "nombre = ?";
            $tipos .= 's';
            $params[] = $data['nombre'];
        }
        if (isset($data['email'])) {
            $sets[] = "email = ?";
            $tipos .= 's';
            $params[] = $data['email'];
        }
        if (isset($data['password'])) {
            $sets[] = "password = ?";
            $tipos .= 's';
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        if (isset($data['id_area'])) {
            $sets[] = "id_area = ?";
            $tipos .= 'i';
            $params[] = (int)$data['id_area'];
        }
        if (isset($data['rol'])) {
            $sets[] = "rol = ?";
            $tipos .= 's';
            $params[] = $data['rol'];
        }

        if (empty($sets)) {
            return false; // nada que actualizar
        }

        $sql = "UPDATE usuarios SET " . implode(', ', $sets) . " WHERE id_usuario = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException("Prepare failed: " . $mysqli->error);
        }

        // Agregar id al final
        $tipos .= 'i';
        $params[] = $id;

        $stmt->bind_param($tipos, ...$params);
        $ok = $stmt->execute();
        if (!$ok) {
            throw new RuntimeException("Execute failed: " . $stmt->error);
        }
        $filas = $stmt->affected_rows;
        $stmt->close();

        return $ok && $filas >= 0;
    }

    /** ELIMINAR */
    public static function eliminarUsuario(int $id): bool
    {
        $mysqli = db();
        $sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException("Prepare failed: " . $mysqli->error);
        }
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        if (!$ok) {
            throw new RuntimeException("Execute failed: " . $stmt->error);
        }
        $filas = $stmt->affected_rows;
        $stmt->close();
        return $ok && $filas > 0;
    }

    /** BUSCAR por término (nombre o email) */
   public static function buscarUsuario(string $term, int $limit = 50, int $offset = 0): array
    {
        $mysqli = db();

        // Usamos LIKE con comodines a ambos lados
        $sql = "SELECT id_usuario AS id, nombre, email, id_area, rol
                FROM usuarios
                WHERE nombre COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', ?, '%')
                OR email  COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', ?, '%')
                ORDER BY nombre ASC
                LIMIT ? OFFSET ?";

        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException('Prepare failed: ' . $mysqli->error);
        }

        $stmt->bind_param("ssii", $term, $term, $limit, $offset);

        if (!$stmt->execute()) {
            throw new RuntimeException('Execute failed: ' . $stmt->error);
        }
        $res = $stmt->get_result();

        $data = [];
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }
        $stmt->close();
        return $data;
    }






    /** OBTENER TODOS */
    public static function obtenerTodosUsuarios(): array
    {
        $mysqli = db();
        $sql = "SELECT id_usuario AS id, nombre, email, id_area, rol
                FROM usuarios
                ORDER BY id_usuario DESC";
        $res = $mysqli->query($sql);
        if (!$res) {
            throw new RuntimeException("Query failed: " . $mysqli->error);
        }
        $data = $res->fetch_all(MYSQLI_ASSOC);
        $res->close();
        return $data ?: [];
    }

    /** MOSTRAR NOMBRE por ID */
    public static function mostrarNombreUsuario(int $id): ?string
    {
        $mysqli = db();
        $sql = "SELECT nombre FROM usuarios WHERE id_usuario = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException("Prepare failed: " . $mysqli->error);
        }
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            throw new RuntimeException("Execute failed: " . $stmt->error);
        }
        $stmt->bind_result($nombre);
        $tiene = $stmt->fetch();
        $stmt->close();
        return $tiene ? $nombre : null;
    }
}

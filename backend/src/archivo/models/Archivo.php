<?php
namespace App\Archivo\Models;

// Asegúrate de incluir el archivo de configuración de la base de datos
require_once __DIR__ . '/../../config/database.php';

class Archivo
{
    public static function crear(int $id_tramite, int $id_requisito, string $filename, string $mime, int $size, string $url): int {
        // La función db() ahora está disponible aquí
        $mysqli = db();  // Usamos la función db() para obtener la conexión a la base de datos
        $sql = "INSERT INTO archivos (id_tramite, id_requisito, filename, mime, size, url, creado_en)
                VALUES (?,?,?,?,?,?,NOW())";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param('iissis', $id_tramite, $id_requisito, $filename, $mime, $size, $url);
        $stmt->execute();
        return $stmt->insert_id;
    }

    public static function existeParaRequisito(int $id_archivo, int $id_requisito): bool {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT 1 FROM archivos WHERE id_archivo=? AND id_requisito=? LIMIT 1");
        $stmt->bind_param('ii', $id_archivo, $id_requisito);
        $stmt->execute();
        return (bool)$stmt->get_result()->fetch_row();
    }
}

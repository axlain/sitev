<?php
namespace App\Archivo\Services;

use App\Archivo\Models\Archivo;

class ArchivoService
{
    /** 
     * Valida MIME y tamaño, normaliza nombre y guarda en disco.
     * Devuelve [filenameNuevo, urlPublica, mime, size].
     */
    public static function almacenarFisico(array $file, string $subdir = 'requisitos'): array {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception('Error al subir: ' . $file['error']);
        }

        $tmp  = $file['tmp_name'];
        $mime = mime_content_type($tmp) ?: ($file['type'] ?? '');
        $size = (int)$file['size'];
        $orig = basename($file['name']);

        // Validación de tipo de archivo permitido
        $allowed = ['application/pdf','image/jpeg','image/png','image/webp','image/gif'];
        if (!in_array($mime, $allowed, true)) {
            throw new \Exception('Tipo no permitido');
        }

        // Validación de tamaño máximo
        if ($size > 20 * 1024 * 1024) {
            throw new \Exception('Archivo demasiado grande (máx 20MB)');
        }

        // Directorio base donde se almacenan los archivos
        $baseDir = __DIR__ . "/../../../public/uploads/{$subdir}";
        if (!is_dir($baseDir)) mkdir($baseDir, 0775, true);

        // Nombre seguro y único para el archivo
        $ext  = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
        $safe = preg_replace('/[^a-zA-Z0-9_\.-]/','_', pathinfo($orig, PATHINFO_FILENAME));
        $new  = $safe . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . ($ext ? ".{$ext}" : '');
        $dest = "{$baseDir}/{$new}";

        // Mover archivo al servidor
        if (!move_uploaded_file($tmp, $dest)) {
            throw new \Exception('No se pudo mover el archivo');
        }

        // URL pública del archivo
        $url = "/uploads/{$subdir}/{$new}";
        return [$new, $url, $mime, $size];
    }

    /**
     * Crear un archivo en la base de datos.
     * 
     * @return int El id del archivo recién creado.
     */
    public static function crearArchivo(int $id_tramite, int $id_requisito, string $filename, string $mime, int $size, string $url): int {
        return Archivo::crear($id_tramite, $id_requisito, $filename, $mime, $size, $url);
    }
}

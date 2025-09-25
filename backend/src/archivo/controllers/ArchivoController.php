<?php
namespace App\Archivo\Controllers;

use App\Archivo\Services\ArchivoService;
use App\Middleware\AuthMiddleware;

class ArchivoController
{
    // Método para manejar la subida del archivo
    public static function subir()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            // Verificar que el usuario esté autenticado
            AuthMiddleware::verificarToken();

            // Verificar que se haya enviado un archivo
            if (!isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'No file uploaded']);
                return;
            }

            // Obtener datos del formulario
            $id_tramite   = (int)($_POST['id_tramite'] ?? 0);
            $id_requisito = (int)($_POST['id_requisito'] ?? 0);

            // Validar que los campos sean correctos
            if ($id_tramite <= 0 || $id_requisito <= 0) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'Missing id_tramite or id_requisito']);
                return;
            }

            // Llamar al servicio de archivo para almacenar el archivo físicamente y en la base de datos
            [$storedName, $url, $mime, $size] = ArchivoService::almacenarFisico($_FILES['file'], 'requisitos');

            // Guardar la información del archivo en la base de datos
            $id_archivo = ArchivoService::crearArchivo($id_tramite, $id_requisito, $_FILES['file']['name'], $mime, $size, $url);

            // Retornar respuesta exitosa
            http_response_code(201);
            echo json_encode([
                'ok' => true,
                'id_archivo' => $id_archivo,
                'filename' => $_FILES['file']['name'],
                'url' => $url
            ]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }
}

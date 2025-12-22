-- =========================================================
-- DIAGNÓSTICO DE PROBLEMA: VENTAS NO APARECEN EN CAJA
-- Ejecuta este SQL en Supabase SQL Editor para diagnosticar
-- =========================================================

-- 1. Ver las ventas de hoy (con todos los detalles)
SELECT 
    v.id_venta,
    v.fecha_hora,
    DATE(v.fecha_hora) as fecha_date,
    v.id_usuario,
    v.id_cierre,
    v.estado,
    v.total,
    u.username
FROM ventas v
LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
WHERE DATE(v.fecha_hora) = CURRENT_DATE
ORDER BY v.fecha_hora DESC;

-- 2. Ver ventas SIN cierre (las que deberían aparecer)
SELECT 
    v.id_venta,
    v.fecha_hora,
    v.id_usuario,
    v.id_cierre,
    v.estado
FROM ventas v
WHERE DATE(v.fecha_hora) = CURRENT_DATE
  AND v.id_cierre IS NULL
  AND v.estado = 'ACTIVO';

-- 3. Ver cierres de caja recientes
SELECT * FROM cierre_caja ORDER BY fecha DESC, hora_cierre DESC LIMIT 10;

-- 4. Ver usuarios y sus IDs (para comparar con localStorage)
SELECT id_usuario, username, id_empleado FROM usuarios WHERE estado = 'ACTIVO';

-- 5. Verificar timezone del servidor
SELECT 
    CURRENT_TIMESTAMP as timestamp_server,
    CURRENT_DATE as date_server,
    NOW() AT TIME ZONE 'America/La_Paz' as timestamp_bolivia;

-- =========================================================
-- SOLUCIÓN SI EL PROBLEMA ES DE TIMEZONE:
-- Si las ventas se están guardando con fecha UTC diferente
-- a la fecha local de Bolivia, ejecutar esto:
-- =========================================================

-- SET timezone = 'America/La_Paz';
-- ALTER DATABASE postgres SET timezone TO 'America/La_Paz';

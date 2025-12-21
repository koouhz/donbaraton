-- ============================================================================
-- FUNCIÓN: fn_verificar_producto_vencido
-- PROPÓSITO: Verificar si un producto tiene lotes vencidos o próximos a vencer
-- ============================================================================

DROP FUNCTION IF EXISTS public.fn_verificar_producto_vencido(VARCHAR);

CREATE OR REPLACE FUNCTION public.fn_verificar_producto_vencido(
    p_id_producto VARCHAR
)
RETURNS TABLE(
    tiene_vencidos BOOLEAN,
    tiene_proximos BOOLEAN,
    lotes_vencidos INTEGER,
    lotes_proximos INTEGER,
    fecha_mas_proxima DATE,
    dias_hasta_vencimiento INTEGER
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        -- Tiene productos ya vencidos
        COUNT(*) FILTER (WHERE mi.fecha_vencimiento < CURRENT_DATE) > 0 AS tiene_vencidos,
        -- Tiene productos próximos a vencer (7 días)
        COUNT(*) FILTER (WHERE mi.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) > 0 AS tiene_proximos,
        -- Cantidad de lotes vencidos
        COUNT(*) FILTER (WHERE mi.fecha_vencimiento < CURRENT_DATE)::INTEGER AS lotes_vencidos,
        -- Cantidad de lotes próximos
        COUNT(*) FILTER (WHERE mi.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7)::INTEGER AS lotes_proximos,
        -- Fecha más próxima de vencimiento
        MIN(mi.fecha_vencimiento) AS fecha_mas_proxima,
        -- Días hasta el vencimiento más próximo
        (MIN(mi.fecha_vencimiento) - CURRENT_DATE)::INTEGER AS dias_hasta_vencimiento
    FROM public.movimientos_inventario mi
    WHERE mi.id_producto = p_id_producto
      AND mi.fecha_vencimiento IS NOT NULL
      AND mi.fecha_vencimiento >= CURRENT_DATE - INTERVAL '30 days'; -- Solo últimos 30 días
END;
$function$;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION public.fn_verificar_producto_vencido(VARCHAR) IS 
'Verifica el estado de vencimiento de un producto.
Usado en el módulo de Ventas para mostrar alertas visuales.

Parámetros:
  - p_id_producto: ID del producto a verificar

Retorna:
  - tiene_vencidos: TRUE si tiene lotes ya vencidos
  - tiene_proximos: TRUE si tiene lotes que vencen en 7 días
  - lotes_vencidos: Cantidad de lotes vencidos
  - lotes_proximos: Cantidad de lotes próximos a vencer
  - fecha_mas_proxima: Fecha del vencimiento más cercano
  - dias_hasta_vencimiento: Días hasta el vencimiento más próximo (negativo si ya venció)';

-- ============================================================================
-- EJEMPLOS DE USO:
-- ============================================================================

/*
-- Verificar un producto específico
SELECT * FROM fn_verificar_producto_vencido('PROD-001');

-- Resultado típico:
tiene_vencidos | tiene_proximos | lotes_vencidos | lotes_proximos | fecha_mas_proxima | dias_hasta_vencimiento
---------------+----------------+----------------+----------------+-------------------+-----------------------
     false     |      true      |       0        |       2        |   2025-01-05     |          15

-- Verificar múltiples productos
SELECT 
    p.nombre,
    v.*
FROM productos p
CROSS JOIN LATERAL fn_verificar_producto_vencido(p.id_producto) v
WHERE p.estado = 'ACTIVO'
  AND (v.tiene_vencidos OR v.tiene_proximos);
*/

-- ============================================================================
-- PRUEBA DE LA FUNCIÓN:
-- ============================================================================

-- Ejecutar para verificar que funciona
SELECT 
    'PROD-001' as producto,
    *
FROM fn_verificar_producto_vencido('PROD-001');

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- - Retorna FALSE/0 si el producto no tiene fechas de vencimiento registradas
-- - Solo considera movimientos de los últimos 30 días
-- - Útil para mostrar warnings en tiempo real en el módulo de Ventas
-- - NO bloquea la venta, solo informa
-- ============================================================================

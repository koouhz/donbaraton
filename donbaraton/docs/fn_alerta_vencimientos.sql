-- ============================================================================
-- FUNCIÓN: fn_alerta_vencimientos
-- PROPÓSITO: Obtener lista de productos próximos a vencer con semáforo de alertas
-- ============================================================================

-- Eliminar función existente si tiene firma diferente
DROP FUNCTION IF EXISTS public.fn_alerta_vencimientos(INTEGER);

CREATE OR REPLACE FUNCTION public.fn_alerta_vencimientos(
    p_dias_anticipacion INTEGER DEFAULT 30
)
RETURNS TABLE(
    producto VARCHAR,
    lote VARCHAR,
    fecha_vencimiento DATE,
    dias_restantes INTEGER,
    estado_alerta VARCHAR
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.nombre, mi.lote, mi.fecha_vencimiento)
        p.nombre AS producto,
        COALESCE(mi.lote, 'Sin lote') AS lote,
        mi.fecha_vencimiento,
        (mi.fecha_vencimiento - CURRENT_DATE)::INTEGER AS dias_restantes,
        (CASE 
            WHEN (mi.fecha_vencimiento - CURRENT_DATE) <= 7 THEN 'ROJO'
            WHEN (mi.fecha_vencimiento - CURRENT_DATE) <= 15 THEN 'AMARILLO'
            ELSE 'VERDE'
        END)::VARCHAR AS estado_alerta
    FROM public.movimientos_inventario mi
    INNER JOIN public.productos p ON p.id_producto = mi.id_producto
    WHERE mi.fecha_vencimiento IS NOT NULL
      AND p.estado = 'ACTIVO'
      AND mi.fecha_vencimiento BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_dias_anticipacion)
    ORDER BY p.nombre, mi.lote, mi.fecha_vencimiento, dias_restantes ASC;
END;
$function$;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION public.fn_alerta_vencimientos(INTEGER) IS 
'Retorna lista de productos próximos a vencer con clasificación por semáforo.
Usado en AlertasStock para mostrar productos que requieren atención.

Parámetros:
  - p_dias_anticipacion: Días hacia adelante para buscar vencimientos (default: 30)

Retorna tabla con:
  - producto: Nombre del producto
  - lote: Número de lote
  - fecha_vencimiento: Fecha en que vence
  - dias_restantes: Días hasta el vencimiento
  - estado_alerta: ROJO (<=7 días), AMARILLO (8-15 días), VERDE (16-30 días)

Clasificación del semáforo:
  🔴 ROJO: Vence en 7 días o menos - URGENTE
  🟡 AMARILLO: Vence en 8-15 días - ATENCIÓN
  🟢 VERDE: Vence en 16-30 días - MONITOREAR';

-- ============================================================================
-- EJEMPLOS DE USO:
-- ============================================================================

/*
-- Ver todos los productos que vencen en los próximos 30 días
SELECT * FROM fn_alerta_vencimientos(30);

-- Ver solo productos en estado ROJO (próximos 7 días)
SELECT * FROM fn_alerta_vencimientos(7);

-- Ver productos ordenados por días restantes
SELECT * FROM fn_alerta_vencimientos(30)
ORDER BY dias_restantes ASC;

-- Contar alertas por color
SELECT estado_alerta, COUNT(*) as cantidad
FROM fn_alerta_vencimientos(30)
GROUP BY estado_alerta
ORDER BY 
  CASE estado_alerta
    WHEN 'ROJO' THEN 1
    WHEN 'AMARILLO' THEN 2
    WHEN 'VERDE' THEN 3
  END;
*/

-- ============================================================================
-- PRUEBA DE LA FUNCIÓN:
-- ============================================================================

-- Ejecutar para verificar que funciona
SELECT 
    producto,
    lote,
    fecha_vencimiento,
    dias_restantes,
    estado_alerta
FROM fn_alerta_vencimientos(30)
ORDER BY dias_restantes ASC
LIMIT 10;

-- ============================================================================
-- VISTA AUXILIAR: Resumen de alertas por estado
-- ============================================================================

CREATE OR REPLACE VIEW public.v_resumen_alertas_vencimiento AS
SELECT 
    estado_alerta,
    COUNT(*) as cantidad_productos,
    MIN(dias_restantes) as min_dias,
    MAX(dias_restantes) as max_dias,
    STRING_AGG(DISTINCT producto, ', ') as productos
FROM fn_alerta_vencimientos(30)
GROUP BY estado_alerta
ORDER BY 
  CASE estado_alerta
    WHEN 'ROJO' THEN 1
    WHEN 'AMARILLO' THEN 2
    WHEN 'VERDE' THEN 3
  END;

COMMENT ON VIEW public.v_resumen_alertas_vencimiento IS 
'Vista resumen que agrupa las alertas de vencimiento por color de semáforo.
Útil para obtener estadísticas rápidas del estado general de vencimientos.';

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- - Usa DISTINCT ON para evitar duplicados por producto/lote/fecha
-- - Solo muestra productos ACTIVOS
-- - Ordena por días restantes (más urgentes primero)
-- - El semáforo ayuda a priorizar acciones
-- - Usa el índice idx_movimientos_fecha_vencimiento para mejor performance
-- ============================================================================

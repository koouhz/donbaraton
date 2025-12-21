-- ============================================================================
-- FIX: Productos eliminados siguen apareciendo en la lista
-- ============================================================================
-- PROBLEMA:
-- La función fn_eliminar_producto SÍ hace el borrado lógico correctamente
-- (cambia estado = 'INACTIVO'), pero fn_leer_productos NO filtra por estado,
-- por lo que los productos inactivos siguen apareciendo.
-- ============================================================================

-- FUNCIÓN CORREGIDA: fn_leer_productos
-- AGREGADO: Filtro WHERE p.estado = 'ACTIVO'
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_leer_productos(
    p_buscar character varying DEFAULT NULL,
    p_categoria_id character varying DEFAULT NULL
)
RETURNS TABLE(
    id character varying,
    codigo_interno character varying,
    codigo_barras character varying,
    nombre character varying,
    precio_venta numeric,
    stock_actual integer,
    stock_minimo integer,
    categoria character varying,
    marca character varying,
    estado_stock text,
    estado character varying,
    foto_url text
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_producto AS id,
        p.codigo_interno,
        p.codigo_barras,
        p.nombre,
        p.precio_venta,
        p.stock_actual,
        p.stock_minimo,
        c.nombre AS categoria,
        p.marca,
        CASE 
            WHEN p.stock_actual <= 0 THEN 'CRITICO'
            WHEN p.stock_actual <= p.stock_minimo THEN 'BAJO'
            WHEN p.stock_actual > (p.stock_minimo * 3) THEN 'SOBRESTOCK'
            ELSE 'NORMAL'
        END AS estado_stock,
        p.estado,
        p.foto_url
    FROM public.productos p
    LEFT JOIN public.categorias c ON p.id_categoria = c.id_categoria
    WHERE p.estado = 'ACTIVO'  -- ✅ LÍNEA AGREGADA: Solo productos activos
      AND (p_categoria_id IS NULL OR p.id_categoria = p_categoria_id)
      AND (p_buscar IS NULL OR p.nombre ILIKE '%' || p_buscar || '%' OR p.codigo_interno ILIKE '%' || p_buscar || '%');
END;
$function$;

-- ============================================================================
-- INSTRUCCIONES PARA APLICAR EL FIX
-- ============================================================================
-- 1. Abre Supabase SQL Editor
-- 2. Copia la función CREATE OR REPLACE de arriba (líneas 10-58)
-- 3. Ejecuta el script
-- 4. Verifica que no haya errores
-- 5. Recarga la página de Productos en el frontend
-- 6. Los productos eliminados YA NO deberían aparecer
-- ============================================================================

-- ============================================================================
-- VERIFICACIÓN ANTES DEL FIX:
-- ============================================================================
-- Ejecuta esto ANTES de aplicar el fix para ver productos inactivos:
/*
SELECT id_producto, nombre, estado 
FROM productos 
WHERE estado = 'INACTIVO';
*/

-- ============================================================================
-- VERIFICACIÓN DESPUÉS DEL FIX:
-- ============================================================================
-- Ejecuta esto DESPUÉS de aplicar el fix:
/*
-- 1. Verifica que fn_leer_productos solo retorna activos
SELECT * FROM fn_leer_productos(NULL, NULL);

-- 2. Verifica que existan productos inactivos en la BD
SELECT id_producto, nombre, estado, motivo_desactivacion
FROM productos 
WHERE estado = 'INACTIVO';

-- 3. Si hay productos inactivos pero no aparecen en fn_leer_productos, ¡el fix funciona!
*/

-- ============================================================================
-- CAMBIO REALIZADO:
-- ============================================================================
-- ANTES (línea 3262-3263):
-- WHERE (p_categoria_id IS NULL OR p.id_categoria = p_categoria_id)
--   AND (p_buscar IS NULL OR ...)

-- DESPUÉS (línea 57-59):
-- WHERE p.estado = 'ACTIVO'  -- ← NUEVA LÍNEA
--   AND (p_categoria_id IS NULL OR p.id_categoria = p_categoria_id)
--   AND (p_buscar IS NULL OR ...)
-- ============================================================================

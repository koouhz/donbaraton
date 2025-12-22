-- ============================================
-- FIX: Agregar búsqueda por código de barras
-- ============================================
-- Este script corrige la función fn_leer_productos para que
-- también busque por código de barras además de nombre y código interno.
--
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- Función CORREGIDA: fn_leer_productos con búsqueda por código de barras
CREATE OR REPLACE FUNCTION public.fn_leer_productos(
    p_buscar character varying DEFAULT NULL::character varying, 
    p_categoria_id character varying DEFAULT NULL::character varying
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
    WHERE p.estado = 'ACTIVO'  -- Solo productos activos
      AND (p_categoria_id IS NULL OR p.id_categoria = p_categoria_id)
      AND (p_buscar IS NULL 
           OR p.nombre ILIKE '%' || p_buscar || '%' 
           OR p.codigo_interno ILIKE '%' || p_buscar || '%'
           OR p.codigo_barras ILIKE '%' || p_buscar || '%');  -- AGREGADO: búsqueda por código de barras
END;
$function$;

-- ============================================
-- Verificar que la función se actualizó correctamente
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_leer_productos') THEN
        RAISE NOTICE '✅ Función fn_leer_productos actualizada correctamente';
        RAISE NOTICE '   Ahora busca por: nombre, código interno y código de barras';
    ELSE
        RAISE NOTICE '❌ ERROR: La función fn_leer_productos no existe';
    END IF;
END $$;

-- ============================================
-- PRUEBA: Buscar producto por código de barras
-- (Descomenta la siguiente línea para probar)
-- ============================================
-- SELECT * FROM fn_leer_productos('7891234567890', NULL);

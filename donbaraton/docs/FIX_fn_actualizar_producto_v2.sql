-- ============================================================================
-- SOLUCIÓN AL ERROR: insert or update on table "productos" violates 
-- foreign key constraint "productos_id_categoria_fkey"
-- ============================================================================
-- PROBLEMA IDENTIFICADO:
-- La función fn_actualizar_producto_v2 actual NO valida que p_categoria_id
-- exista antes de intentar actualizar. Cuando se pasa un ID inválido o NULL,
-- se viola la foreign key constraint.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_actualizar_producto_v2(
    p_id character varying,
    p_codigo_barras character varying DEFAULT NULL,
    p_nombre character varying DEFAULT NULL,
    p_categoria_id character varying DEFAULT NULL,
    p_id_marca character varying DEFAULT NULL,
    p_id_unidad character varying DEFAULT NULL,
    p_precio_costo numeric DEFAULT NULL,
    p_precio_venta numeric DEFAULT NULL,
    p_stock_minimo integer DEFAULT NULL,
    p_stock_maximo integer DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'admin'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
    v_nombre_marca VARCHAR;
    v_abrev_unidad VARCHAR;
BEGIN
    -- ========================================
    -- VALIDACIÓN 1: El producto debe existir
    -- ========================================
    IF NOT EXISTS (SELECT 1 FROM public.productos WHERE id_producto = p_id) THEN
        RAISE EXCEPTION 'El producto con ID % no existe', p_id;
    END IF;

    -- ===========================================================
    -- VALIDACIÓN 2: Si se intenta cambiar categoría, debe existir
    -- ===========================================================
    IF p_categoria_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.categorias WHERE id_categoria = p_categoria_id) THEN
            RAISE EXCEPTION 'La categoría con ID % no existe', p_categoria_id;
        END IF;
    END IF;

    -- ===========================================================
    -- VALIDACIÓN 3: Si se intenta cambiar marca, debe existir
    -- ===========================================================
    IF p_id_marca IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.marcas WHERE id_marca = p_id_marca AND estado = 'ACTIVO') THEN
            RAISE EXCEPTION 'La marca con ID % no existe o está inactiva', p_id_marca;
        END IF;
        
        -- Obtener nombre de marca para el campo legacy
        SELECT nombre INTO v_nombre_marca FROM public.marcas WHERE id_marca = p_id_marca;
    END IF;
    
    -- ===========================================================
    -- VALIDACIÓN 4: Si se intenta cambiar unidad, debe existir
    -- ===========================================================
    IF p_id_unidad IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.unidades_medida WHERE id_unidad = p_id_unidad AND estado = 'ACTIVO') THEN
            RAISE EXCEPTION 'La unidad con ID % no existe o está inactiva', p_id_unidad;
        END IF;
        
        -- Obtener abreviatura de unidad para el campo legacy
        SELECT abreviatura INTO v_abrev_unidad FROM public.unidades_medida WHERE id_unidad = p_id_unidad;
    END IF;

    -- Registrar auditoría ANTES de actualizar
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 'PRODUCTOS', 'ACTUALIZAR',
        'Producto ID: ' || p_id || ' - ' || COALESCE(p_nombre, 'sin cambio de nombre')
    );

    -- Actualizar el producto
    UPDATE public.productos
    SET 
        codigo_barras = COALESCE(p_codigo_barras, codigo_barras),
        nombre = COALESCE(p_nombre, nombre),
        id_categoria = COALESCE(p_categoria_id, id_categoria),
        id_marca = COALESCE(p_id_marca, id_marca),
        marca = CASE 
            WHEN p_id_marca IS NOT NULL THEN v_nombre_marca 
            ELSE marca 
        END,
        id_unidad = COALESCE(p_id_unidad, id_unidad),
        unidad_medida = CASE 
            WHEN p_id_unidad IS NOT NULL THEN v_abrev_unidad 
            ELSE unidad_medida 
        END,
        precio_costo = COALESCE(p_precio_costo, precio_costo),
        precio_venta = COALESCE(p_precio_venta, precio_venta),
        stock_minimo = COALESCE(p_stock_minimo, stock_minimo),
        stock_maximo = COALESCE(p_stock_maximo, stock_maximo)
    WHERE id_producto = p_id;

    RETURN FOUND;
END;
$function$;

-- ============================================================================
-- INSTRUCCIONES PARA APLICAR EL FIX
-- ============================================================================
-- 1. Ve a Supabase SQL Editor
-- 2. Copia y pega SOLO la función CREATE OR REPLACE FUNCTION de arriba
-- 3. Ejecuta el script
-- 4. Verifica que no haya errores
-- 5. Prueba actualizar un producto desde el frontend
-- ============================================================================

-- ============================================================================
-- CAMBIOS APLICADOS VS VERSIÓN ORIGINAL:
-- ============================================================================
-- ✅ AGREGADO: Validación de existencia del producto
-- ✅ AGREGADO: Validación de existencia de categoría (SOLUCIONA EL ERROR)
-- ✅ AGREGADO: Validación de existencia y estado de marca
-- ✅ AGREGADO: Validación de existencia y estado de unidad
-- ✅ MEJORADO: Uso de CASE en lugar de COALESCE para campos legacy
-- ✅ MEJORADO: Mensajes de error más descriptivos
-- ✅ MEJORADO: Auditoría más informativa
-- ============================================================================

-- ============================================================================
-- TESTS RECOMENDADOS:
-- ============================================================================

-- Test 1: Actualizar con categoría válida (debe funcionar)
/*
SELECT fn_actualizar_producto_v2(
    p_id := 'PROD-001',
    p_nombre := 'Producto Actualizado',
    p_categoria_id := 'CAT-001',  -- Debe existir
    p_precio_venta := 25.50,
    p_usuario_auditoria := 'USR-001'
);
*/

-- Test 2: Intentar actualizar con categoría inexistente (debe fallar con mensaje claro)
/*
SELECT fn_actualizar_producto_v2(
    p_id := 'PROD-001',
    p_categoria_id := 'CAT-999',  -- No existe
    p_usuario_auditoria := 'USR-001'
);
-- Debe retornar: ERROR: La categoría con ID CAT-999 no existe
*/

-- Test 3: Intentar actualizar producto inexistente (debe fallar)
/*
SELECT fn_actualizar_producto_v2(
    p_id := 'PROD-999',  -- No existe
    p_nombre := 'Test',
    p_usuario_auditoria := 'USR-001'
);
-- Debe retornar: ERROR: El producto con ID PROD-999 no existe
*/

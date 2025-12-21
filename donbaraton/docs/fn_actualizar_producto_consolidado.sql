-- ============================================================================
-- FUNCIÓN CONSOLIDADA: fn_actualizar_producto_v2
-- ============================================================================
-- Descripción: Actualiza un producto existente con soporte completo para
--              marcas, unidades de medida y campos legacy
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_actualizar_producto_v2(
    p_id INTEGER,
    p_codigo_barras VARCHAR DEFAULT NULL,
    p_nombre VARCHAR DEFAULT NULL,
    p_categoria_id INTEGER DEFAULT NULL,
    p_id_marca INTEGER DEFAULT NULL,
    p_id_unidad INTEGER DEFAULT NULL,
    p_precio_costo DECIMAL DEFAULT NULL,
    p_precio_venta DECIMAL DEFAULT NULL,
    p_stock_minimo INTEGER DEFAULT NULL,
    p_stock_maximo INTEGER DEFAULT NULL,
    p_usuario_auditoria VARCHAR DEFAULT 'SYSTEM'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_nombre_marca VARCHAR;
    v_abrev_unidad VARCHAR;
    v_producto_existe BOOLEAN;
BEGIN
    -- Validar que el producto existe
    SELECT EXISTS(SELECT 1 FROM public.productos WHERE id_producto = p_id)
    INTO v_producto_existe;
    
    IF NOT v_producto_existe THEN
        RAISE EXCEPTION 'El producto con ID % no existe', p_id;
    END IF;

    -- Validar que la categoría existe si se está actualizando
    IF p_categoria_id IS NOT NULL THEN
        IF NOT EXISTS(SELECT 1 FROM public.categorias WHERE id_categoria = p_categoria_id) THEN
            RAISE EXCEPTION 'La categoría con ID % no existe', p_categoria_id;
        END IF;
    END IF;

    -- Obtener nombre de marca para el campo legacy (si aplica)
    IF p_id_marca IS NOT NULL THEN
        SELECT nombre INTO v_nombre_marca 
        FROM public.marcas 
        WHERE id_marca = p_id_marca AND estado = true;
        
        IF v_nombre_marca IS NULL THEN
            RAISE EXCEPTION 'La marca con ID % no existe o está inactiva', p_id_marca;
        END IF;
    END IF;
    
    -- Obtener abreviatura de unidad para el campo legacy (si aplica)
    IF p_id_unidad IS NOT NULL THEN
        SELECT abreviatura INTO v_abrev_unidad 
        FROM public.unidades_medida 
        WHERE id_unidad = p_id_unidad AND estado = true;
        
        IF v_abrev_unidad IS NULL THEN
            RAISE EXCEPTION 'La unidad con ID % no existe o está inactiva', p_id_unidad;
        END IF;
    END IF;

    -- Registrar auditoría ANTES de la actualización
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'ACTUALIZAR',
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
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
-- Esta función consolida las dos versiones anteriores:
-- 1. fn_actualizar_producto - versión simple sin marcas/unidades
-- 2. fn_actualizar_producto_v2 - versión completa
--
-- Mejoras aplicadas:
-- ✅ Validación de existencia del producto
-- ✅ Validación de existencia de categoría
-- ✅ Validación de existencia y estado de marca
-- ✅ Validación de existencia y estado de unidad
-- ✅ Manejo correcto de campos legacy (marca, unidad_medida)
-- ✅ Auditoría completa
-- ✅ Manejo de errores con mensajes descriptivos
-- ============================================================================

-- Ejemplo de uso:
-- SELECT fn_actualizar_producto_v2(
--     p_id := 123,
--     p_nombre := 'Nuevo nombre',
--     p_categoria_id := 5,
--     p_id_marca := 10,
--     p_id_unidad := 3,
--     p_precio_venta := 25.50,
--     p_usuario_auditoria := 'USR-001'
-- );

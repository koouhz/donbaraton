-- =====================================================
-- fn_devolucion_venta_parcial
-- Función para procesar devoluciones parciales de ventas
-- Actualiza el stock automáticamente mediante movimientos de inventario
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_devolucion_venta_parcial(
    p_id_venta VARCHAR,
    p_detalles JSONB,  -- [{"id_producto": "PROD-001", "cantidad": 2}, ...]
    p_motivo VARCHAR,
    p_forma_reembolso VARCHAR,
    p_username VARCHAR
) RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_devolucion VARCHAR;
    v_id_usuario VARCHAR;
    v_detalle JSONB;
    v_id_producto VARCHAR;
    v_cantidad INTEGER;
    v_total_devolucion NUMERIC := 0;
    v_precio_unitario NUMERIC;
    v_venta_data JSONB;
    v_es_devolucion_total BOOLEAN := TRUE;
    v_total_productos_venta INTEGER;
    v_total_productos_devueltos INTEGER;
BEGIN
    -- Obtener ID del usuario
    SELECT id_usuario INTO v_id_usuario FROM usuarios WHERE username = p_username;
    
    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_username;
    END IF;
    
    -- Verificar que la venta existe y está activa
    SELECT to_jsonb(v) INTO v_venta_data FROM ventas v WHERE id_venta = p_id_venta;
    
    IF v_venta_data IS NULL THEN
        RAISE EXCEPTION 'Venta no encontrada: %', p_id_venta;
    END IF;
    
    IF (v_venta_data->>'estado') = 'ANULADO' THEN
        RAISE EXCEPTION 'La venta ya está anulada: %', p_id_venta;
    END IF;
    
    -- Generar ID de devolución
    v_id_devolucion := 'DEV-V-' || LPAD(nextval('devoluciones_venta_seq')::VARCHAR, 3, '0');
    
    -- Contar productos totales de la venta original
    SELECT COUNT(*) INTO v_total_productos_venta 
    FROM detalle_ventas WHERE id_venta = p_id_venta;
    
    -- Contar productos a devolver
    v_total_productos_devueltos := jsonb_array_length(p_detalles);
    
    -- Verificar si es devolución total comparando cantidades
    FOR v_detalle IN SELECT * FROM jsonb_array_elements(p_detalles)
    LOOP
        v_id_producto := v_detalle->>'id_producto';
        v_cantidad := (v_detalle->>'cantidad')::INTEGER;
        
        -- Verificar si la cantidad devuelta es menor a la original
        IF EXISTS (
            SELECT 1 FROM detalle_ventas 
            WHERE id_venta = p_id_venta 
            AND id_producto = v_id_producto 
            AND cantidad > v_cantidad
        ) THEN
            v_es_devolucion_total := FALSE;
        END IF;
    END LOOP;
    
    -- Si no se devuelven todos los productos, es devolución parcial
    IF v_total_productos_devueltos < v_total_productos_venta THEN
        v_es_devolucion_total := FALSE;
    END IF;
    
    -- Insertar registro de devolución
    INSERT INTO public.devoluciones_ventas (
        id_devolucion_venta, id_venta, motivo, forma_reembolso, fecha, id_usuario
    ) VALUES (
        v_id_devolucion, p_id_venta, p_motivo, p_forma_reembolso, CURRENT_TIMESTAMP, v_id_usuario
    );
    
    -- Procesar cada producto a devolver
    FOR v_detalle IN SELECT * FROM jsonb_array_elements(p_detalles)
    LOOP
        v_id_producto := v_detalle->>'id_producto';
        v_cantidad := (v_detalle->>'cantidad')::INTEGER;
        
        -- Obtener precio unitario para calcular total
        SELECT precio_unitario INTO v_precio_unitario
        FROM detalle_ventas 
        WHERE id_venta = p_id_venta AND id_producto = v_id_producto;
        
        -- Calcular total de devolución
        v_total_devolucion := v_total_devolucion + (v_cantidad * COALESCE(v_precio_unitario, 0));
        
        -- IMPORTANTE: Crear movimiento de inventario según el motivo de devolución
        -- El trigger trg_actualizar_stock maneja automáticamente:
        -- - ENTRADA: suma al stock (para Error de compra)
        -- - DAÑO: resta del stock (para productos dañados - no vuelve al inventario vendible)
        -- - MERMA: resta del stock (para productos vencidos - no vuelve al inventario vendible)
        
        -- Determinar tipo de movimiento según motivo
        IF UPPER(p_motivo) LIKE '%ERROR%' THEN
            -- Error de compra: el producto vuelve al stock vendible
            INSERT INTO public.movimientos_inventario (
                id_movimiento, id_producto, tipo, cantidad, documento, motivo, id_usuario, fecha_hora
            ) VALUES (
                'MOV-' || LPAD(nextval('movimientos_seq')::VARCHAR, 3, '0'),
                v_id_producto, 'ENTRADA', v_cantidad, v_id_devolucion, 
                'DEVOLUCION_VENTA', v_id_usuario, CURRENT_TIMESTAMP
            );
        ELSIF UPPER(p_motivo) LIKE '%DAÑA%' OR UPPER(p_motivo) LIKE '%DAÑO%' THEN
            -- Producto dañado: NO vuelve al stock vendible
            -- NO crear movimiento - el stock ya se restó en la venta original
            NULL; -- Solo se registrará en stock_no_vendible (ver stock_no_vendible_setup.sql)
        ELSIF UPPER(p_motivo) LIKE '%VENCIDO%' THEN
            -- Producto vencido: NO vuelve al stock vendible
            -- NO crear movimiento - el stock ya se restó en la venta original
            NULL; -- Solo se registrará en stock_no_vendible (ver stock_no_vendible_setup.sql)
        ELSE
            -- Otros motivos: por defecto vuelve al stock (comportamiento original)
            INSERT INTO public.movimientos_inventario (
                id_movimiento, id_producto, tipo, cantidad, documento, motivo, id_usuario, fecha_hora
            ) VALUES (
                'MOV-' || LPAD(nextval('movimientos_seq')::VARCHAR, 3, '0'),
                v_id_producto, 'ENTRADA', v_cantidad, v_id_devolucion, 
                'DEVOLUCION_VENTA', v_id_usuario, CURRENT_TIMESTAMP
            );
        END IF;
        
        -- NO HACER UPDATE MANUAL - El trigger ya lo hace automáticamente
        
    END LOOP;
    
    -- Si es devolución total, marcar la venta como ANULADO
    IF v_es_devolucion_total THEN
        UPDATE public.ventas SET estado = 'ANULADO' WHERE id_venta = p_id_venta;
    END IF;
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria_completa(
        p_username, 
        'VENTAS', 
        CASE WHEN v_es_devolucion_total THEN 'DEVOLUCION_TOTAL' ELSE 'DEVOLUCION_PARCIAL' END,
        'ventas', 
        p_id_venta, 
        v_venta_data, 
        jsonb_build_object(
            'id_devolucion', v_id_devolucion,
            'productos_devueltos', v_total_productos_devueltos,
            'total_devolucion', v_total_devolucion,
            'es_total', v_es_devolucion_total
        ),
        'Devolución ' || CASE WHEN v_es_devolucion_total THEN 'Total' ELSE 'Parcial' END || 
        ' de venta ' || p_id_venta || ' | Motivo: ' || p_motivo ||
        ' | Monto: ' || v_total_devolucion
    );
    
    RETURN v_id_devolucion;
END;
$$;

-- =====================================================
-- COMENTARIO: Esta función hace lo siguiente:
-- 1. Valida que la venta existe y no está anulada
-- 2. Crea un registro en devoluciones_ventas
-- 3. Para cada producto en p_detalles:
--    - Crea un movimiento de inventario tipo 'ENTRADA'
--    - Actualiza directamente stock_actual en productos
-- 4. Si es devolución total, marca la venta como 'ANULADO'
-- 5. Registra auditoría
-- =====================================================

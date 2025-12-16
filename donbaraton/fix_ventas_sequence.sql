-- ============================================================
-- SCRIPT PARA CORREGIR ERROR "duplicate key value violates unique constraint 'ventas_pkey'"
-- ============================================================
-- 
-- PROBLEMA: La secuencia 'ventas_seq' no está sincronizada con los registros 
-- existentes en la tabla 'ventas'. Esto causa que al generar nuevos IDs,
-- se produzcan duplicados.
--
-- EJECUTAR EN: Supabase SQL Editor (https://supabase.com/dashboard/project/[tu-proyecto]/sql)
-- ============================================================

-- 1. Ver el estado actual de la secuencia
SELECT last_value, is_called FROM ventas_seq;

-- 2. Ver el máximo ID numérico existente en la tabla ventas
SELECT 
    'Máximo ID actual' as info,
    MAX(CAST(SUBSTRING(id_venta FROM 6) AS INTEGER)) as max_id_numerico,
    COUNT(*) as total_ventas
FROM ventas
WHERE id_venta LIKE 'VENT-%';

-- 3. SINCRONIZAR la secuencia con el valor máximo + 1
-- Esto asegura que el próximo ID generado sea único
DO $$
DECLARE
    v_max_id INTEGER;
    v_new_sequence_value INTEGER;
BEGIN
    -- Obtener el máximo ID numérico de ventas
    SELECT COALESCE(MAX(CAST(SUBSTRING(id_venta FROM 6) AS INTEGER)), 0)
    INTO v_max_id
    FROM ventas
    WHERE id_venta LIKE 'VENT-%';
    
    -- El nuevo valor de la secuencia debe ser max_id + 1
    v_new_sequence_value := v_max_id + 1;
    
    -- Actualizar la secuencia
    PERFORM setval('ventas_seq', v_new_sequence_value, false);
    
    RAISE NOTICE 'Secuencia ventas_seq actualizada. Próximo valor: %', v_new_sequence_value;
END $$;

-- 4. Verificar que la secuencia se actualizó correctamente
SELECT last_value, is_called FROM ventas_seq;

-- 5. Probar que el próximo ID será único
SELECT 'VENT-' || LPAD(nextval('ventas_seq')::VARCHAR, 6, '0') as proximo_id_venta;

-- ============================================================
-- NOTA: También se recomienda actualizar la función fn_registrar_venta
-- para usar 6 dígitos en lugar de 3 para evitar problemas futuros.
-- Cambiar:
--   LPAD(nextval('ventas_seq')::VARCHAR, 3, '0')
-- Por:
--   LPAD(nextval('ventas_seq')::VARCHAR, 6, '0')
-- ============================================================

-- 6. OPCIONAL: Actualizar la función para usar 6 dígitos
-- (Solo ejecutar si deseas actualizar la función)
/*
CREATE OR REPLACE FUNCTION public.fn_registrar_venta(
    p_id_cliente character varying, 
    p_tipo_comprobante character varying, 
    p_detalles jsonb, 
    p_medio_pago character varying, 
    p_monto_total numeric, 
    p_monto_recibido numeric, 
    p_username character varying, 
    p_nit_cliente character varying DEFAULT NULL::character varying, 
    p_razon_social character varying DEFAULT NULL::character varying, 
    p_direccion_factura text DEFAULT NULL::text
)
RETURNS character varying
LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_venta VARCHAR;
    v_id_usuario VARCHAR;
    v_vuelto NUMERIC;
    v_numero_factura VARCHAR DEFAULT NULL;
    rec RECORD;
    v_new_data JSONB;
BEGIN
    IF p_monto_recibido < p_monto_total THEN
        RAISE EXCEPTION 'Monto recibido insuficiente. Faltan: %', (p_monto_total - p_monto_recibido);
    END IF;
    
    IF p_tipo_comprobante = 'FACTURA' THEN
        IF p_nit_cliente IS NULL OR p_razon_social IS NULL THEN
            RAISE EXCEPTION 'Para emitir Factura, el NIT y Razón Social son obligatorios.';
        END IF;
        v_numero_factura := 'FAC-' || LPAD(nextval('facturas_seq')::VARCHAR, 6, '0') || '-' || TO_CHAR(CURRENT_DATE, 'YYYY');
    END IF;
    
    SELECT id_usuario INTO v_id_usuario FROM usuarios WHERE username = p_username;
    v_vuelto := p_monto_recibido - p_monto_total;
    
    -- CAMBIO: Usar 6 dígitos en lugar de 3
    v_id_venta := 'VENT-' || LPAD(nextval('ventas_seq')::VARCHAR, 6, '0');
    
    INSERT INTO public.ventas (
        id_venta, id_cliente, fecha_hora, total, tipo_comprobante, 
        id_usuario, estado, 
        nit_cliente, razon_social, direccion_factura, numero_factura
    ) VALUES (
        v_id_venta, p_id_cliente, CURRENT_TIMESTAMP, p_monto_total, p_tipo_comprobante, 
        v_id_usuario, 'ACTIVO',
        p_nit_cliente, p_razon_social, p_direccion_factura, v_numero_factura
    );
    
    FOR rec IN SELECT * FROM jsonb_to_recordset(p_detalles) AS x(
        id_producto VARCHAR, cantidad INTEGER, precio_unitario NUMERIC, descuento NUMERIC
    )
    LOOP
        INSERT INTO public.detalle_ventas (
            id_detalle_venta, id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal
        ) VALUES (
            'DV-' || LPAD(nextval('detalle_ventas_seq')::VARCHAR, 6, '0'),
            v_id_venta, rec.id_producto, rec.cantidad, rec.precio_unitario,
            COALESCE(rec.descuento, 0),
            (rec.cantidad * rec.precio_unitario) - COALESCE(rec.descuento, 0)
        );
        
        INSERT INTO public.movimientos_inventario (
            id_movimiento, id_producto, tipo, cantidad, documento, id_usuario, fecha_hora
        ) VALUES (
            'MOV-' || LPAD(nextval('movimientos_seq')::VARCHAR, 6, '0'),
            rec.id_producto, 'SALIDA', rec.cantidad, v_id_venta, v_id_usuario, CURRENT_TIMESTAMP
        );
    END LOOP;
    
    INSERT INTO public.pagos (id_pago, id_venta, medio, importe, vuelto)
    VALUES ('PAG-' || LPAD(nextval('pagos_seq')::VARCHAR, 6, '0'), v_id_venta, p_medio_pago, p_monto_recibido, v_vuelto);
    
    v_new_data := jsonb_build_object(
        'id_venta', v_id_venta,
        'id_cliente', p_id_cliente,
        'tipo_comprobante', p_tipo_comprobante,
        'numero_factura', v_numero_factura,
        'total', p_monto_total,
        'medio_pago', p_medio_pago,
        'detalles_count', jsonb_array_length(p_detalles)
    );
    
    PERFORM public.fn_registrar_auditoria_completa(
        p_username, 'VENTAS', 'NUEVA_VENTA',
        'ventas', v_id_venta, NULL, v_new_data,
        'Venta registrada (' || p_tipo_comprobante || '). Total: ' || p_monto_total
    );
    
    RETURN v_id_venta;
END;
$function$;
*/

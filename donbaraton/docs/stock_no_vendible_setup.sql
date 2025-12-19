-- =====================================================
-- SCRIPT COMPLETO: Devoluciones Mejoradas con Stock No Vendible
-- Ejecutar TODO este script en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PASO 1: Crear tabla para stock no vendible
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stock_no_vendible (
    id_registro VARCHAR PRIMARY KEY,
    id_producto VARCHAR NOT NULL REFERENCES productos(id_producto),
    id_devolucion VARCHAR,  -- Referencia a la devolución origen
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    motivo VARCHAR(50) NOT NULL CHECK (motivo IN ('DAÑADO', 'VENCIDO')),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'DESCARTADO', 'RECUPERADO')),
    id_usuario VARCHAR REFERENCES usuarios(id_usuario)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_stock_no_vendible_producto ON stock_no_vendible(id_producto);
CREATE INDEX IF NOT EXISTS idx_stock_no_vendible_estado ON stock_no_vendible(estado);
CREATE INDEX IF NOT EXISTS idx_stock_no_vendible_motivo ON stock_no_vendible(motivo);

-- Secuencia para IDs
CREATE SEQUENCE IF NOT EXISTS stock_no_vendible_seq START 1;

-- =====================================================
-- PASO 2: Función para leer stock no vendible
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_leer_stock_no_vendible(
    p_estado VARCHAR DEFAULT NULL,
    p_motivo VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id VARCHAR,
    producto VARCHAR,
    codigo_interno VARCHAR,
    cantidad INTEGER,
    motivo VARCHAR,
    observaciones TEXT,
    fecha TIMESTAMP,
    estado VARCHAR,
    devolucion_origen VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        snv.id_registro AS id,
        p.nombre AS producto,
        p.codigo_interno,
        snv.cantidad,
        snv.motivo::VARCHAR,
        snv.observaciones,
        snv.fecha_registro AS fecha,
        snv.estado::VARCHAR,
        snv.id_devolucion AS devolucion_origen
    FROM public.stock_no_vendible snv
    JOIN public.productos p ON snv.id_producto = p.id_producto
    WHERE (p_estado IS NULL OR snv.estado = p_estado)
      AND (p_motivo IS NULL OR snv.motivo = p_motivo)
    ORDER BY snv.fecha_registro DESC;
END;
$$;

-- =====================================================
-- PASO 3: Función actualizada de devolución parcial
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
    v_id_stock_no_vendible VARCHAR;
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
        
        -- =====================================================
        -- LÓGICA CONDICIONAL SEGÚN MOTIVO DE DEVOLUCIÓN
        -- =====================================================
        
        IF UPPER(p_motivo) LIKE '%ERROR%' THEN
            -- ERROR DE COMPRA: El producto vuelve al stock vendible
            INSERT INTO public.movimientos_inventario (
                id_movimiento, id_producto, tipo, cantidad, documento, motivo, id_usuario, fecha_hora
            ) VALUES (
                'MOV-' || LPAD(nextval('movimientos_seq')::VARCHAR, 3, '0'),
                v_id_producto, 'ENTRADA', v_cantidad, v_id_devolucion, 
                'DEVOLUCION_VENTA', v_id_usuario, CURRENT_TIMESTAMP
            );
            
        ELSIF UPPER(p_motivo) LIKE '%DAÑA%' OR UPPER(p_motivo) LIKE '%DAÑO%' THEN
            -- PRODUCTO DAÑADO: NO vuelve al stock, va a stock_no_vendible
            v_id_stock_no_vendible := 'SNV-' || LPAD(nextval('stock_no_vendible_seq')::VARCHAR, 5, '0');
            
            INSERT INTO public.stock_no_vendible (
                id_registro, id_producto, id_devolucion, cantidad, motivo, 
                observaciones, fecha_registro, estado, id_usuario
            ) VALUES (
                v_id_stock_no_vendible, v_id_producto, v_id_devolucion, v_cantidad,
                'DAÑADO', 'Devolución de venta - Producto dañado',
                CURRENT_TIMESTAMP, 'PENDIENTE', v_id_usuario
            );
            -- NO crear movimiento_inventario para productos dañados
            -- El stock ya se restó en la venta original, no debemos modificarlo
            
        ELSIF UPPER(p_motivo) LIKE '%VENCIDO%' THEN
            -- PRODUCTO VENCIDO: NO vuelve al stock, va a stock_no_vendible
            v_id_stock_no_vendible := 'SNV-' || LPAD(nextval('stock_no_vendible_seq')::VARCHAR, 5, '0');
            
            INSERT INTO public.stock_no_vendible (
                id_registro, id_producto, id_devolucion, cantidad, motivo, 
                observaciones, fecha_registro, estado, id_usuario
            ) VALUES (
                v_id_stock_no_vendible, v_id_producto, v_id_devolucion, v_cantidad,
                'VENCIDO', 'Devolución de venta - Producto vencido',
                CURRENT_TIMESTAMP, 'PENDIENTE', v_id_usuario
            );
            -- NO crear movimiento_inventario para productos vencidos
            -- El stock ya se restó en la venta original, no debemos modificarlo
            
        ELSE
            -- OTROS MOTIVOS: Por defecto vuelve al stock (comportamiento original)
            INSERT INTO public.movimientos_inventario (
                id_movimiento, id_producto, tipo, cantidad, documento, motivo, id_usuario, fecha_hora
            ) VALUES (
                'MOV-' || LPAD(nextval('movimientos_seq')::VARCHAR, 3, '0'),
                v_id_producto, 'ENTRADA', v_cantidad, v_id_devolucion, 
                'DEVOLUCION_VENTA', v_id_usuario, CURRENT_TIMESTAMP
            );
        END IF;
        
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
            'es_total', v_es_devolucion_total,
            'destino_stock', CASE 
                WHEN UPPER(p_motivo) LIKE '%ERROR%' THEN 'STOCK_VENDIBLE'
                ELSE 'STOCK_NO_VENDIBLE'
            END
        ),
        'Devolución ' || CASE WHEN v_es_devolucion_total THEN 'Total' ELSE 'Parcial' END || 
        ' de venta ' || p_id_venta || ' | Motivo: ' || p_motivo ||
        ' | Monto: ' || v_total_devolucion
    );
    
    RETURN v_id_devolucion;
END;
$$;

-- =====================================================
-- PASO 4: Función para actualizar estado del stock no vendible
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_actualizar_stock_no_vendible(
    p_id_registro VARCHAR,
    p_nuevo_estado VARCHAR,
    p_observaciones TEXT DEFAULT NULL,
    p_username VARCHAR DEFAULT 'admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_usuario VARCHAR;
BEGIN
    -- Validar estado
    IF p_nuevo_estado NOT IN ('PENDIENTE', 'DESCARTADO', 'RECUPERADO') THEN
        RAISE EXCEPTION 'Estado inválido. Use: PENDIENTE, DESCARTADO o RECUPERADO';
    END IF;
    
    -- Obtener ID usuario
    SELECT id_usuario INTO v_id_usuario FROM usuarios WHERE username = p_username;
    
    -- Actualizar registro
    UPDATE public.stock_no_vendible
    SET estado = p_nuevo_estado,
        observaciones = COALESCE(p_observaciones, observaciones)
    WHERE id_registro = p_id_registro;
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_username, 'INVENTARIO', 'ACTUALIZAR_STOCK_NO_VENDIBLE',
        'Registro: ' || p_id_registro || ' cambió a estado: ' || p_nuevo_estado
    );
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- ============================================================================
-- FUNCIÓN: fn_ajustar_inventario
-- PROPÓSITO: Registrar ajustes manuales de inventario (entradas, salidas, ajustes)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_ajustar_inventario(
    p_id_producto VARCHAR,
    p_tipo VARCHAR,  -- 'ENTRADA', 'SALIDA', 'AJUSTE+', 'AJUSTE-', 'MERMA', 'DAÑO'
    p_cantidad INTEGER,
    p_username VARCHAR,  -- Movido aquí: parámetros requeridos ANTES de los opcionales
    p_lote VARCHAR DEFAULT NULL,
    p_fecha_vencimiento DATE DEFAULT NULL,
    p_documento VARCHAR DEFAULT NULL,
    p_motivo TEXT DEFAULT NULL,
    p_observaciones TEXT DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_movimiento VARCHAR;
    v_stock_actual INTEGER;
    v_nombre_producto VARCHAR;
    v_usuario_id INTEGER;
    v_nueva_cantidad INTEGER;
BEGIN
    -- Validar que el producto existe
    SELECT stock_actual, nombre 
    INTO v_stock_actual, v_nombre_producto
    FROM public.productos
    WHERE id_producto = p_id_producto AND estado = 'ACTIVO';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado o inactivo: %', p_id_producto;
    END IF;
    
    -- Calcular nueva cantidad según el tipo de movimiento
    CASE p_tipo
        WHEN 'ENTRADA', 'AJUSTE+', 'DEVOLUCION_VENTA' THEN
            v_nueva_cantidad := v_stock_actual + p_cantidad;
        WHEN 'SALIDA', 'AJUSTE-', 'MERMA', 'DAÑO', 'DEVOLUCION_PROVEEDOR' THEN
            v_nueva_cantidad := v_stock_actual - p_cantidad;
            -- Validar stock suficiente para salidas
            IF v_nueva_cantidad < 0 THEN
                RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, Cantidad solicitada: %', v_stock_actual, p_cantidad;
            END IF;
        ELSE
            RAISE EXCEPTION 'Tipo de movimiento no válido: %', p_tipo;
    END CASE;
    
    -- Generar ID del movimiento
    v_id_movimiento := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('sq_movimiento_inventario')::TEXT, 5, '0');
    
    -- Registrar el movimiento en movimientos_inventario
    INSERT INTO public.movimientos_inventario (
        id_movimiento,
        id_producto,
        tipo,
        cantidad,
        lote,
        fecha_vencimiento,
        documento,
        motivo,
        observaciones,
        fecha_hora,
        id_usuario
    ) VALUES (
        v_id_movimiento,
        p_id_producto,
        p_tipo,
        p_cantidad,
        p_lote,
        p_fecha_vencimiento,
        p_documento,
        COALESCE(p_motivo, 'Ajuste manual - ' || p_tipo),
        p_observaciones,
        NOW(),
        (SELECT id_usuario FROM public.usuarios WHERE username = p_username LIMIT 1)
    );
    
    -- Actualizar stock del producto
    UPDATE public.productos
    SET stock_actual = v_nueva_cantidad
    WHERE id_producto = p_id_producto;
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_username,
        'INVENTARIO',
        'AJUSTE_STOCK',
        format('Ajuste %s - Producto: %s, Cantidad: %s, Lote: %s, Motivo: %s',
               p_tipo,
               v_nombre_producto,
               p_cantidad,
               COALESCE(p_lote, 'N/A'),
               COALESCE(p_motivo, 'Sin motivo'))
    );
    
    RETURN v_id_movimiento;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al ajustar inventario: %', SQLERRM;
END;
$function$;

-- ============================================================================
-- NOTAS:
-- - Esta función registra ajustes manuales de inventario
-- - Valida que el producto exista y esté activo
-- - Para salidas/decrementos, valida que haya stock suficiente
-- - Actualiza automáticamente el stock_actual del producto
-- - Registra el movimiento en movimientos_inventario
-- - Registra auditoría de la operación
-- ============================================================================

-- ============================================================================
-- EJEMPLO DE USO:
-- ============================================================================
/*
-- Registrar entrada manual
SELECT fn_ajustar_inventario(
    'PROD-001',               -- id_producto
    'ENTRADA',                -- tipo
    50,                       -- cantidad
    'LOT-123',                -- lote
    '2025-06-30',             -- fecha_vencimiento
    'REM-001',                -- documento (remito)
    'Compra local',           -- motivo
    'Ingreso de mercadería',  -- observaciones
    'admin'                   -- username
);

-- Registrar merma
SELECT fn_ajustar_inventario(
    'PROD-001',               -- id_producto
    'MERMA',                  -- tipo
    5,                        -- cantidad
    NULL,                     -- lote
    NULL,                     -- fecha_vencimiento
    NULL,                     -- documento
    'Producto vencido',       -- motivo
    'Retirado del stock vendible', -- observaciones
    'admin'                   -- username
);

-- Registrar ajuste por conteo físico (incremento)
SELECT fn_ajustar_inventario(
    'PROD-001',               -- id_producto
    'AJUSTE+',                -- tipo
    10,                       -- cantidad
    NULL,                     -- lote
    NULL,                     -- fecha_vencimiento
    'CONT-2024-001',          -- documento de conteo
    'Diferencia en conteo físico', -- motivo
    'Se encontraron 10 unidades adicionales', -- observaciones
    'admin'                   -- username
);
*/

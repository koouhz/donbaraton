-- ============================================================================
-- FUNCIÓN: fn_registrar_pago_cuenta
-- PROPÓSITO: Registrar un pago (total o parcial) a una cuenta por pagar
-- ============================================================================

-- Eliminar todas las versiones de la función
DO $$ 
BEGIN
    EXECUTE 'DROP FUNCTION IF EXISTS public.fn_registrar_pago_cuenta(VARCHAR, NUMERIC, DATE, VARCHAR, TEXT, VARCHAR) CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.fn_registrar_pago_cuenta(VARCHAR, NUMERIC, DATE, VARCHAR, TEXT, VARCHAR, TEXT) CASCADE';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.fn_registrar_pago_cuenta(
    p_id_cuenta VARCHAR,
    p_monto_pago NUMERIC,
    p_fecha_pago DATE,
    p_metodo_pago VARCHAR,  -- 'EFECTIVO', 'TRANSFERENCIA', 'CHEQUE'
    p_observaciones TEXT DEFAULT NULL,
    p_username VARCHAR DEFAULT 'admin',
    p_comprobante_url TEXT DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $function$
DECLARE
    v_saldo_actual NUMERIC;
    v_nuevo_saldo NUMERIC;
    v_id_pago VARCHAR;
    v_id_usuario VARCHAR;  -- Cambiado de INTEGER a VARCHAR
    v_id_auditoria VARCHAR;
BEGIN
    -- Validar que la cuenta existe
    IF NOT EXISTS (SELECT 1 FROM public.cuentas_por_pagar WHERE id_cuenta = p_id_cuenta) THEN
        RAISE EXCEPTION 'La cuenta % no existe', p_id_cuenta;
    END IF;

    -- Obtener saldo actual
    SELECT saldo_pendiente INTO v_saldo_actual
    FROM public.cuentas_por_pagar
    WHERE id_cuenta = p_id_cuenta;

    -- Validar que el monto no sea mayor al saldo
    IF p_monto_pago > v_saldo_actual THEN
        RAISE EXCEPTION 'El monto del pago (%) no puede ser mayor al saldo pendiente (%)', 
            p_monto_pago, v_saldo_actual;
    END IF;

    -- Validar monto positivo
    IF p_monto_pago <= 0 THEN
        RAISE EXCEPTION 'El monto del pago debe ser mayor a 0';
    END IF;

    -- Obtener ID de usuario
    SELECT id_usuario INTO v_id_usuario
    FROM public.usuarios
    WHERE username = p_username
    LIMIT 1;

    IF v_id_usuario IS NULL THEN
        -- Intentar con usuarios antiguos (si existen)
        SELECT id_usuario INTO v_id_usuario
        FROM public.usuarios
        WHERE CAST(id_usuario AS VARCHAR) = p_username
        LIMIT 1;
    END IF;
    
    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION 'Usuario % no encontrado', p_username;
    END IF;

    -- Calcular nuevo saldo
    v_nuevo_saldo := v_saldo_actual - p_monto_pago;

    -- Generar ID para el pago
    v_id_pago := 'PAG-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                 LPAD(NEXTVAL('sq_pago')::TEXT, 4, '0');

    -- Registrar el pago en tabla de pagos
    INSERT INTO public.pagos_cuentas (
        id_pago,
        id_cuenta,
        monto_pago,
        fecha_pago,
        metodo_pago,
        comprobante_url,
        observaciones,
        registrado_por,
        fecha_registro
    ) VALUES (
        v_id_pago,
        p_id_cuenta,
        p_monto_pago,
        p_fecha_pago,
        p_metodo_pago,
        p_comprobante_url,
        p_observaciones,
        v_id_usuario,
        NOW()
    );

    -- Actualizar saldo de la cuenta
    UPDATE public.cuentas_por_pagar
    SET saldo_pendiente = v_nuevo_saldo,
        estado = CASE 
            WHEN v_nuevo_saldo = 0 THEN 'PAGADO'
            ELSE 'PENDIENTE'
        END
    WHERE id_cuenta = p_id_cuenta;

    -- Generar ID de auditoría
    v_id_auditoria := 'AUD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                      LPAD(NEXTVAL('auditoria_seq')::TEXT, 4, '0');

    -- Registrar auditoría
    INSERT INTO public.auditoria (
        id_auditoria,
        tabla_afectada,
        accion,
        id_registro_afectado,
        usuario,
        fecha_hora,
        detalles
    ) VALUES (
        v_id_auditoria,
        'cuentas_por_pagar',
        'PAGO',
        p_id_cuenta,
        v_id_usuario,
        NOW(),
        FORMAT('Pago registrado: %s, Monto: %s, Método: %s, Nuevo saldo: %s',
            v_id_pago, p_monto_pago, p_metodo_pago, v_nuevo_saldo)
    );

    RETURN v_id_pago;
END;
$function$;

-- ============================================================================
-- CREAR TABLA DE PAGOS SI NO EXISTE
-- ============================================================================

DROP TABLE IF EXISTS public.pagos_cuentas CASCADE;

CREATE TABLE IF NOT EXISTS public.pagos_cuentas (
    id_pago VARCHAR(50) PRIMARY KEY,
    id_cuenta VARCHAR(50) NOT NULL,
    monto_pago NUMERIC(12,2) NOT NULL CHECK (monto_pago > 0),
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE')),
    comprobante_url TEXT,
    observaciones TEXT,
    registrado_por VARCHAR(50),  -- Cambiado de INTEGER a VARCHAR
    fecha_registro TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'REGISTRADO'
);

COMMENT ON TABLE public.pagos_cuentas IS 'Registro de pagos realizados a cuentas por pagar';

-- ============================================================================
-- CREAR SECUENCIA SI NO EXISTE
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.sq_pago START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.auditoria_seq START WITH 1 INCREMENT BY 1;

-- ============================================================================
-- FUNCIÓN AUXILIAR: Listar pagos de una cuenta
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_leer_pagos_cuenta(
    p_id_cuenta VARCHAR
)
RETURNS TABLE(
    id_pago VARCHAR,
    monto_pago NUMERIC,
    fecha_pago DATE,
    metodo_pago VARCHAR,
    observaciones TEXT,
    registrado_por VARCHAR,
    fecha_registro TIMESTAMP
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id_pago,
        pc.monto_pago,
        pc.fecha_pago,
        pc.metodo_pago,
        pc.observaciones,
        COALESCE(u.username, pc.registrado_por) AS registrado_por,
        pc.fecha_registro
    FROM public.pagos_cuentas pc
    LEFT JOIN public.usuarios u ON u.id_usuario = pc.registrado_por
    WHERE pc.id_cuenta = p_id_cuenta
    ORDER BY pc.fecha_pago DESC, pc.fecha_registro DESC;
END;
$function$;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION public.fn_registrar_pago_cuenta IS 
'Registra un pago (parcial o total) a una cuenta por pagar.
Actualiza el saldo pendiente y cambia el estado a PAGADA si el saldo llega a 0.

Parámetros:
  - p_id_cuenta: ID de la cuenta a pagar
  - p_monto_pago: Monto del pago
  - p_fecha_pago: Fecha del pago
  - p_metodo_pago: EFECTIVO, TRANSFERENCIA o CHEQUE
  - p_observaciones: Observaciones opcionales
  - p_username: Usuario que registra el pago

Retorna: ID del pago generado (PAG-YYYYMMDD-0001)';

-- ============================================================================
-- EJEMPLOS DE USO:
-- ============================================================================

/*
-- Registrar un pago
SELECT fn_registrar_pago_cuenta(
    'CXP-001',           -- ID de cuenta
    500.00,              -- Monto
    CURRENT_DATE,        -- Fecha
    'TRANSFERENCIA',     -- Método
    'Pago parcial',      -- Observaciones
    'admin'              -- Usuario
);

-- Ver historial de pagos de una cuenta
SELECT * FROM fn_leer_pagos_cuenta('CXP-001');
*/

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ Tabla pagos_cuentas creada
-- ✅ Secuencia sq_pago creada
-- ✅ Función fn_registrar_pago_cuenta creada
-- ✅ Función fn_leer_pagos_cuenta creada
-- ============================================================================

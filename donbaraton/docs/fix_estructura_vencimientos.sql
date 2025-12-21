-- ============================================================================
-- SCRIPT 1: Verificación y Creación de Estructura para Vencimientos
-- ============================================================================
-- PROPÓSITO: Asegurar que existan los campos necesarios para el sistema de
--            control de vencimientos en las tablas productos y movimientos_inventario
-- ============================================================================

-- PASO 1: Verificar y crear campo fecha_vencimiento en movimientos_inventario
-- ============================================================================

DO $$
BEGIN
    -- Verificar si la columna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'movimientos_inventario' 
          AND column_name = 'fecha_vencimiento'
    ) THEN
        -- Crear la columna si no existe
        ALTER TABLE public.movimientos_inventario
        ADD COLUMN fecha_vencimiento DATE;
        
        RAISE NOTICE 'Campo fecha_vencimiento creado en movimientos_inventario';
    ELSE
        RAISE NOTICE 'Campo fecha_vencimiento ya existe en movimientos_inventario';
    END IF;
END $$;

-- Crear índice para optimizar consultas de vencimientos
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_vencimiento
ON public.movimientos_inventario(fecha_vencimiento)
WHERE fecha_vencimiento IS NOT NULL;

COMMENT ON INDEX idx_movimientos_fecha_vencimiento IS 'Índice para optimizar consultas de productos próximos a vencer';

-- ============================================================================
-- PASO 2: Verificar y crear campo controla_vencimiento en productos
-- ============================================================================

DO $$
BEGIN
    -- Verificar si la columna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'productos' 
          AND column_name = 'controla_vencimiento'
    ) THEN
        -- Crear la columna si no existe
        ALTER TABLE public.productos
        ADD COLUMN controla_vencimiento BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Campo controla_vencimiento creado en productos';
    ELSE
        RAISE NOTICE 'Campo controla_vencimiento ya existe en productos';
    END IF;
END $$;

-- Comentar el campo para documentación
COMMENT ON COLUMN public.productos.controla_vencimiento IS 'Indica si el producto requiere control de fecha de vencimiento (ej: alimentos perecederos, medicamentos)';

-- ============================================================================
-- PASO 3: Verificación de datos existentes
-- ============================================================================

-- Consulta para ver cuántos registros tienen fecha de vencimiento
DO $$
DECLARE
    v_count INTEGER;
    v_min_fecha DATE;
    v_max_fecha DATE;
BEGIN
    SELECT COUNT(*), MIN(fecha_vencimiento), MAX(fecha_vencimiento)
    INTO v_count, v_min_fecha, v_max_fecha
    FROM public.movimientos_inventario
    WHERE fecha_vencimiento IS NOT NULL;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RESUMEN DE DATOS DE VENCIMIENTO:';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Movimientos con fecha de vencimiento: %', v_count;
    
    IF v_count > 0 THEN
        RAISE NOTICE 'Fecha más antigua: %', v_min_fecha;
        RAISE NOTICE 'Fecha más reciente: %', v_max_fecha;
    ELSE
        RAISE NOTICE 'No hay registros con fecha de vencimiento aún.';
        RAISE NOTICE 'Las fechas se registrarán automáticamente al:';
        RAISE NOTICE '  - Recibir compras con fecha de vencimiento';
        RAISE NOTICE '  - Hacer ajustes de inventario con lotes';
    END IF;
    RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ Campo fecha_vencimiento existe en movimientos_inventario
-- ✅ Índice creado para optimizar consultas
-- ✅ Campo controla_vencimiento existe en productos
-- ✅ Reporte de datos existentes mostrado
-- ============================================================================

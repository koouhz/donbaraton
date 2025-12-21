-- =====================================================
-- SCRIPT MÍNIMO: Solo crear tabla stock_no_vendible
-- Ejecutar en Supabase SQL Editor
-- NO modifica ninguna función existente
-- =====================================================

-- Crear tabla para stock no vendible (productos dañados y vencidos)
CREATE TABLE IF NOT EXISTS public.stock_no_vendible (
    id_registro VARCHAR PRIMARY KEY,
    id_producto VARCHAR NOT NULL REFERENCES productos(id_producto),
    id_devolucion VARCHAR,
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

-- Habilitar RLS (Row Level Security) si es necesario
ALTER TABLE public.stock_no_vendible ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidades)
DROP POLICY IF EXISTS "Permitir todo en stock_no_vendible" ON public.stock_no_vendible;
CREATE POLICY "Permitir todo en stock_no_vendible" 
ON public.stock_no_vendible 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verificar creación
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_no_vendible') THEN
        RAISE NOTICE '✅ Tabla stock_no_vendible creada/verificada correctamente';
    ELSE
        RAISE NOTICE '❌ ERROR: La tabla no se creó';
    END IF;
END $$;

-- ============================================================================
-- DATOS DE PRUEBA: Cuentas por Pagar
-- PROPÓSITO: Insertar cuentas de ejemplo para probar el módulo
-- ============================================================================

-- IMPORTANTE: Ajusta los IDs de proveedores según tu base de datos

-- Insertar cuentas por pagar de ejemplo
INSERT INTO public.cuentas_por_pagar (
    id_cuenta,
    id_proveedor,
    numero_factura,
    fecha_emision,
    fecha_vencimiento,
    monto_total,
    saldo_pendiente,
    estado,
    observaciones
) VALUES
-- Cuenta 1: VENCIDA (rojo)
(
    'CXP-001',
    (SELECT id_proveedor FROM public.proveedores LIMIT 1),
    'FACT-2024-001',
    '2024-11-15',
    '2024-12-15',
    5000.00,
    5000.00,
    'PENDIENTE',
    'Compra de productos varios'
),
-- Cuenta 2: PRÓXIMA A VENCER (amarillo - 5 días)
(
    'CXP-002',
    (SELECT id_proveedor FROM public.proveedores LIMIT 1 OFFSET 1),
    'FACT-2024-002',
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE + INTERVAL '5 days',
    3500.50,
    3500.50,
    'PENDIENTE',
    'Compra de abarrotes'
),
-- Cuenta 3: AL DÍA (azul - 20 días)
(
    'CXP-003',
    (SELECT id_proveedor FROM public.proveedores LIMIT 1),
    'FACT-2024-003',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    8200.00,
    8200.00,
    'PENDIENTE',
    'Compra de productos de limpieza'
),
-- Cuenta 4: PAGADA (verde)
(
    'CXP-004',
    (SELECT id_proveedor FROM public.proveedores LIMIT 1 OFFSET 1),
    'FACT-2024-004',
    '2024-12-01',
    '2024-12-31',
    2500.00,
    0.00,
    'PAGADA',
    'Compra de insumos - PAGADO COMPLETO'
),
-- Cuenta 5: PAGO PARCIAL
(
    'CXP-005',
    (SELECT id_proveedor FROM public.proveedores LIMIT 1),
    'FACT-2024-005',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days',
    10000.00,
    6500.00,
    'PENDIENTE',
    'Compra grande - pago parcial realizado'
),
-- Cuenta 6: MUY VENCIDA (rojo - hace 30 días)
(
    'CXP-006',
    (SELECT id_proveedor FROM public.proveedores LIMIT 1 OFFSET 1),
    'FACT-2024-006',
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '30 days',
    12000.00,
    12000.00,
    'PENDIENTE',
    'Compra urgente - ATRASADA'
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver las cuentas insertadas
SELECT 
    id_cuenta,
    numero_factura,
    fecha_vencimiento,
    monto_total,
    saldo_pendiente,
    estado,
    CASE 
        WHEN fecha_vencimiento < CURRENT_DATE THEN 'VENCIDA 🔴'
        WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 'PRÓXIMA 🟡'
        ELSE 'AL DÍA 🔵'
    END as semaforo
FROM public.cuentas_por_pagar
ORDER BY fecha_vencimiento;

-- ============================================================================
-- NOTA: Si no tienes proveedores, ejecuta primero:
-- ============================================================================
/*
INSERT INTO public.proveedores (
    id_proveedor,
    razon_social,
    nit_ci,
    telefono,
    email,
    estado
) VALUES
('PROV-001', 'Distribuidora ABC', '1234567890', '71234567', 'contacto@abc.com', 'ACTIVO'),
('PROV-002', 'Comercial XYZ', '0987654321', '79876543', 'ventas@xyz.com', 'ACTIVO');
*/

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ 6 cuentas por pagar insertadas
-- ✅ Diferentes estados y fechas de vencimiento
-- ✅ Listas para probar el módulo de Cuentas por Pagar
-- ✅ Sistema de semáforo funcionando (🔴🟡🔵)
-- ============================================================================

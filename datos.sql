INSERT INTO public.auditoria (id, usuario, modulo, accion, detalles, estado, fecha_hora) VALUES
('AUD001', 'admin', 'SISTEMA', 'CONFIGURACION', 'Configuración de parámetros generales del sistema y asignación de permisos iniciales', 'EXITOSO', '2024-01-15 09:00:00'),
('AUD002', 'cajero1', 'VENTAS', 'CREACION', 'Creación de venta #V001 - Total: $145.00 - Cliente: Juan Pérez - Productos: Leche, Coca Cola, Arroz', 'EXITOSO', '2024-01-25 10:30:00'),
('AUD003', 'almacen', 'INVENTARIO', 'ENTRADA', 'Recepción de orden #OC001 - 100 unidades de Leche Entera 1L (Lote: LOTE-LEC-0124) - Proveedor: Lacteos S.A.', 'EXITOSO', '2024-01-20 14:30:00'),
('AUD004', 'compras', 'ORDENES_COMPRA', 'CREACION', 'Creación orden de compra #OC002 por $3,200.00 - Proveedor: Distribuidora Alimentos SRL - Productos: Carne, Arroz, Pan', 'EXITOSO', '2024-02-01 09:00:00'),
('AUD005', 'supervisor', 'CIERRE_CAJA', 'VERIFICACION', 'Verificación y aprobación de cierre #CIERRE001 - Total efectivo: $2,850.75 - Diferencia: +$2.50 - Cajero: María Fernández', 'EXITOSO', '2024-01-25 17:00:00'),
('AUD006', 'gerente', 'REPORTES', 'GENERACION', 'Generación reporte de ventas mensual Enero 2024 - Total ventas: $15,432.50 - Crecimiento: 12% vs mes anterior', 'EXITOSO', '2024-02-01 09:00:00'),
('AUD007', 'contador', 'CONTABILIDAD', 'CIERRE', 'Cierre contable del mes de Enero 2024 - Balance general generado - Declaraciones de impuestos preparadas', 'EXITOSO', '2024-02-05 18:00:00');

INSERT INTO public.roles (id, nombre, descripcion, auditoria_id) VALUES
(1, 'Administrador', 'Acceso completo al sistema', 'AUD001'),
(2, 'Cajero', 'Puede realizar ventas y cierre de caja', 'AUD001'),
(3, 'Encargado de almacén', 'Gestiona inventario y recepciones', 'AUD001'),
(4, 'Encargado de compras', 'Realiza órdenes de compra', 'AUD001'),
(5, 'Supervisor de caja', 'Supervisa cierres y movimientos de caja', 'AUD001'),
(6, 'Gerente', 'Supervisión general y reportes', 'AUD001'),
(7, 'Contador', 'Gestión contable y financiera', 'AUD001');

INSERT INTO public.cargos (id, nombre, descripcion, auditoria_id) VALUES
(1, 'Gerente General', 'Responsable de toda la operación', 'AUD001'),
(2, 'Cajero', 'Atención al cliente y cobros', 'AUD001'),
(3, 'Almacenero', 'Control de inventario', 'AUD001'),
(4, 'Comprador', 'Gestión de compras', 'AUD001'),
(5, 'Supervisor', 'Supervisión de operaciones', 'AUD001'),
(6, 'Contador', 'Gestión financiera', 'AUD001'),
(7, 'Atención al Cliente', 'Ventas y atención', 'AUD001');

INSERT INTO public.horarios (id, nombre, hora_entrada, hora_salida, auditoria_id) VALUES
(1, 'Turno Mañana', '08:00:00', '16:00:00', 'AUD001'),
(2, 'Turno Tarde', '14:00:00', '22:00:00', 'AUD001'),
(3, 'Administrativo', '09:00:00', '17:00:00', 'AUD001'),
(4, 'Fin de Semana', '10:00:00', '18:00:00', 'AUD001');

INSERT INTO public.empleados (id, ci, expedido, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, celular, email, direccion, cargo_id, fecha_contratacion, tipo_contrato, horario_id, salario, estado, foto_url, auditoria_id) VALUES
('EMP001', '1234567', 'LP', 'Carlos', 'García', 'López', '1985-03-15', true, '2212345', '71122334', 'carlos.garcia@empresa.com', 'Av. Libertador #123', 1, '2020-01-15', 'FIJO', 3, 15000.00, 'ACTIVO', '/fotos/emp001.jpg', 'AUD001'),
('EMP002', '2345678', 'SC', 'María', 'Fernández', 'Pérez', '1990-07-22', false, '2276543', '71233445', 'maria.fernandez@empresa.com', 'Calle Comercio #456', 2, '2021-03-01', 'FIJO', 1, 5500.00, 'ACTIVO', '/fotos/emp002.jpg', 'AUD001'),
('EMP003', '3456789', 'LP', 'Juan', 'Martínez', 'Rodríguez', '1988-11-30', true, '2254321', '71344556', 'juan.martinez@empresa.com', 'Zona Sur #789', 3, '2020-06-15', 'FIJO', 2, 6000.00, 'ACTIVO', '/fotos/emp003.jpg', 'AUD001'),
('EMP004', '4567890', 'CB', 'Ana', 'Torres', 'Sánchez', '1992-04-18', false, '2298765', '71455667', 'ana.torres@empresa.com', 'Av. Blanco #101', 4, '2022-02-10', 'FIJO', 3, 7000.00, 'ACTIVO', '/fotos/emp004.jpg', 'AUD001'),
('EMP005', '5678901', 'LP', 'Luis', 'Vargas', 'Mendoza', '1987-09-05', true, '2234567', '71566778', 'luis.vargas@empresa.com', 'Calle Potosí #202', 5, '2021-08-20', 'FIJO', 1, 8000.00, 'ACTIVO', '/fotos/emp005.jpg', 'AUD001');

INSERT INTO public.usuarios (id, empleado_id, username, password_hash, rol_id, estado, auditoria_id) VALUES
(1, 'EMP001', 'admin', '$2a$10$YourHashedPassword123', 1, 'ACTIVO', 'AUD001'),
(2, 'EMP002', 'cajero1', '$2a$10$YourHashedPassword456', 2, 'ACTIVO', 'AUD001'),
(3, 'EMP003', 'almacen', '$2a$10$YourHashedPassword789', 3, 'ACTIVO', 'AUD001'),
(4, 'EMP004', 'compras', '$2a$10$YourHashedPassword012', 4, 'ACTIVO', 'AUD001'),
(5, 'EMP005', 'supervisor', '$2a$10$YourHashedPassword345', 5, 'ACTIVO', 'AUD001'),
(6, NULL, 'gerente', '$2a$10$YourHashedPassword678', 6, 'ACTIVO', 'AUD001'),
(7, NULL, 'contador', '$2a$10$YourHashedPassword901', 7, 'ACTIVO', 'AUD001');

INSERT INTO public.categorias (id, nombre, descripcion, activo, auditoria_id) VALUES
(1, 'Lácteos', 'Leche, yogur, queso, mantequilla', true, 'AUD001'),
(2, 'Carnes', 'Carne de res, pollo, cerdo', true, 'AUD001'),
(3, 'Bebidas', 'Refrescos, jugos, agua', true, 'AUD001'),
(4, 'Limpieza', 'Detergentes, desinfectantes', true, 'AUD001'),
(5, 'Abarrotes', 'Arroz, fideos, azúcar', true, 'AUD001'),
(6, 'Panadería', 'Pan, galletas, pasteles', true, 'AUD001'),
(7, 'Congelados', 'Alimentos congelados', true, 'AUD001');

INSERT INTO public.proveedores (id, razon_social, nit_ci, telefono, celular_contacto, email, direccion, nombre_contacto, plazo_credito, estado, auditoria_id) VALUES
('PROV001', 'Lacteos S.A.', '123456789', '22445566', '72001122', 'ventas@lacteossa.com', 'Av. Industrial #100', 'Roberto Castro', 30, 'ACTIVO', 'AUD001'),
('PROV002', 'Distribuidora Alimentos SRL', '987654321', '22556677', '73002233', 'pedidos@dalimentos.com', 'Calle Fabril #200', 'Ana Mendoza', 45, 'ACTIVO', 'AUD001'),
('PROV003', 'Bebidas Refrescantes Ltda.', '456789123', '22667788', '74003344', 'info@bebidasref.com', 'Zona Franca #300', 'Carlos Ruiz', 30, 'ACTIVO', 'AUD001'),
('PROV004', 'Productos de Limpieza S.A.', '789123456', '22778899', '75004455', 'ventas@proclean.com', 'Parque Industrial #400', 'Marta Gómez', 60, 'ACTIVO', 'AUD001'),
('PROV005', 'Importadora Granos SRL', '321654987', '22889900', '76005566', 'importadora@granos.com', 'Av. Comercio #500', 'Jorge Silva', 15, 'ACTIVO', 'AUD001');

INSERT INTO public.productos (id, codigo_interno, codigo_barras, nombre, categoria_id, marca, proveedor_principal_id, precio_costo, precio_venta, stock_minimo, stock_maximo, stock_actual, unidad_medida, presentacion, controla_vencimiento, foto_url, auditoria_id) VALUES
('PROD001', 'LEC001', '7791234567890', 'Leche Entera 1L', 1, 'Pil', 'PROV001', 5.50, 7.50, 50, 200, 150, 'litro', 'Caja x 12 unidades', true, '/productos/leche.jpg', 'AUD001'),
('PROD002', 'QUES001', '7792345678901', 'Queso Blanco 500g', 1, 'Andea', 'PROV001', 18.00, 25.00, 20, 100, 45, 'gramo', 'Unidad', true, '/productos/queso.jpg', 'AUD001'),
('PROD003', 'CAR001', '7793456789012', 'Carne Molida 1kg', 2, 'Frigor', 'PROV002', 32.00, 45.00, 30, 150, 85, 'kilogramo', 'Paquete al vacío', true, '/productos/carne.jpg', 'AUD001'),
('PROD004', 'COC001', '7794567890123', 'Coca Cola 2L', 3, 'Coca Cola', 'PROV003', 7.00, 10.00, 100, 500, 320, 'litro', 'Botella PET', false, '/productos/coca.jpg', 'AUD001'),
('PROD005', 'DET001', '7795678901234', 'Detergente Líquido 1L', 4, 'Ace', 'PROV004', 15.00, 22.00, 40, 200, 120, 'litro', 'Botella', false, '/productos/detergente.jpg', 'AUD001'),
('PROD006', 'ARR001', '7796789012345', 'Arroz Grano Largo 1kg', 5, 'Gavilla', 'PROV005', 6.50, 9.00, 80, 400, 210, 'kilogramo', 'Bolsa', false, '/productos/arroz.jpg', 'AUD001'),
('PROD007', 'PAN001', '7797890123456', 'Pan de Molde Integral', 6, 'Bimbo', 'PROV002', 8.00, 12.00, 30, 150, 65, 'unidad', 'Paquete', true, '/productos/pan.jpg', 'AUD001');

INSERT INTO public.clientes (id, nombres, apellido_paterno, apellido_materno, ci_nit, telefono, email, direccion, estado, auditoria_id) VALUES
('CLI001', 'Juan', 'Pérez', 'González', '87654321', '22443322', 'juan.perez@gmail.com', 'Calle Murillo #123', 'ACTIVO', 'AUD001'),
('CLI002', 'María', 'López', 'Martínez', '12349876', '22554433', 'maria.lopez@hotmail.com', 'Av. Villazón #456', 'ACTIVO', 'AUD001'),
('CLI003', 'Empresa Comercial SRL', NULL, NULL, '1023456789', '22778899', 'compras@empresacomercial.com', 'Zona Industrial #789', 'ACTIVO', 'AUD001'),
('CLI004', 'Carlos', 'Rodríguez', 'Vargas', '5556667', '22669988', 'carlos.rodriguez@yahoo.com', 'Barrio Equipetrol #101', 'ACTIVO', 'AUD001'),
('CLI005', 'Restaurante Sabor Local', NULL, NULL, '2012345678', '22887766', 'proveedor@saborlocal.com', 'Calle Chuquisaca #202', 'ACTIVO', 'AUD001');

INSERT INTO public.ordenes_compra (id, proveedor_id, fecha_emision, fecha_entrega, estado, total, usuario_id, auditoria_id) VALUES
('OC001', 'PROV001', '2024-01-15', '2024-01-20', 'RECIBIDA', 1250.00, 4, 'AUD004'),
('OC002', 'PROV002', '2024-02-01', '2024-02-05', 'RECIBIDA', 3200.00, 4, 'AUD004'),
('OC003', 'PROV003', '2024-02-10', '2024-02-15', 'PENDIENTE', 1800.00, 4, 'AUD004'),
('OC004', 'PROV004', '2024-01-20', '2024-01-25', 'RECIBIDA', 950.00, 4, 'AUD004'),
('OC005', 'PROV005', '2024-02-05', '2024-02-10', 'CANCELADA', 2100.00, 4, 'AUD004');

INSERT INTO public.detalle_orden_compra (id, orden_id, producto_id, cantidad, precio_unitario, descuento, subtotal, auditoria_id) VALUES
(1, 'OC001', 'PROD001', 100, 5.50, 0.00, 550.00, 'AUD004'),
(2, 'OC001', 'PROD002', 40, 18.00, 0.00, 720.00, 'AUD004'),
(3, 'OC002', 'PROD003', 50, 32.00, 100.00, 1500.00, 'AUD004'),
(4, 'OC002', 'PROD006', 100, 6.50, 0.00, 650.00, 'AUD004'),
(5, 'OC002', 'PROD007', 80, 8.00, 50.00, 590.00, 'AUD004'),
(6, 'OC003', 'PROD004', 150, 7.00, 150.00, 900.00, 'AUD004'),
(7, 'OC003', 'PROD001', 50, 5.50, 0.00, 275.00, 'AUD004');

INSERT INTO public.recepciones (id, orden_id, fecha_ingreso, lote, fecha_vencimiento, usuario_id, auditoria_id) VALUES
('REC001', 'OC001', '2024-01-20', 'LOTE-LEC-0124', '2024-03-20', 3, 'AUD003'),
('REC002', 'OC001', '2024-01-20', 'LOTE-QUE-0124', '2024-04-15', 3, 'AUD003'),
('REC003', 'OC002', '2024-02-05', 'LOTE-CAR-0224', '2024-03-05', 3, 'AUD003'),
('REC004', 'OC002', '2024-02-05', 'LOTE-ARR-0224', '2025-02-05', 3, 'AUD003'),
('REC005', 'OC004', '2024-01-25', 'LOTE-DET-0124', '2026-01-25', 3, 'AUD003');

INSERT INTO public.lotes (id, producto_id, lote, fecha_vencimiento, cantidad, estado, auditoria_id) VALUES
('LOT001', 'PROD001', 'LOTE-LEC-0124', '2024-03-20', 100, 'ACTIVO', 'AUD003'),
('LOT002', 'PROD002', 'LOTE-QUE-0124', '2024-04-15', 40, 'ACTIVO', 'AUD003'),
('LOT003', 'PROD003', 'LOTE-CAR-0224', '2024-03-05', 50, 'ACTIVO', 'AUD003'),
('LOT004', 'PROD006', 'LOTE-ARR-0224', '2025-02-05', 100, 'ACTIVO', 'AUD003'),
('LOT005', 'PROD005', 'LOTE-DET-0124', '2026-01-25', 80, 'ACTIVO', 'AUD003');

INSERT INTO public.ventas (id, cliente_id, fecha_hora, total, tipo_comprobante, usuario_id, auditoria_id) VALUES
('V001', 'CLI001', '2024-01-25 10:30:00', 145.00, 'TICKET', 2, 'AUD002'),
('V002', 'CLI003', '2024-01-25 11:15:00', 890.00, 'FACTURA_A', 2, 'AUD002'),
('V003', 'CLI002', '2024-01-26 09:45:00', 67.50, 'TICKET', 2, 'AUD002'),
('V004', 'CLI004', '2024-01-26 14:20:00', 234.00, 'TICKET', 2, 'AUD002'),
('V005', 'CLI005', '2024-01-27 16:30:00', 1234.50, 'FACTURA_A', 2, 'AUD002');

INSERT INTO public.detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal, auditoria_id) VALUES
(1, 'V001', 'PROD001', 5, 7.50, 0.00, 37.50, 'AUD002'),
(2, 'V001', 'PROD004', 3, 10.00, 1.50, 28.50, 'AUD002'),
(3, 'V001', 'PROD006', 10, 9.00, 2.00, 88.00, 'AUD002'),
(4, 'V002', 'PROD003', 15, 45.00, 50.00, 625.00, 'AUD002'),
(5, 'V002', 'PROD002', 10, 25.00, 0.00, 250.00, 'AUD002'),
(6, 'V002', 'PROD007', 2, 12.00, 1.00, 23.00, 'AUD002'),
(7, 'V003', 'PROD001', 2, 7.50, 0.00, 15.00, 'AUD002'),
(8, 'V003', 'PROD006', 5, 9.00, 2.50, 42.50, 'AUD002'),
(9, 'V003', 'PROD004', 1, 10.00, 0.00, 10.00, 'AUD002');

INSERT INTO public.pagos (id, venta_id, medio, importe, ultimos_4_digitos, cupon, vuelto, auditoria_id) VALUES
('PAG001', 'V001', 'EFECTIVO', 150.00, NULL, NULL, 5.00, 'AUD002'),
('PAG002', 'V002', 'DEBITO', 890.00, '1234', NULL, 0.00, 'AUD002'),
('PAG003', 'V003', 'EFECTIVO', 70.00, NULL, NULL, 2.50, 'AUD002'),
('PAG004', 'V004', 'CREDITO', 234.00, '5678', 'DESC50', 0.00, 'AUD002'),
('PAG005', 'V005', 'TRANSFERENCIA', 1234.50, NULL, NULL, 0.00, 'AUD002');

INSERT INTO public.asistencias (id, empleado_id, fecha, hora_entrada, hora_salida, tipo, metodo, auditoria_id) VALUES
('ASIS001', 'EMP002', '2024-01-25', '08:00:00', '16:05:00', 'ENTRADA', 'BIOMETRICO', 'AUD005'),
('ASIS002', 'EMP002', '2024-01-25', '16:05:00', NULL, 'SALIDA', 'BIOMETRICO', 'AUD005'),
('ASIS003', 'EMP003', '2024-01-25', '13:55:00', '22:00:00', 'ENTRADA', 'MANUAL', 'AUD005'),
('ASIS004', 'EMP001', '2024-01-25', '09:05:00', NULL, 'RETRASO', 'TARJETA', 'AUD005'),
('ASIS005', 'EMP004', '2024-01-25', '09:00:00', '17:10:00', 'ENTRADA', 'BIOMETRICO', 'AUD005');

INSERT INTO public.movimientos_inventario (id, producto_id, tipo, cantidad, lote, documento, motivo, usuario_id, fecha_hora, auditoria_id) VALUES
('MOV001', 'PROD001', 'ENTRADA', 100, 'LOTE-LEC-0124', 'OC001', 'Compra a proveedor', 3, '2024-01-20 14:30:00', 'AUD003'),
('MOV002', 'PROD002', 'ENTRADA', 40, 'LOTE-QUE-0124', 'OC001', 'Compra a proveedor', 3, '2024-01-20 14:35:00', 'AUD003'),
('MOV003', 'PROD001', 'SALIDA', 5, 'LOTE-LEC-0124', 'V001', 'Venta al cliente', 2, '2024-01-25 10:30:00', 'AUD003'),
('MOV004', 'PROD003', 'ENTRADA', 50, 'LOTE-CAR-0224', 'OC002', 'Compra a proveedor', 3, '2024-02-05 11:00:00', 'AUD003'),
('MOV005', 'PROD004', 'SALIDA', 3, NULL, 'V001', 'Venta al cliente', 2, '2024-01-25 10:30:00', 'AUD003');

INSERT INTO public.cierre_caja (id, usuario_id, fecha, hora_cierre, total_efectivo, diferencia, observaciones, auditoria_id) VALUES
('CIERRE001', 2, '2024-01-25', '16:30:00', 2850.75, 2.50, 'Cierre normal del día', 'AUD005'),
('CIERRE002', 2, '2024-01-26', '16:45:00', 3120.25, -1.25, 'Falta pequeña cantidad', 'AUD005'),
('CIERRE003', 5, '2024-01-27', '17:00:00', 4230.50, 0.00, 'Cierre exacto', 'AUD005');

INSERT INTO public.cierre_caja_detalle (id, cierre_id, denominacion, cantidad, auditoria_id) VALUES
(1, 'CIERRE001', 100.00, 15, 'AUD005'),
(2, 'CIERRE001', 50.00, 12, 'AUD005'),
(3, 'CIERRE001', 20.00, 25, 'AUD005'),
(4, 'CIERRE001', 10.00, 18, 'AUD005'),
(5, 'CIERRE001', 5.00, 30, 'AUD005'),
(6, 'CIERRE001', 1.00, 45, 'AUD005');

INSERT INTO public.cuentas_por_pagar (id, proveedor_id, factura_nro, fecha_emision, fecha_vencimiento, monto_total, saldo_pendiente, estado, observaciones, auditoria_id) VALUES
('CPP001', 'PROV001', 'FAC-001-2024', '2024-01-15', '2024-02-15', 1250.00, 0.00, 'PAGADO', 'Pago realizado el 10/02', 'AUD007'),
('CPP002', 'PROV002', 'FAC-002-2024', '2024-02-01', '2024-03-18', 3200.00, 3200.00, 'PENDIENTE', 'Por vencer', 'AUD007'),
('CPP003', 'PROV004', 'FAC-003-2024', '2024-01-20', '2024-03-20', 950.00, 950.00, 'PENDIENTE', 'Próximo a vencer', 'AUD007'),
('CPP004', 'PROV003', 'FAC-004-2024', '2023-12-15', '2024-01-15', 1800.00, 1800.00, 'VENCIDO', 'Contactar proveedor', 'AUD007');

INSERT INTO public.alertas_stock (id, producto_id, tipo, fecha_generada, estado, mensaje, auditoria_id) VALUES
('ALERT001', 'PROD002', 'STOCK_MINIMO', '2024-01-25 08:00:00', 'PENDIENTE', 'Stock de queso por debajo del mínimo', 'AUD003'),
('ALERT002', 'PROD007', 'VENCIMIENTO', '2024-01-26 10:15:00', 'PENDIENTE', 'Producto próximo a vencer en 15 días', 'AUD003'),
('ALERT003', 'PROD005', 'STOCK_CRITICO', '2024-01-27 09:30:00', 'RESUELTA', 'Stock de detergente crítico', 'AUD003');

INSERT INTO public.devoluciones_ventas (id, venta_id, motivo, forma_reembolso, fecha, usuario_id, auditoria_id) VALUES
('DEV001', 'V003', 'Producto dañado', 'EFECTIVO', '2024-01-27 11:00:00', 2, 'AUD002'),
('DEV002', 'V001', 'Cambio de producto', 'NOTA_CREDITO', '2024-01-28 16:30:00', 5, 'AUD005');

INSERT INTO public.devoluciones_proveedor (id, recepcion_id, motivo, cantidad, observaciones, fecha, auditoria_id) VALUES
('DEVP001', 'REC001', 'DAÑO', 5, 'Cajas de leche abolladas', '2024-01-21 10:00:00', 'AUD004'),
('DEVP002', 'REC003', 'VENCIDO', 2, 'Carne con fecha próxima', '2024-02-06 09:30:00', 'AUD004');

INSERT INTO public.detalle_devolucion_proveedor (id, devolucion_id, producto_id, cantidad, lote, auditoria_id) VALUES
(1, 'DEVP001', 'PROD001', 5, 'LOTE-LEC-0124', 'AUD004'),
(2, 'DEVP002', 'PROD003', 2, 'LOTE-CAR-0224', 'AUD004');

INSERT INTO public.backups (id, fecha_hora, ruta_archivo, usuario_id, auditoria_id) VALUES
(1, '2024-01-25 23:00:00', '/backups/backup_20240125.sql', 1, 'AUD001'),
(2, '2024-01-26 23:00:00', '/backups/backup_20240126.sql', 1, 'AUD001'),
(3, '2024-01-27 23:00:00', '/backups/backup_20240127.sql', 1, 'AUD001');

-- ===========================================
-- FUNCIONES PARA MARCAS Y UNIDADES DE MEDIDA
-- ===========================================

-- 1. Leer todas las marcas activas
CREATE OR REPLACE FUNCTION public.fn_leer_marcas()
RETURNS TABLE(
    id_marca character varying,
    nombre character varying,
    descripcion text,
    estado character varying
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        m.id_marca,
        m.nombre,
        m.descripcion,
        m.estado
    FROM public.marcas m
    WHERE m.estado = 'ACTIVO'
    ORDER BY m.nombre;
END;
$function$;

-- 2. Crear nueva marca
CREATE OR REPLACE FUNCTION public.fn_crear_marca(
    p_nombre character varying,
    p_descripcion text DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS character varying
LANGUAGE plpgsql
AS $function$
DECLARE
    v_id VARCHAR;
BEGIN
    -- Validar que no exista una marca con el mismo nombre
    IF EXISTS (SELECT 1 FROM public.marcas WHERE UPPER(nombre) = UPPER(p_nombre) AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'Ya existe una marca con el nombre: %', p_nombre;
    END IF;

    -- Generar ID
    v_id := 'MARCA_' || LPAD(nextval('marcas_seq')::VARCHAR, 3, '0');
    
    -- Insertar marca
    INSERT INTO public.marcas (id_marca, nombre, descripcion, estado, fecha_registro)
    VALUES (v_id, UPPER(p_nombre), p_descripcion, 'ACTIVO', CURRENT_TIMESTAMP);
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'CREAR_MARCA',
        'Marca creada: ' || p_nombre
    );
    
    RETURN v_id;
END;
$function$;

-- 3. Leer todas las unidades de medida activas
CREATE OR REPLACE FUNCTION public.fn_leer_unidades_medida()
RETURNS TABLE(
    id_unidad character varying,
    nombre character varying,
    abreviatura character varying,
    descripcion text,
    estado character varying
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_unidad,
        u.nombre,
        u.abreviatura,
        u.descripcion,
        u.estado
    FROM public.unidades_medida u
    WHERE u.estado = 'ACTIVO'
    ORDER BY u.nombre;
END;
$function$;

-- 4. Crear nueva unidad de medida
CREATE OR REPLACE FUNCTION public.fn_crear_unidad_medida(
    p_nombre character varying,
    p_abreviatura character varying DEFAULT NULL,
    p_descripcion text DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS character varying
LANGUAGE plpgsql
AS $function$
DECLARE
    v_id VARCHAR;
BEGIN
    -- Validar que no exista una unidad con el mismo nombre
    IF EXISTS (SELECT 1 FROM public.unidades_medida WHERE UPPER(nombre) = UPPER(p_nombre) AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'Ya existe una unidad de medida con el nombre: %', p_nombre;
    END IF;

    -- Generar ID
    v_id := 'UNIDAD_' || LPAD(nextval('unidades_medida_seq')::VARCHAR, 3, '0');
    
    -- Insertar unidad
    INSERT INTO public.unidades_medida (id_unidad, nombre, abreviatura, descripcion, estado, fecha_registro)
    VALUES (v_id, UPPER(p_nombre), UPPER(p_abreviatura), p_descripcion, 'ACTIVO', CURRENT_TIMESTAMP);
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'CREAR_UNIDAD',
        'Unidad creada: ' || p_nombre
    );
    
    RETURN v_id;
END;
$function$;

-- 5. Actualizar marca existente
CREATE OR REPLACE FUNCTION public.fn_actualizar_marca(
    p_id_marca character varying,
    p_nombre character varying DEFAULT NULL,
    p_descripcion text DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Validar que no exista otra marca con el mismo nombre
    IF p_nombre IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.marcas 
        WHERE UPPER(nombre) = UPPER(p_nombre) 
        AND estado = 'ACTIVO' 
        AND id_marca != p_id_marca
    ) THEN
        RAISE EXCEPTION 'Ya existe otra marca con el nombre: %', p_nombre;
    END IF;

    UPDATE public.marcas
    SET 
        nombre = COALESCE(UPPER(p_nombre), nombre),
        descripcion = COALESCE(p_descripcion, descripcion)
    WHERE id_marca = p_id_marca AND estado = 'ACTIVO';
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'EDITAR_MARCA',
        'Marca editada: ' || p_id_marca
    );
    
    RETURN FOUND;
END;
$function$;

-- 6. Desactivar marca (borrado lógico)
CREATE OR REPLACE FUNCTION public.fn_desactivar_marca(
    p_id_marca character varying,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Verificar que no haya productos usando esta marca
    IF EXISTS (SELECT 1 FROM public.productos WHERE id_marca = p_id_marca AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'No se puede eliminar la marca porque hay productos activos asociados';
    END IF;

    UPDATE public.marcas
    SET estado = 'INACTIVO'
    WHERE id_marca = p_id_marca;
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'DESACTIVAR_MARCA',
        'Marca desactivada: ' || p_id_marca
    );
    
    RETURN FOUND;
END;
$function$;

-- 7. Actualizar unidad de medida existente
CREATE OR REPLACE FUNCTION public.fn_actualizar_unidad_medida(
    p_id_unidad character varying,
    p_nombre character varying DEFAULT NULL,
    p_abreviatura character varying DEFAULT NULL,
    p_descripcion text DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Validar que no exista otra unidad con el mismo nombre
    IF p_nombre IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.unidades_medida 
        WHERE UPPER(nombre) = UPPER(p_nombre) 
        AND estado = 'ACTIVO' 
        AND id_unidad != p_id_unidad
    ) THEN
        RAISE EXCEPTION 'Ya existe otra unidad con el nombre: %', p_nombre;
    END IF;

    UPDATE public.unidades_medida
    SET 
        nombre = COALESCE(UPPER(p_nombre), nombre),
        abreviatura = COALESCE(UPPER(p_abreviatura), abreviatura),
        descripcion = COALESCE(p_descripcion, descripcion)
    WHERE id_unidad = p_id_unidad AND estado = 'ACTIVO';
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'EDITAR_UNIDAD',
        'Unidad editada: ' || p_id_unidad
    );
    
    RETURN FOUND;
END;
$function$;

-- 8. Desactivar unidad de medida (borrado lógico)
CREATE OR REPLACE FUNCTION public.fn_desactivar_unidad_medida(
    p_id_unidad character varying,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Verificar que no haya productos usando esta unidad
    IF EXISTS (SELECT 1 FROM public.productos WHERE id_unidad = p_id_unidad AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'No se puede eliminar la unidad porque hay productos activos asociados';
    END IF;

    UPDATE public.unidades_medida
    SET estado = 'INACTIVO'
    WHERE id_unidad = p_id_unidad;
    
    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'PRODUCTOS', 
        'DESACTIVAR_UNIDAD',
        'Unidad desactivada: ' || p_id_unidad
    );
    
    RETURN FOUND;
END;
$function$;

-- ===========================================
-- SECUENCIAS NECESARIAS (si no existen)
-- ===========================================
CREATE SEQUENCE IF NOT EXISTS marcas_seq START WITH 3;
CREATE SEQUENCE IF NOT EXISTS unidades_medida_seq START WITH 6;

-- ===========================================
-- FUNCIÓN ACTUALIZADA PARA CREAR PRODUCTO 
-- (ahora usa id_marca e id_unidad en lugar de texto)
-- ===========================================
CREATE OR REPLACE FUNCTION public.fn_crear_producto_v2(
    p_codigo_interno character varying,
    p_codigo_barras character varying,
    p_nombre character varying,
    p_id_categoria character varying,
    p_id_marca character varying,
    p_id_unidad character varying,
    p_precio_costo numeric,
    p_precio_venta numeric,
    p_stock_minimo integer,
    p_stock_maximo integer,
    p_controla_vencimiento boolean,
    p_usuario_auditoria character varying
)
RETURNS character varying
LANGUAGE plpgsql
AS $function$
DECLARE
    v_id VARCHAR;
    v_nombre_marca VARCHAR;
BEGIN
    IF EXISTS (SELECT 1 FROM public.productos WHERE codigo_interno = p_codigo_interno) THEN
        RAISE EXCEPTION 'El código interno % ya existe.', p_codigo_interno;
    END IF;

    -- Obtener nombre de marca para el campo legacy
    SELECT nombre INTO v_nombre_marca FROM public.marcas WHERE id_marca = p_id_marca;

    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 'PRODUCTOS', 'CREAR',
        'Producto: ' || p_nombre || ' | Cod: ' || p_codigo_interno
    );
    
    v_id := 'PROD-' || LPAD(nextval('productos_seq')::VARCHAR, 3, '0');
    
    INSERT INTO public.productos (
        id_producto, codigo_interno, codigo_barras, nombre, id_categoria, 
        marca, id_marca, id_unidad,
        precio_costo, precio_venta, stock_minimo, stock_maximo, stock_actual,
        unidad_medida, controla_vencimiento, estado, fecha_registro
    ) VALUES (
        v_id, p_codigo_interno, p_codigo_barras, p_nombre, p_id_categoria, 
        v_nombre_marca, p_id_marca, p_id_unidad,
        p_precio_costo, p_precio_venta, p_stock_minimo, p_stock_maximo, 0,
        (SELECT abreviatura FROM public.unidades_medida WHERE id_unidad = p_id_unidad),
        p_controla_vencimiento, 'ACTIVO', CURRENT_TIMESTAMP
    );

    RETURN v_id;
END;
$function$;

-- ===========================================
-- FUNCIÓN ACTUALIZADA PARA EDITAR PRODUCTO
-- ===========================================
CREATE OR REPLACE FUNCTION public.fn_actualizar_producto_v2(
    p_id character varying,
    p_codigo_barras character varying DEFAULT NULL,
    p_nombre character varying DEFAULT NULL,
    p_categoria_id character varying DEFAULT NULL,
    p_id_marca character varying DEFAULT NULL,
    p_id_unidad character varying DEFAULT NULL,
    p_precio_costo numeric DEFAULT NULL,
    p_precio_venta numeric DEFAULT NULL,
    p_stock_minimo integer DEFAULT NULL,
    p_stock_maximo integer DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'admin'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
    v_nombre_marca VARCHAR;
    v_abrev_unidad VARCHAR;
BEGIN
    -- Obtener nombre de marca para el campo legacy
    IF p_id_marca IS NOT NULL THEN
        SELECT nombre INTO v_nombre_marca FROM public.marcas WHERE id_marca = p_id_marca;
    END IF;
    
    -- Obtener abreviatura de unidad para el campo legacy
    IF p_id_unidad IS NOT NULL THEN
        SELECT abreviatura INTO v_abrev_unidad FROM public.unidades_medida WHERE id_unidad = p_id_unidad;
    END IF;

    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 'PRODUCTOS', 'EDITAR',
        'Producto ID: ' || p_id
    );

    UPDATE public.productos
    SET 
        codigo_barras = COALESCE(p_codigo_barras, codigo_barras),
        nombre = COALESCE(p_nombre, nombre),
        id_categoria = COALESCE(p_categoria_id, id_categoria),
        id_marca = COALESCE(p_id_marca, id_marca),
        marca = COALESCE(v_nombre_marca, marca),
        id_unidad = COALESCE(p_id_unidad, id_unidad),
        unidad_medida = COALESCE(v_abrev_unidad, unidad_medida),
        precio_costo = COALESCE(p_precio_costo, precio_costo),
        precio_venta = COALESCE(p_precio_venta, precio_venta),
        stock_minimo = COALESCE(p_stock_minimo, stock_minimo),
        stock_maximo = COALESCE(p_stock_maximo, stock_maximo)
    WHERE id_producto = p_id;

    RETURN FOUND;
END;
$function$;

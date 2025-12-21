# 🔧 Solución al Error de Foreign Key en Actualización de Productos

## ❌ Error Encontrado

```
insert or update on table "productos" violates foreign key constraint
"productos_id_categoria_fkey"
```

## 🎯 Causa Raíz

El sistema tiene **dos funciones** para actualizar productos:

### 1️⃣ `fn_actualizar_producto` (Versión Antigua)

- ✅ Simple, pero sin soporte para marcas/unidades nuevas
- ❌ No valida foreign keys
- 📍 Ubicación: Base de datos legacy

### 2️⃣ `fn_actualizar_producto_v2` (Versión Actual)

- ✅ Soporta `id_marca` e `id_unidad`
- ❌ **NO VALIDA** que `p_categoria_id` exista
- 📍 Ubicación: `docs/fn_marcas_unidades.sql` líneas 331-383

## 🔍 Problema Específico

La función `fn_actualizar_producto_v2` hace esto:

```sql
UPDATE public.productos
SET
    id_categoria = COALESCE(p_categoria_id, id_categoria),
    ...
WHERE id_producto = p_id;
```

**Sin validar antes** que `p_categoria_id` exista en la tabla `categorias`, causando el error de foreign key cuando:

- Se pasa un ID de categoría inválido
- Se pasa un ID que no existe
- El frontend envía una string vacía `""` que luego se convierte a un valor inválido

## ✅ Solución Implementada

### Cambios en el Frontend (`Productos.jsx`)

```javascript
// ANTES (línea 494)
p_categoria_id: formData.categoria_id,  // ❌ Podía ser ""

// DESPUÉS (línea 497)
p_categoria_id: parseInt(formData.categoria_id),  // ✅ Siempre número

// + Validación agregada:
if (!formData.categoria_id) {
  toast.error('Seleccione una categoría');
  return;
}
```

### Cambios en la Base de Datos

Archivo: `docs/FIX_fn_actualizar_producto_v2.sql`

**Validaciones agregadas:**

1. ✅ Verificar que el producto existe
2. ✅ **Verificar que la categoría existe** (SOLUCIONA EL ERROR)
3. ✅ Verificar que la marca existe y está activa
4. ✅ Verificar que la unidad existe y está activa

```sql
-- AGREGADO:
IF p_categoria_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM categorias WHERE id_categoria = p_categoria_id) THEN
        RAISE EXCEPTION 'La categoría con ID % no existe', p_categoria_id;
    END IF;
END IF;
```

## 📋 Pasos para Aplicar el Fix

### 1. Actualizar Frontend ✅ (Ya aplicado)

El archivo `Productos.jsx` ya fue corregido con las validaciones necesarias.

### 2. Actualizar Base de Datos 🔄 (Pendiente)

**Desde Supabase SQL Editor:**

1. Abre el archivo `docs/FIX_fn_actualizar_producto_v2.sql`
2. Copia **solo** la función `CREATE OR REPLACE FUNCTION public.fn_actualizar_producto_v2(...)`
3. Pega en Supabase SQL Editor
4. Ejecuta el script
5. Verifica que no haya errores

**Líneas a copiar:** Del `CREATE OR REPLACE` hasta el `$function$;` final

### 3. Verificar la Solución ✔️

**Test desde el frontend:**

1. Abre la página de Productos
2. Edita un producto existente
3. Asegúrate de seleccionar una categoría válida
4. Guarda los cambios
5. **Resultado esperado:** ✅ Actualización exitosa sin errores

**Test en Supabase (opcional):**

```sql
-- Debe funcionar:
SELECT fn_actualizar_producto_v2(
    p_id := 'PROD-001',
    p_nombre := 'Test Actualizado',
    p_categoria_id := 'CAT-001',  -- ID válido de categoría
    p_usuario_auditoria := 'USR-001'
);

-- Debe fallar con mensaje claro:
SELECT fn_actualizar_producto_v2(
    p_id := 'PROD-001',
    p_categoria_id := 'CAT-999',  -- ID inexistente
    p_usuario_auditoria := 'USR-001'
);
-- Esperado: ERROR: La categoría con ID CAT-999 no existe
```

## 📊 Comparación Antes/Después

| Aspecto                 | Antes        | Después         |
| ----------------------- | ------------ | --------------- |
| Validación de categoría | ❌ No        | ✅ Sí           |
| Validación de marca     | ❌ No        | ✅ Sí           |
| Validación de unidad    | ❌ No        | ✅ Sí           |
| Mensajes de error       | ❌ Genéricos | ✅ Descriptivos |
| Frontend valida         | ❌ Parcial   | ✅ Completo     |
| Error FK puede ocurrir  | ✅ Sí        | ❌ No           |

## 🚀 Beneficios

✅ **Prevención de errores:** No más violaciones de foreign key  
✅ **Mejor UX:** Mensajes de error claros y tempranos  
✅ **Integridad de datos:** Garantiza que solo se usen IDs válidos  
✅ **Debugging más fácil:** Errores descriptivos en lugar de códigos SQL

## 📝 Notas Importantes

⚠️ **La función anterior (`fn_actualizar_producto_v2`) DEBE ser reemplazada**, no es suficiente con el cambio en el frontend.

⚠️ Si no actualizas la base de datos, el error puede volver a ocurrir si:

- Se manipula el HTML desde DevTools
- Se hace una llamada directa a la API
- Hay datos inconsistentes en otra parte del sistema

✅ **Una vez aplicado el fix completo (frontend + backend)**, el error quedará **completamente resuelto**.

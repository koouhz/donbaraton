# 🔍 Análisis Completo: Sistema de Fechas de Vencimiento

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Funciones de Base de Datos FALTANTES**

#### ❌ `fn_alerta_vencimientos` - NO EXISTE

**Llamada en:**

- `src/pages/AlertasStock.jsx` (línea 28)

```javascript
supabase.rpc("fn_alerta_vencimientos", { p_dias_anticipacion: 30 });
```

**Estado:** ⛔ **FUNCIÓN NO ENCONTRADA EN BASE DE DATOS**

---

#### ❌ `fn_productos_por_vencer` - NO EXISTE

**Llamada en:**

- `src/pages/Dashboard.jsx` (línea 531)

```javascript
supabase.rpc("fn_productos_por_vencer", { p_dias_anticipacion: 30 });
```

**Estado:** ⛔ **FUNCIÓN NO ENCONTRADA EN BASE DE DATOS**

---

### 2. **Campo `fecha_vencimiento` en Tabla `movimientos_inventario`**

**Problema:** El campo existe en el código frontend pero podría no estar en la base de datos o no tener datos.

**Usado en:**

- `src/pages/Inventario.jsx` - Lee fecha_vencimiento de movimientos
- `src/pages/OrdenesCompra.jsx` - Registra fecha_vencimiento al recibir compras
- `src/pages/AjustesInventario.jsx` - Registra fecha_vencimiento en ajustes

---

### 3. **Campo `controla_vencimiento` en Tabla `productos`**

**Usado en:** `src/pages/Productos.jsx`

Este campo indica si un producto requiere control deexpir vencimiento, pero:

- ✅ Existe en el frontend
- ❓ **Desconocido si existe en BD**
- ❌ **No se usa para filtrar productos en alertas**

---

## 📊 ESTADO ACTUAL DEL SISTEMA

| Componente                                 | Estado                       | Funciona?       |
| ------------------------------------------ | ---------------------------- | --------------- |
| **Dashboard - Próximos Vencimientos**      | ❌ Llama función inexistente | ❌ NO           |
| **AlertasStock - Tab Vencimientos**        | ❌ Llama función inexistente | ❌ NO           |
| **OrdenesCompra - Registro fecha venc**    | ✅ Frontend OK               | ⚠️ Parcial      |
| **Inventario - Mostrar fecha venc**        | ✅ Frontend OK               | ⚠️ Parcial      |
| **Ajustes Inventario - Registrar fecha**   | ✅ Frontend OK               | ⚠️ Si existe fn |
| **Productos - Campo controla_vencimiento** | ✅ Frontend OK               | ❓ Desconocido  |

---

## 🛠️ SOLUCIÓN REQUERIDA

### ✅ PASO 1: Crear Función `fn_alerta_vencimientos`

**Propósito:** Obtener productos próximos a vencer para AlertasStock

**Firma:**

```sql
CREATE OR REPLACE FUNCTION public.fn_alerta_vencimientos(
    p_dias_anticipacion INTEGER DEFAULT 30
)
RETURNS TABLE(
    producto VARCHAR,
    lote VARCHAR,
    fecha_vencimiento DATE,
    dias_restantes INTEGER,
    estado_alerta VARCHAR  -- 'ROJO', 'AMARILLO', 'VERDE'
)
```

**Lógica:**

1. Consultar `movimientos_inventario` WHERE `fecha_vencimiento` IS NOT NULL
2. Calcular días restantes hasta vencimiento
3. Filtrar los que vencen dentro de `p_dias_anticipacion` días
4. Clasificar por semáforo:
   - **ROJO**: <= 7 días
   - **AMARILLO**: 8-15 días
   - **VERDE**: 16-30 días

---

### ✅ PASO 2: Crear Función `fn_productos_por_vencer`

**Propósito:** Contador simple para Dashboard

**Firma:**

```sql
CREATE OR REPLACE FUNCTION public.fn_productos_por_vencer(
    p_dias_anticipacion INTEGER DEFAULT 30
)
RETURNS BIGINT
```

**Lógica:**

```sql
SELECT COUNT(DISTINCT id_producto)
FROM movimientos_inventario
WHERE fecha_vencimiento IS NOT NULL
  AND fecha_vencimiento BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_dias_anticipacion)
```

---

### ✅ PASO 3: Verificar/Crear Campo `fecha_vencimiento` en `movimientos_inventario`

**SQL para verificar:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'movimientos_inventario'
  AND column_name = 'fecha_vencimiento';
```

**Si no existe, crear:**

```sql
ALTER TABLE public.movimientos_inventario
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
```

**Crear índice para optimizar consultas:**

```sql
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_vencimiento
ON public.movimientos_inventario(fecha_vencimiento)
WHERE fecha_vencimiento IS NOT NULL;
```

---

### ✅ PASO 4: Verificar Campo `controla_vencimiento` en `productos`

**SQL para verificar:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'productos'
  AND column_name = 'controla_vencimiento';
```

**Si no existe, crear:**

```sql
ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS controla_vencimiento BOOLEAN DEFAULT FALSE;
```

---

## 📁 ARCHIVOS A CREAR

### 1. `fn_alerta_vencimientos.sql`

Función completa para detectar productos próximos a vencer

### 2. `fn_productos_por_vencer.sql`

Función simple contador para el dashboard

### 3. `fix_estructura_vencimientos.sql`

Script para verificar y crear campos faltantes en las tablas

---

## 🎯 IMPACTO DE LA SOLUCIÓN

### Antes (Actual) ❌

- **Dashboard:** Muestra siempre 0 próximos vencimientos (error silencioso)
- **AlertasStock:** Tab "Vencimientos" siempre vacío (error en consola)
- **OrdenesCompra:** Registra fecha pero no se usa
- **No hay alertas** de productos por vencer

### Después (Con Fix) ✅

- **Dashboard:** Muestra contador real de productos por vencer
- **AlertasStock:** Lista completa con semáforo (ROJO/AMARILLO/VERDE)
- **Notificaciones proactivas** de vencimientos próximos
- **Kardex** muestra fechas de vencimiento por lote
- **Control completo** del ciclo de vida del producto

---

## ⚠️ DATOS HISTÓRICOS

**Pregunta crítica:** ¿Ya existen registros con `fecha_vencimiento` en la base de datos?

**Para verificar:**

```sql
SELECT COUNT(*) as total_con_fecha,
       MIN(fecha_vencimiento) as fecha_mas_antigua,
       MAX(fecha_vencimiento) as fecha_mas_reciente
FROM movimientos_inventario
WHERE fecha_vencimiento IS NOT NULL;
```

**Escenarios:**

1. **Si hay datos:** Las funciones funcionarán inmediatamente
2. **Si NO hay datos:** Empezar a registrar desde ahora, datos se acumularán con el tiempo

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. ✅ **PRIMERO:** Verificar estructura de tablas (campos existen?)
2. ✅ **SEGUNDO:** Crear campos faltantes si es necesario
3. ✅ **TERCERO:** Crear `fn_productos_por_vencer` (más simple)
4. ✅ **CUARTO:** Crear `fn_alerta_vencimientos` (más compleja)
5. ✅ **QUINTO:** Probar en Dashboard y AlertasStock
6. ✅ **SEXTO:** Verificar integración con OrdenesCompra y AjustesInventario

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Campo `fecha_vencimiento` existe en `movimientos_inventario`
- [ ] Campo `controla_vencimiento` existe en `productos`
- [ ] Función `fn_productos_por_vencer` creada y funcional
- [ ] Función `fn_alerta_vencimientos` creada y funcional
- [ ] Dashboard muestra contador correcto
- [ ] AlertasStock muestra lista con semáforo
- [ ] OrdenesCompra registra fechas correctamente
- [ ] AjustesInventario registra fechas correctamente
- [ ] Índice de optimización creado

---

**Estado actual:** ⛔ **SISTEMA DE VENCIMIENTOS NO FUNCIONAL**  
**Causa raíz:** Funciones de base de datos faltantes  
**Prioridad:** 🔴 **ALTA** (Afecta Dashboard y AlertasStock)

# Análisis: Caso de Uso PROD-04 - Control de Inventario

## 📋 Especificación del Caso de Uso

| Campo               | Detalle                                        |
| ------------------- | ---------------------------------------------- |
| **ID**              | PROD-04                                        |
| **Nombre**          | Control de inventario                          |
| **Actores**         | Encargado de Almacén                           |
| **Propósito**       | Registrar ingresos, egresos y ajustes de stock |
| **Resumen**         | Mantener el stock real actualizado             |
| **Precondiciones**  | Módulo de Seguridad                            |
| **Postcondiciones** | Módulo de Inventario                           |

### Flujo Principal Esperado:

1. Selecciona tipo movimiento
2. Escanea/busca producto
3. Ingresa cantidad, lote, vencimiento, remito
4. Confirma

---

## ✅ Estado de Implementación: **PARCIALMENTE IMPLEMENTADO**

### 🟢 Funcionalidades Implementadas

#### 1. **Visualización de Inventario** ✅ COMPLETO

- **Archivo**: `src/pages/Inventario.jsx`
- **Funcionalidades**:
  - ✅ Vista general del inventario
  - ✅ Estadísticas de stock (Crítico, Bajo, Normal, Sobrestock)
  - ✅ Filtrado por categoría y estado de stock
  - ✅ Búsqueda de productos
  - ✅ Valor total del inventario
  - ✅ Resumen por categoría

#### 2. **Kardex/Historial de Movimientos** ✅ COMPLETO

- **Archivo**: `src/pages/Inventario.jsx` (líneas 67-105, 388-505)
- **Funcionalidades**:
  - ✅ Ver kardex detallado de cada producto
  - ✅ Historial de movimientos (últimos 20)
- ✅ Información de lotes y vencimientos
- ✅ Documentos asociados (remitos, etc.)
- ✅ Motivos y observaciones

#### 3. **Registro de Movimientos (Indirecto)** ⚠️ PARCIAL

- **Archivo**: `src/pages/MovimientosInventario.jsx`
- **Funcionalidades**:
  - ✅ Visualización de todos los movimientos
  - ✅ Tipos de movimiento reconocidos:
    - ENTRADA
    - SALIDA
    - AJUSTE+ (incremento)
    - AJUSTE- (decremento)
    - VENTA
    - MERMA
    - DAÑO
    - DEVOLUCION_VENTA
    - DEVOLUCION_PROVEEDOR
  - ⚠️ **NO hay interfaz dedicada para CREAR ajustes manuales**

### ❌ Funcionalidades Faltantes

#### ❌ Módulo de Registro de Ajustes de Inventario

**Estado**: **NO IMPLEMENTADO**

El sistema **NO tiene** una página o módulo dedicado para que el Encargado de Almacén pueda:

1. Seleccionar tipo de movimiento (ENTRADA/SALIDA/AJUSTE+/AJUSTE-)
2. Escanear o buscar un producto
3. Ingresar:
   - Cantidad
   - Lote
   - Fecha de vencimiento
   - Número de remito/documento
   - Motivo
4. Confirmar el ajuste

**Evidencia**:

- No existe `AjustesInventario.jsx` ni módulo similar
- La tabla `movimientos_inventario` existe en la BD
- Los tipos de movimiento están definidos (AJUSTE+, AJUSTE-, etc.)
- Pero **NO hay interfaz frontend** para crearlos manualmente

---

## 📊 Nivel de Cumplimiento del Caso de Uso PROD-04

| Aspecto                                             | Estado             | % Cumplimiento |
| --------------------------------------------------- | ------------------ | -------------- |
| **1. Visualización de inventario**                  | ✅ Completo        | 100%           |
| **2. Historial/Kardex**                             | ✅ Completo        | 100%           |
| **3. Seleccionar tipo movimiento**                  | ❌ No implementado | 0%             |
| **4. Buscar/Escanear producto**                     | ❌ No implementado | 0%             |
| **5. Ingresar cantidad, lote, vencimiento, remito** | ❌ No implementado | 0%             |
| **6. Confirmar ajuste**                             | ❌ No implementado | 0%             |
| **TOTAL**                                           | ⚠️ Parcial         | **33%**        |

---

## 🔍 Análisis Detallado

### ¿Cómo se Registran Movimientos Actualmente?

Los movimientos de inventario se registran **AUTOMÁTICAMENTE** cuando:

1. **Se realiza una VENTA** → Se registra movimiento tipo "VENTA" (salida)
2. **Se recibe una COMPRA** → Se registra movimiento tipo "ENTRADA"
3. **Se procesa una DEVOLUCIÓN** → Se registran ajustes

**Pero NO existe forma de registrar**:

- Ajustes manuales por conteo físico
- Ingresos manuales (donaciones, transferencias entre almacenes, etc.)
- Egresos manuales (mermas, daños, robos, etc.)

### Arquitectura Actual

```
┌─────────────────────────────────────────┐
│  CONSULTA (Ya implementado)             │
├─────────────────────────────────────────┤
│  Inventario.jsx                         │
│  - Ver stock actual                     │
│  - Ver kardex por producto              │
│  - Estadísticas                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  MovimientosInventario.jsx              │
│  - Ver todos los movimientos            │
│  - Filtrar por tipo                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  REGISTRO (FALTA IMPLEMENTAR) ❌         │
├─────────────────────────────────────────┤
│  AjustesInventario.jsx (No existe)      │
│  - Seleccionar tipo movimiento          │
│  - Buscar/Escanear producto             │
│  - Ingresar cantidad, lote, etc.        │
│  - Confirmar ajuste                     │
└─────────────────────────────────────────┘
```

---

## 🛠️ Funciones de Base de Datos Disponibles

Aunque NO existe la interfaz, es posible que existan stored procedures para registrar movimientos:

```sql
-- Funciones que podrían existir (necesitan verificación):
fn_registrar_movimiento_inventario()
fn_ajustar_stock()
fn_registrar_entrada()
fn_registrar_salida()
```

**Nota**: No se encontraron estas funciones en el grep realizado, pero pueden estar con nombres diferentes.

---

## ✅ Recomendaciones

### 1. Crear Módulo de Ajustes de Inventario

**Archivo a crear**: `src/pages/AjustesInventario.jsx`

**Funcionalidades requeridas**:

- ✅ Dropdown para seleccionar tipo de movimiento:

  - ENTRADA (ingreso manual)
  - SALIDA (egreso manual)
  - AJUSTE+ (corrección por conteo físico - incremento)
  - AJUSTE- (corrección por conteo físico - decremento)
  - MERMA (pérdida por vencimiento/deterioro)
  - DAÑO (pérdida por daño físico)

- ✅ Campo de búsqueda de producto:

  - Por código de barras (con escaneo)
  - Por código interno
  - Por nombre

- ✅ Formulario de captura:

  - Cantidad (requerido)
  - Lote (opcional, dependiendo del producto)
  - Fecha de vencimiento (si aplica)
  - Número de documento/remito (opcional)
  - Motivo (requerido para ajustes)
  - Observaciones (opcional)

- ✅ Confirmación y registro

### 2. Crear/Verificar Stored Procedure

**Función requerida**: `fn_registrar_movimiento_inventario()`

**Parámetros**:

```sql
p_id_producto VARCHAR,
p_tipo VARCHAR, -- ENTRADA, SALIDA, AJUSTE+, AJUSTE-, MERMA, etc.
p_cantidad INTEGER,
p_lote VARCHAR DEFAULT NULL,
p_fecha_vencimiento DATE DEFAULT NULL,
p_documento VARCHAR DEFAULT NULL,
p_motivo TEXT DEFAULT NULL,
p_observaciones TEXT DEFAULT NULL,
p_usuario_auditoria VARCHAR
```

**Funcionalidad**:

1. Validar que el producto existe
2. Para SALIDA/AJUSTE-/MERMA: Validar stock suficiente
3. Actualizar `productos.stock_actual`
4. Insertar registro en `movimientos_inventario`
5. Registrar auditoría

### 3. Agregar Ruta en App.jsx

```javascript
<Route
  path="ajustes-inventario"
  element={
    <Protected>
      <AjustesInventario />
    </Protected>
  }
/>
```

### 4. Agregar Enlace en el Menú

En `Layout.jsx` o el componente de menú correspondiente, agregar enlace a "/ajustes-inventario"

---

## 🎯 Conclusión

**El caso de uso PROD-04 está PARCIALMENTE implementado (33%)**:

✅ **Lo que SÍ está**:

- Visualización completa del inventario
- Kardex detallado por producto
- Historial de todos los movimientos
- Cálculo automático de estados de stock

❌ **Lo que FALTA**:

- **Interfaz para registrar ajustes manuales de inventario**
- Funcionalidad para ingresar movimientos con lote, vencimiento y remito
- Proceso completo del flujo principal descrito en el caso de uso

**Para cumplir al 100% con PROD-04, se debe implementar el módulo de registro de ajustes de inventario (`AjustesInventario.jsx`)** siguiendo las recomendaciones anteriores.

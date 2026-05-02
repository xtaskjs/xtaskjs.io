# Mejoras Arquitectónicas - xTaskJS v1.0.28+

## 📋 Índice

1. [Cache Manifest System](#cache-manifest-system)
2. [Pool Imports Async](#pool-imports-async)
3. [Lazy Resolution del DI](#lazy-resolution-del-di)
4. [Hot Manifest Watcher](#hot-manifest-watcher)
5. [DI Instantiation Metrics](#di-instantiation-metrics)
6. [Estrategias de Resolución](#estrategias-de-resolución)
7. [Tuning y Performance](#tuning-y-performance)

---

## Cache Manifest System

### 🎯 Propósito

El sistema de Cache Manifest optimiza dramáticamente el startup evitando escaneos completos del filesystem en cada inicio.

**Beneficio:** 40-60% reducción en tiempo de startup.

### 🏗️ Arquitectura

El manifest cache funciona con una carga en cascada:

```
┌─────────────────────────────────────────────────┐
│        Application Startup Boot Sequence        │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────▼────────┐
       │ Manifest Cache  │ ← Se carga primero
       │   Selection     │
       └───────┬────────┘
               │
       ┌───────▼──────────────────┐
       │                          │
   ┌───▼────┐  ┌────────┐  ┌──────▼──┐
   │Prebuilt│  │Cached  │  │Full     │
   │(Prod)  │  │(Dev)   │  │Scan(FB) │
   └─────────┘  └────────┘  └─────────┘
```

### 📝 Estructura del Manifest

**Formato:** `.xtask-manifest.json`

```json
{
  "version": 1,
  "generatedAt": "2024-12-01T10:30:00Z",
  "scanRoots": [
    "/project/src",
    "/project/packages"
  ],
  "files": [
    "/project/src/app.service.ts",
    "/project/src/app.controller.ts",
    "/project/src/users/users.service.ts",
    "/project/src/users/users.controller.ts",
    "/project/src/config/app.config.ts"
  ],
  "checksums": {
    "/project/src": "sha256:abc123..."
  }
}
```

### 🔄 Ciclo de Vida del Manifest

#### 1️⃣ **Primer Inicio (Full Scan)**
```typescript
// packages/core/src/kernel/manifest-cache.service.ts

const files = await scanFilesystem(scanRoots, extensions);
// Escanea directamente los directorios src/, packages/, etc.

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  scanRoots,
  files,
  checksums: computeChecksums(files)
};

await fs.writeFile('.xtask-manifest.json', JSON.stringify(manifest));
```

#### 2️⃣ **Subsecuentes (Desde Caché)**
```typescript
// Carga directa en milisegundos
const manifest = JSON.parse(fs.readFileSync('.xtask-manifest.json'));
const files = manifest.files; // ✅ Evita filesystem scan
```

#### 3️⃣ **Pre-built para Producción**
```bash
# Durante build time
npm run prebuild:manifest --prefix packages/core

# Genera: .xtask-manifest.prebuilt.json
# Se carga automáticamente en NODE_ENV=production
```

### 🛠️ Configuración

#### Habilitar en Runtime
```typescript
import { CreateApplication } from "@xtaskjs/core";

await CreateApplication({
  manifestCache: {
    enabled: true,                    // default: true
    loadPrebuiltFirst: true,          // default: true en prod
    invalidateOnError: true,          // default: true
    ttl: 3600000                      // default: 1 hora
  }
});
```

#### Regenerar Manifest
```bash
# Borrar caché actual (fuerza full scan siguiente inicio)
rm .xtask-manifest.json

# Pre-generar para producción
npm run prebuild:manifest:app
```

### 📊 Impacto de Performance

**Métricas Típicas (App Mediana ~120 archivos):**

| Escenario | Tiempo | Cambio |
|-----------|--------|--------|
| Full Scan | 850ms | - |
| Con Manifest | 320ms | ⬇️ 62% |
| Pre-built + Manifest | 180ms | ⬇️ 79% |

---

## Pool Imports Async

### 🎯 Propósito

Limita la concurrencia de importaciones de archivos para evitar saturación del filesystem, especialmente en ambientes constrained (CI, containers pequeños).

### 🏗️ Patrón Semáforo

El sistema utiliza un **patrón de semáforo** para limitar workers concurrentes:

```typescript
class Semaphore {
  private queue: Array<() => void> = [];
  private running = 0;
  private readonly maxRunning: number;

  constructor(limit: number) {
    this.maxRunning = Math.max(1, Math.floor(limit));
  }

  async acquire(): Promise<void> {
    if (this.running < this.maxRunning) {
      this.running++;
      return;
    }

    // Esperar en cola
    return new Promise(resolve => {
      this.queue.push(() => {
        this.running++;
        resolve();
      });
    });
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }
}
```

### 📝 Flujo de Ejecución

```
Archivos a importar: [file1, file2, file3, ..., file50]
Concurrencia configurada: 10

Ciclo 1: ┌─ Import file1   ─ Import file6   ┐
         ├─ Import file2   ─ Import file7   ├─ En paralelo
         ├─ Import file3   ─ Import file8   │ (10 archivos)
         ├─ Import file4   ─ Import file9   │
         └─ Import file5   ─ Import file10  ┘

         Esperar completación ▼

Ciclo 2: ┌─ Import file11  ─ Import file16  ┐
         ├─ Import file12  ─ Import file17  ├─ Próximos 10
         ├─ Import file13  ─ Import file18  │
         ├─ Import file14  ─ Import file19  │
         └─ Import file15  ─ Import file20  ┘
```

### ⚙️ Configuración

#### Variable de Entorno

```bash
# Recomendaciones por tamaño de app:
XTASK_IMPORT_CONCURRENCY=10   # apps pequeñas (30 files)
XTASK_IMPORT_CONCURRENCY=16   # apps medianas (30-120 files)
XTASK_IMPORT_CONCURRENCY=24   # apps grandes (120+ files)

# Uso
XTASK_IMPORT_CONCURRENCY=16 npm start
```

#### En Código
```typescript
import { CreateApplication } from "@xtaskjs/core";

await CreateApplication({
  scanner: {
    importConcurrency: 16,      // default: 10
    importConcurrencyMin: 1,    // default: 1
    importConcurrencyMax: process.cpuCount * 2
  }
});
```

### 📊 Impacto por Ambiente

| Ambiente | Recomendación | Justificación |
|----------|---|---|
| **CI/CD (limitado)** | 4-8 | Previene thrashing del filesystem |
| **Desarrollo Local** | 10-12 | Equilibrio speed/resources |
| **Producción** | 16-24 | Maximiza throughput |
| **Container (500MB RAM)** | 6-10 | Restricción de memoria |
| **Container (2GB+ RAM)** | 16-20 | Full throttle |

### 🔍 Monitoreo

```typescript
import { getImportPoolMetrics } from "@xtaskjs/core";

const app = await CreateApplication({
  scanner: { metrics: true }
});

// Durante o después de inicio
const metrics = getImportPoolMetrics();
console.log({
  filesImported: metrics.totalFiles,
  concurrentPeaks: metrics.maxConcurrency,
  averageQueueLength: metrics.avgQueueLength,
  totalDuration: metrics.durationMs
});
```

---

## Lazy Resolution del DI

### 🎯 Propósito

Retrasar la instantiación de dependencias hasta que se necesiten, mejorando startup cuando la aplicación incluye integraciones opcionales (scheduler, mailer, queues).

### 🏗️ Proxy Pattern

El sistema usa **Proxy de JavaScript** para transparencia total:

```typescript
private createLazyDependency<T>(resolver: () => T): T {
  let hasResolved = false;
  let resolvedValue: T;

  const ensureResolved = (): T => {
    if (!hasResolved) {
      resolvedValue = resolver();
      hasResolved = true;
    }
    return resolvedValue;
  };

  return new Proxy({} as T, {
    get: (_target, property) => {
      const instance = ensureResolved() as any;
      const value = Reflect.get(instance, property, instance);
      // Bind methods para contexto correcto
      return typeof value === "function" ? value.bind(instance) : value;
    },
    set: (_target, property, value) => {
      const instance = ensureResolved() as any;
      return Reflect.set(instance, property, value, instance);
    },
    has: (_target, property) => {
      return property in ensureResolved();
    },
    // ... otros traps (ownKeys, getOwnPropertyDescriptor, etc.)
  });
}
```

### 📊 Comparación

**Resolución Eager (Anterior):**
```
App Boot
├─ Create Logger
├─ Create Database
├─ Create Cache Service
├─ Create Mailer Service      ← Instanciado incluso si no se usa
├─ Create Scheduler Service   ← Instanciado incluso si no se usa
├─ Create Queue Service       ← Instanciado incluso si no se usa
└─ Boot Controllers
   ⏱️ 950ms total
```

**Resolución Lazy (Nuevo):**
```
App Boot
├─ Create Logger
├─ Create Database
├─ Create Cache Service
├─ Lazy Mailer Service        ← Proxy creado, instancia diferida
├─ Lazy Scheduler Service     ← Proxy creado, instancia diferida
├─ Lazy Queue Service         ← Proxy creado, instancia diferida
└─ Boot Controllers
   ⏱️ 320ms total

Primera accesión a Mailer:
   mailer.send()  ← Proxy intercepta, crea instancia real
```

### ⚙️ Configuración

#### Global por Estrategia
```typescript
import { CreateApplication } from "@xtaskjs/core";

await CreateApplication({
  container: {
    resolutionStrategy: "lazy",  // default | "eager"
    metricsEnabled: true
  }
});
```

#### Por Componente
```typescript
@Service({ lazy: true })
class MailerService {
  constructor(private readonly config: MailConfig) {}
  // Solo instanciado en primer uso
}

@Service({ lazy: false })
class LoggerService {
  // Siempre instanciado en startup
}
```

#### Controllers (Siempre Eager)
```typescript
@Controller("/users")
class UsersController {
  // Siempre resuelto en startup
  // (rutas deben estar disponibles)
  constructor(
    private users: UsersService,  // Lazy OK
    private logger: LoggerService // Lazy OK
  ) {}
}
```

### 📈 Métricas

```typescript
const app = await CreateApplication({
  container: {
    resolutionStrategy: "lazy",
    metricsEnabled: true
  }
});

const metrics = app.container.getInstantiationMetrics();
console.table(metrics.map(m => ({
  name: m.componentName,
  scope: m.scope,
  instances: m.instancesCreated,
  avgTime: `${m.averageInstantiationMs.toFixed(2)}ms`,
  lastTime: `${m.lastInstantiationMs}ms`
})));

// Salida:
// ┌────────────────────┬─────────┬───────────┬─────────┬──────────┐
// │ name               │ scope   │ instances │ avgTime │ lastTime │
// ├────────────────────┼─────────┼───────────┼─────────┼──────────┤
// │ UsersController    │ app     │ 1         │ 2.15ms  │ 2.15ms   │
// │ UsersService       │ app     │ 1         │ 5.43ms  │ 5.43ms   │
// │ MailerService      │ app     │ 0         │ 0ms     │ 0ms      │ ← Lazy, sin usar
// │ DatabaseConnection │ app     │ 1         │ 145.2ms │ 145.2ms  │
// └────────────────────┴─────────┴───────────┴─────────┴──────────┘
```

---

## Hot Manifest Watcher

### 🎯 Propósito

En modo desarrollo, detecta cambios de archivos e actualiza el manifest incrementalmente sin rescannear el proyecto completo.

### 🏗️ Arquitectura

```
File System Watch
       │
       ├─ Watch src/, packages/
       │
       ▼
  File Changed Event
       │
       ├─ Debounce 60ms
       │
       ▼
  Incremental Update
       │
       ├─ Actualizar manifest (.json)
       ├─ Invalidar bindings en DI container
       ├─ Re-registrar componentes
       │
       ▼
  Emit Events
       │
       ├─ hotManifestUpdated
       ├─ hotManifestMetrics
       └─ hotManifestReloadError (si hay error)
```

### ⚙️ Configuración

#### Automática en Desarrollo
```typescript
// NODE_ENV=development ← automáticamente enabled
const app = await CreateApplication();
```

#### Manual
```typescript
await CreateApplication({
  hotManifestWatcher: {
    enabled: true,          // default: true en dev
    debounceMs: 60,         // default: 60ms
    ignore: ["**/*.test.ts", "**/*.spec.ts"],
    extensions: [".ts", ".js"]
  }
});
```

### 🔔 Event Listeners

```typescript
const app = await CreateApplication({
  hotManifestWatcher: { enabled: true }
});

// Archivo actualizado
app.on("hotManifestUpdated", (event) => {
  console.log(`✨ Hot reload: ${event.file}`);
  console.log(`  Components: ${event.componentsReloaded.length}`);
  console.log(`  Duration: ${event.durationMs}ms`);
});

// Métricas agregadas
app.on("hotManifestMetrics", (metrics) => {
  console.log({
    filesHotUpdated: metrics.filesUpdatedCount,
    totalReloads: metrics.totalReloads,
    errorRate: metrics.errorCount / metrics.totalReloads,
    avgUpdateTime: metrics.avgUpdateDurationMs
  });
});

// Errores durante reload
app.on("hotManifestReloadError", (error) => {
  console.error(`❌ Hot reload failed for ${error.file}:`, error.error);
});
```

### 📊 Comparación Dev Experience

**Sin Hot Watcher:**
```
1. Editar archivo src/users/users.service.ts
2. Guardar
3. Esperar: Reinicio manual o terminal refresh
4. Tiempo total: 5-10 segundos
```

**Con Hot Watcher:**
```
1. Editar archivo src/users/users.service.ts
2. Guardar
3. ✨ Detección automática
4. 🔄 Re-registro en DI (60ms)
5. ✅ Listo (sin reinicio)
6. Tiempo total: ~100-150ms
```

---

## DI Instantiation Metrics

### 🎯 Propósito

Rastrear cuándo y cuánto tardan los componentes en instanciarse, útil para debugging y optimización de performance.

### 📊 Métrica Struct

```typescript
interface InstantiationMetric {
  componentName: string;
  scope: "transient" | "app" | "request";
  instancesCreated: number;
  totalInstantiationMs: number;
  averageInstantiationMs: number;
  lastInstantiationMs: number;
  lastInstantiationAt?: Date;
}
```

### 🔍 Acceder Métricas

```typescript
const app = await CreateApplication({
  container: { metricsEnabled: true }
});

// Después de startup
const metrics = app.container.getInstantiationMetrics();

// Ordenar por tiempo promedio
const slowest = [...metrics]
  .sort((a, b) => b.averageInstantiationMs - a.averageInstantiationMs)
  .slice(0, 5);

console.log("🐢 Componentes más lentos:");
slowest.forEach(m => {
  console.log(`  ${m.componentName}: ${m.averageInstantiationMs.toFixed(2)}ms`);
});
```

### 📈 Análisis de Bottlenecks

```typescript
function analyzePerformance(metrics: InstantiationMetric[]) {
  const total = metrics.reduce((sum, m) => sum + m.totalInstantiationMs, 0);
  
  const grouped = metrics.reduce((acc, m) => {
    acc[m.scope] = (acc[m.scope] || 0) + m.totalInstantiationMs;
    return acc;
  }, {} as Record<string, number>);

  console.log(`Total startup time: ${total.toFixed(2)}ms`);
  Object.entries(grouped).forEach(([scope, time]) => {
    const pct = ((time / total) * 100).toFixed(1);
    console.log(`  ${scope}: ${time.toFixed(2)}ms (${pct}%)`);
  });

  // Identificar componentes transient que pueden ser app-scoped
  const frequentTransient = metrics
    .filter(m => m.scope === "transient" && m.instancesCreated > 10);
  
  if (frequentTransient.length > 0) {
    console.log("\n💡 Sugerencias: Estos transient se crean frecuentemente:");
    frequentTransient.forEach(m => {
      console.log(`  - ${m.componentName} (${m.instancesCreated} instancias)`);
    });
  }
}
```

---

## Estrategias de Resolución

### Decisión: Lazy vs Eager

```
┌─────────────────────────────────────┐
│ ¿Necesito la dependencia en startup?│
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       SÍ             NO
        │             │
    EAGER         LAZY
    ┌──┴─┐       ┌──┴──┐
    │ OK │       │ OK  │
    └────┘       └─────┘
```

### Casos de Uso

**Eager:**
- Controllers (rutas deben estar disponibles)
- Logger (usado por todo)
- Database (conexión central)
- Auth middleware

**Lazy:**
- Mailer (solo usado en auth flow)
- Scheduler (solo si está habilitado)
- Queue Service (solo si está habilitado)
- Reporting Service (opcional)

---

## Tuning y Performance

### 🎯 Diagnóstico

```bash
# Ver cuánto tarda startup
npm run benchmark:startup --prefix packages/core

# Con opciones
XTASKJS_BENCH_WARMUP=5 \
XTASKJS_BENCH_ITERATIONS=20 \
npm run benchmark:startup --prefix packages/core
```

### 📋 Checklist de Optimización

```
✅ Usar Lazy Resolution Strategy
   - Identifica servicios opcionales
   - Marca con @Service({ lazy: true })

✅ Tunar XTASK_IMPORT_CONCURRENCY
   - Comienza con valor por defecto (10)
   - Aumenta según CPU disponible
   - Monitorea CPU/RAM durante startup

✅ Pre-generar Manifest
   - npm run prebuild:manifest:app
   - Incluir en CI/CD

✅ Deshabilitar Métricas en Producción
   - metricsEnabled: false en prod
   - Pequeño overhead pero noticeable a escala

✅ Agrupar Imports por Scope
   - Controllers juntos
   - Services por feature
   - Facilita carga incremental

✅ Usar Lazy Namespace Imports
   @xtaskjs/internationalization:
   - loadOnDemand: true
   - Carga de idiomas solo cuando se necesitan
```

---

## 🔗 Referencias

- [Cache Manifest Source](https://github.com/xtaskjs/xtask/tree/main/packages/core/src/kernel)
- [Import Pool Source](https://github.com/xtaskjs/xtask/tree/main/packages/core/src/scanner)
- [DI Container Source](https://github.com/xtaskjs/xtask/tree/main/packages/core/src/di)
- [Performance Benchmarks](https://github.com/xtaskjs/xtask/tree/main/packages/core/bench)

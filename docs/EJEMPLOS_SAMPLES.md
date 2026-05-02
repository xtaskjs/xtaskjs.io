# Ejemplos y Samples - xTaskJS v1.0.28+

## 📚 Guía de Ejemplos Disponibles

xTaskJS incluye 24 samples progresivos que demuestran diferentes características y patrones. Esta guía te ayuda a encontrar el ejemplo correcto para tu caso de uso.

---

## 🗺️ Mapa de Samples

```
├── 01. new_app                          ← Comenzar aquí (minimal)
├── 02. express_app                      ← Express adapter
├── 03. fastify_app                      ← Fastify adapter
├── 04. typeorm_app                      ← Base de datos
├── 06. security_app                     ← Autenticación/Autorización
├── 07. security_express_app             ← Security + Express
├── 08. email_express_app                ← Mailer + templates
├── 09. internationalization_app         ← i18n (i18n)
├── 10. internationalization_express_app ← i18n + Express
├── 11. scheduler_app                    ← Cron, schedules
├── 12. cache_app                        ← Cache en memoria
├── 13. cache_redis_app                  ← Cache Redis
├── 14. http_cache_web_app               ← HTTP cache headers
├── 15. fastify_http_cache_web_app       ← HTTP cache + Fastify
├── 16. queues_memory_app                ← Queues (memoria)
├── 17. queues_rabbitmq_app              ← Queues (RabbitMQ)
├── 18. value_objects_app                ← Value objects
├── 19. cqrs_app                         ← CQRS pattern
├── 20. cqrs_postgres_replication_app    ← CQRS + replicación DB
├── 21. event_source_rabbitmq_app        ← Event sourcing
├── 22. event_source_cqrs_app            ← Event-source + CQRS
├── 23. socket_io_express_app            ← Real-time (Socket.IO)
└── 24. throttler_app                    ← Rate limiting
```

---

## 🎯 Samples por Categoría

### 🔴 **COMENZAR AQUÍ**

#### 01. new_app
**Propósito:** Aplicación mínima de xTaskJS sin dependencias externas.

**Stack:**
- `@xtaskjs/core`
- Node HTTP (no Express/Fastify)
- Decoradores básicos

**Aprender:**
- Estructura básica de proyecto
- Creación de controllers
- Bootstrap de aplicación

**Ruta:** `samples/01-new_app/`

```bash
cd samples/01-new_app && npm install && npm start
# Abre http://localhost:3000
```

---

### 🌐 **HTTP ADAPTERS**

#### 02. express_app
**Propósito:** Integración con Express, assets estáticos, vistas.

**Stack:**
- `@xtaskjs/express-http`
- Express
- Templates HTML

**Aprender:**
- Adapter pattern
- Servir archivos estáticos
- Vistas (handlebars)

**Mejorías sobre 01:**
- Express middleware
- Static file serving
- HTML templating

```bash
cd samples/02-express_app && npm start
```

---

#### 03. fastify_app
**Propósito:** Integración con Fastify (alternativa a Express).

**Stack:**
- `@xtaskjs/fastify-http`
- Fastify
- Templates

**Aprender:**
- Usar Fastify en lugar de Express
- Rendimiento más alto
- API similar a Express

**Comparación con Express:**
- Más rápido (~2x)
- Validación built-in
- Ecosystem más pequeño

```bash
cd samples/03-fastify_app && npm start
```

---

### 🗄️ **BASE DE DATOS & ORM**

#### 04. typeorm_app
**Propósito:** Integración TypeORM para persistencia.

**Stack:**
- `@xtaskjs/typeorm`
- TypeORM
- SQLite (o PostgreSQL)
- Entities y repositories

**Aprender:**
- Entidades TypeORM
- Decoradores de xtaskjs + TypeORM
- Repositories
- Queries

**Ejemplo Clave:**
```typescript
@Entity("users")
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}

@Service()
class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>
  ) {}

  async create(email: string) {
    return this.repo.save({ email });
  }
}
```

```bash
cd samples/04-typeorm_app && npm start
```

---

### 🔐 **SEGURIDAD & AUTENTICACIÓN**

#### 06. security_app
**Propósito:** Autenticación y autorización sin Express (node-http).

**Stack:**
- `@xtaskjs/security`
- JWT
- Passport.js
- Roles y permisos

**Aprender:**
- Decoradores de autenticación
- Roles y Guards
- JWT tokens
- Estrategias de auth

**Decoradores:**
```typescript
@Authenticated()
@Get("/users")
listUsers() { }

@Roles("admin")
@Post("/users")
createUser() { }

@Permissions("user.create", "user.read")
@Get("/admin/reports")
viewReports() { }
```

```bash
cd samples/06-security_app && npm start
```

---

#### 07. security_express_app
**Propósito:** Seguridad con Express (combina 02 + 06).

**Stack:**
- `@xtaskjs/security`
- `@xtaskjs/express-http`
- Autenticación
- Vistas protegidas

**Aprender:**
- Auth en aplicaciones web tradicionales
- Sesiones y cookies
- Protección CSRF

```bash
cd samples/07-security_express_app && npm start
# Accede a http://localhost:3000/admin/login
```

---

### 📧 **EMAIL & TEMPLATES**

#### 08. email_express_app
**Propósito:** Envío de emails con templates Handlebars.

**Stack:**
- `@xtaskjs/mailer`
- Express
- Handlebars para templates
- Nodemailer

**Aprender:**
- Mailer service decorators
- Templates de email
- Transportes (SMTP, JSON, Mailtrap)
- Envío asincrónico

**Estructura:**
```
views/mail/
├── auth-email-verification.html.hbs
├── auth-email-verification.subject.hbs
├── auth-email-verification.text.hbs
└── password-reset.html.hbs

@MailerService()
class AuthMailer {
  @MailerTemplate("auth-email-verification")
  async sendVerification(user: User) { }
}
```

```bash
cd samples/08-email_express_app && npm start
# Envía emails a archivo (default MAIL_TRANSPORT_PROVIDER=json)
```

---

### 🌍 **INTERNACIONALIZACIÓN (i18n)**

#### 09. internationalization_app
**Propósito:** Multi-idioma con i18n integrado (node-http).

**Stack:**
- `@xtaskjs/internationalization`
- Locales dinámicos
- Lazy namespace loading
- Formatters customizados

**Aprender:**
- Registrar idiomas
- Cambiar locale por request
- Lazy loading de traducciones
- Formatters de números/fechas

**Decoradores:**
```typescript
@Get("/")
@UseLocale("es") // o detectar de header
listItems(@Locale() locale: string) {
  return { locale };
}

// En templates
{{ t 'items.title' locale }}
```

```bash
cd samples/09-internationalization_app && npm start
```

---

#### 10. internationalization_express_app
**Propósito:** i18n con Express y vistas HTML.

**Stack:**
- `@xtaskjs/internationalization`
- `@xtaskjs/express-http`
- Cookies de idioma
- Locale switcher en UI

**Aprender:**
- Persistencia de locale (cookies)
- Vistas multiidioma
- Selector de idioma en frontend

```bash
cd samples/10-internationalization_express_app && npm start
```

---

### ⏰ **SCHEDULING**

#### 11. scheduler_app
**Propósito:** Tareas programadas con cron e intervalos.

**Stack:**
- `@xtaskjs/scheduler`
- Cron expressions
- Named groups
- Boot jobs

**Aprender:**
- Decoradores @Cron, @Every, @Timeout
- Ejecutar en boot
- Grouped task management
- Error handling y retries

**Ejemplo:**
```typescript
@Service()
class ReportsScheduler {
  @Cron("0 */5 * * * *", { name: "reports.flush" })
  async flushReports() { }

  @Every("10m", { name: "reports.compact" })
  compactCache() { }

  @Timeout("30s", { name: "reports.warmup", runOnBoot: true })
  warmup() { }
}
```

**Endpoints de Inspección:**
- GET `/scheduler/jobs` - Listar tareas
- POST `/scheduler/jobs/:name/run` - Ejecutar tarea
- GET `/scheduler/jobs/:group` - Tareas por grupo

```bash
cd samples/11-scheduler_app && npm start
# Abre http://localhost:3000/scheduler para inspeccionar
```

---

### 💾 **CACHING**

#### 12. cache_app
**Propósito:** Caching en memoria.

**Stack:**
- `@xtaskjs/cache`
- Memory backend
- Cache decorators
- TTL configuration

**Aprender:**
- @Cacheable, @CachePut, @CacheEvict
- Cache models
- TTL (Time To Live)
- Cache invalidation

**Ejemplo:**
```typescript
@CacheModel({ name: "products", ttl: "5m" })
export class ProductCacheModel {}

@Service()
class ProductService {
  @Cacheable({ model: ProductCacheModel, key: (id: string) => id })
  async getProduct(id: string) {
    // Cache por 5 minutos
  }

  @CacheEvict({ model: ProductCacheModel, key: (id: string) => id })
  async updateProduct(id: string, data: any) {
    // Invalida cache
  }
}
```

```bash
cd samples/12-cache_app && npm start
```

---

#### 13. cache_redis_app
**Propósito:** Caching distribuido con Redis.

**Stack:**
- `@xtaskjs/cache`
- Redis backend
- Distributed cache
- Cache warming

**Aprender:**
- Configurar Redis
- Caching distribuido
- Serialización
- Cache layers

**Configuración:**
```typescript
configureCache({
  defaultDriver: "redis",
  redis: {
    url: process.env.REDIS_URL
  }
});
```

**Requisito:**
```bash
# Iniciar Redis
docker run -d -p 6379:6379 redis:alpine
```

```bash
cd samples/13-cache_redis_app && npm start
```

---

#### 14. http_cache_web_app
**Propósito:** HTTP caching headers y browser cache.

**Stack:**
- `@xtaskjs/cache`
- HTTP headers (ETag, Cache-Control, Vary)
- Browser caching

**Aprender:**
- HTTP caching headers
- ETag generation
- Cache-Control directives
- Conditional requests

**Ejemplo:**
```typescript
configureCache({
  httpCacheDefaults: {
    visibility: "public",
    maxAge: 300,
    etag: true,
    vary: ["accept-language"]
  }
});

@Cacheable({ 
  model: ProductCacheModel,
  httpCache: {
    maxAge: 3600,
    vary: ["user-agent"]
  }
})
async getProduct(id: string) { }
```

```bash
cd samples/14-http_cache_web_app && npm start
# Abre DevTools > Network para ver headers de cache
```

---

#### 15. fastify_http_cache_web_app
**Propósito:** HTTP caching con Fastify (como 14 pero con Fastify).

```bash
cd samples/15-fastify_http_cache_web_app && npm start
```

---

### 📨 **QUEUES & MESSAGING**

#### 16. queues_memory_app
**Propósito:** Colas en memoria (testing y desarrollo).

**Stack:**
- `@xtaskjs/queues`
- In-memory transport
- Queue handlers
- Pattern matching

**Aprender:**
- Decoradores @QueueHandler, @QueuePattern
- Publicadores de eventos
- Queue groups
- Error handling

**Ejemplo:**
```typescript
@Service()
class EmailConsumer {
  @QueueHandler("email.send", {
    name: "email.sender",
    group: ["email"]
  })
  async onEmailSend(payload: { to: string; subject: string }) {
    // Procesar email
  }
}

@Service()
class UserService {
  constructor(@InjectQueue() private queue: QueueService) {}

  async register(email: string) {
    await this.queue.publish("email.send", {
      to: email,
      subject: "Bienvenido"
    });
  }
}
```

```bash
cd samples/16-queues_memory_app && npm start
```

---

#### 17. queues_rabbitmq_app
**Propósito:** Colas con RabbitMQ (producción).

**Stack:**
- `@xtaskjs/queues`
- RabbitMQ transport
- Topic bindings
- Dead-letter queues
- Competing consumers

**Aprender:**
- RabbitMQ exchanges y bindings
- Topic patterns
- Dead-letter routing
- Retries

**Requisito:**
```bash
# RabbitMQ en Docker
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management-alpine
# Accede a http://localhost:15672 (guest/guest)
```

```bash
cd samples/17-queues_rabbitmq_app && npm start
```

---

### 💎 **VALUE OBJECTS**

#### 18. value_objects_app
**Propósito:** Value objects para domain-driven design.

**Stack:**
- `@xtaskjs/value-objects`
- Primitivos reutilizables
- Converters
- DTO hydration

**Aprender:**
- Crear value objects
- Transformers
- Validación de value objects
- DI factories

**Ejemplo:**
```typescript
@ValueObject()
class Email extends StringPrimitive {
  validate(value: string) {
    if (!value.includes("@")) throw new Error("Invalid email");
  }
}

@ValueObject()
class UserId extends NumericPrimitive {}

class User {
  constructor(
    public id: UserId,
    public email: Email
  ) {}
}
```

```bash
cd samples/18-value_objects_app && npm start
```

---

### 🏗️ **ARQUITECTURAS AVANZADAS**

#### 19. cqrs_app
**Propósito:** CQRS (Command Query Responsibility Segregation).

**Stack:**
- `@xtaskjs/cqrs`
- `@xtaskjs/typeorm`
- Separación read/write
- SQLite (read/write en DBs separadas)

**Aprender:**
- Command handlers
- Query handlers
- Event buses
- Read model updates

**Estructura:**
```
src/
├── commands/
│   ├── create-user.command.ts
│   └── create-user.handler.ts
├── queries/
│   ├── list-users.query.ts
│   └── list-users.handler.ts
└── events/
    ├── user-created.event.ts
    └── user-created.handler.ts
```

**Ejemplo:**
```typescript
class CreateUserCommand {
  constructor(public name: string, public email: string) {}
}

@CommandHandler(CreateUserCommand)
class CreateUserHandler {
  async execute(cmd: CreateUserCommand) {
    const user = await this.writeRepo.save(cmd);
    await this.eventBus.publish(new UserCreatedEvent(user.id));
  }
}

class ListUsersQuery {}

@QueryHandler(ListUsersQuery)
class ListUsersHandler {
  async execute() {
    return this.readRepo.find(); // ← Read DB separado
  }
}
```

```bash
cd samples/19-cqrs_app && npm start
```

---

#### 20. cqrs_postgres_replication_app
**Propósito:** CQRS con replicación PostgreSQL (master/slave).

**Stack:**
- `@xtaskjs/cqrs`
- `@xtaskjs/typeorm`
- PostgreSQL master/slave
- Docker Compose

**Aprender:**
- Replicación de base de datos
- Escrituras en master
- Lecturas en replica
- Consistencia eventual

**Docker Compose:**
```yaml
services:
  postgres-master:
    image: postgres:15
    environment:
      POSTGRES_REPLICATION_MODE: master
  
  postgres-slave:
    image: postgres:15
    environment:
      POSTGRES_REPLICATION_MODE: slave
```

```bash
cd samples/20-cqrs_postgres_replication_app
docker-compose up -d
npm start
```

---

#### 21. event_source_rabbitmq_app
**Propósito:** Event sourcing con RabbitMQ.

**Stack:**
- `@xtaskjs/event-source`
- `@xtaskjs/typeorm`
- RabbitMQ
- Event store

**Aprender:**
- Event-sourced aggregates
- Event store persistence
- Event replay
- Projection updates

**Estructura:**
```
Domain Events:
UserRegisteredEvent
UserEmailVerifiedEvent
UserDeletedEvent
  ↓
Stored in Event Store (TypeORM)
  ↓
Published to RabbitMQ
  ↓
Subscribers (Projections)
build read models
```

```bash
cd samples/21-event_source_rabbitmq_app && npm start
```

---

#### 22. event_source_cqrs_app
**Propósito:** Interoperabilidad Event-Source + CQRS.

**Stack:**
- `@xtaskjs/event-source`
- `@xtaskjs/cqrs`
- Escrituras por event-source
- Lecturas por CQRS

**Aprender:**
- Arquitecturas híbridas
- Event-source como source of truth
- CQRS para read models
- Eventual consistency

```
Command → Event-Sourced Aggregate
              ↓
           Emit Events
              ↓
         Event Store (Write)
              ↓
      Event Subscribers (CQRS)
              ↓
        Update Read Models
```

```bash
cd samples/22-event_source_cqrs_app && npm start
```

---

#### 23. socket_io_express_app
**Propósito:** Real-time con Socket.IO y Express.

**Stack:**
- `@xtaskjs/socket-io`
- `@xtaskjs/express-http`
- Socket.IO gateways
- Broadcasting

**Aprender:**
- Decoradores @SocketGateway, @OnSocketEvent
- Namespaces y rooms
- Broadcasting
- Client/server sync

**Ejemplo:**
```typescript
@SocketGateway({ namespace: "/chat" })
class ChatGateway {
  @OnSocketConnection()
  onConnect(socket: any) {
    console.log("Connected:", socket.id);
  }

  @OnSocketEvent("message")
  onMessage(payload: any, context: { socket: any }) {
    context.socket.emit("message", payload);
  }
}
```

**Frontend:**
```javascript
const socket = io("/chat");
socket.on("connect", () => console.log("Connected"));
socket.emit("message", { text: "Hola" });
```

```bash
cd samples/23-socket_io_express_app && npm start
# Abre http://localhost:3000
```

---

#### 24. throttler_app
**Propósito:** Rate limiting e throttling.

**Stack:**
- `@xtaskjs/throttler`
- Memory/Redis backing
- Decoradores de throttling

**Aprender:**
- Rate limiting por IP
- Límites customizados
- Throttling de endpoints
- Configuración global vs local

```typescript
@Throttle(10, "1m")  // 10 requests por minuto
@Get("/expensive-operation")
async expensiveOp() { }
```

```bash
cd samples/24-throttler_app && npm start
```

---

## 🚀 Guía Rápida por Caso de Uso

### "Quiero construir una REST API simple"
1. Comienza con **01-new_app** o **02-express_app**
2. Agrega base de datos con **04-typeorm_app**
3. Agrega seguridad con **06-security_app**

### "Quiero una aplicación web con vistas HTML"
1. Comienza con **02-express_app**
2. Agrega base de datos con **04-typeorm_app**
3. Agrega autenticación con **07-security_express_app**
4. Agrega emails con **08-email_express_app**

### "Quiero una arquitectura escalable (CQRS/Event-Source)"
1. Aprende con **19-cqrs_app** (básico)
2. Escala con **20-cqrs_postgres_replication_app** (replicación)
3. O usa **21-event_source_rabbitmq_app** (event sourcing)
4. O combina con **22-event_source_cqrs_app** (híbrido)

### "Quiero real-time capabilities"
1. Comienza con **23-socket_io_express_app**
2. Combina con otros patterns según necesidad

### "Quiero proteger APIs contra abuso"
1. Agrega **24-throttler_app** (rate limiting)
2. Combina con otros patterns

### "Quiero procesamiento asincrónico"
1. Comienza con **16-queues_memory_app** (testing)
2. Escala con **17-queues_rabbitmq_app** (producción)

### "Quiero caching distribuido"
1. Comienza con **12-cache_app** (memoria)
2. Escala con **13-cache_redis_app** (Redis)
3. Agrega HTTP caching con **14-http_cache_web_app**

---

## 📖 Cómo Ejecutar Samples

### Formato Estándar
```bash
# Ir al sample
cd samples/NN-sample_name

# Instalar dependencias
npm install

# Ver variables de entorno requeridas
cat .env.example

# Copiar y ajustar
cp .env.example .env

# Ejecutar
npm start

# El sample estará en http://localhost:3000 (ajustar puerto según sample)
```

### Desarrollo con Watch
```bash
cd samples/NN-sample_name
npm run dev
# Los cambios se detectan y recargan automáticamente
```

### Tests
```bash
npm run test      # Todos los tests
npm run test:unit # Solo unit tests
npm run test:e2e  # Solo e2e tests
```

---

## 🔗 Enlaces de Referencia

- [Samples en GitHub](https://github.com/xtaskjs/xtask/tree/main/samples)
- [xTaskJS Core API](https://github.com/xtaskjs/xtask/tree/main/packages/core)
- [Documentación Oficial](https://github.com/xtaskjs/xtask#readme)

---

## 💡 Pro Tips

1. **Copiar un Sample como punto de partida**
   ```bash
   cp -r samples/02-express_app my-new-app
   cd my-new-app
   npm install
   ```

2. **Combinar features de múltiples samples**
   - Toma estructura base de uno
   - Adopta decoradores de otro
   - Mezcla configuración de tercero

3. **Usar como referencia de patrón**
   - No necesitas ejecutarlos
   - Estudia el código fuente
   - Aprende los patrones

4. **Pre-generar manifest antes de usar en producción**
   ```bash
   npm run prebuild:manifest:app
   ```

5. **Monitorear startup time**
   ```bash
   npm run benchmark:startup --prefix packages/core
   ```

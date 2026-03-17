type DocsPageLike = {
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly isCurrent: boolean;
};

type DocsHighlightLike = {
  readonly title: string;
  readonly text: string;
};

type DocsFlowStepLike = {
  readonly title: string;
  readonly text: string;
};

type PackageDocLike = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly path: string;
  readonly tagline: string;
  readonly purpose: string;
  readonly install: string;
  readonly features: readonly string[];
  readonly integration: readonly string[];
  readonly sample: string;
  readonly exampleTitle: string;
  readonly exampleCode: string;
};

type PackageCapabilityScoreLike = {
  readonly label: string;
  readonly score: number;
};

type PackageDeepDiveDocLike = {
  readonly runtimeChart: readonly PackageCapabilityScoreLike[];
  readonly lifecycle: readonly DocsFlowStepLike[];
  readonly usage: readonly DocsFlowStepLike[];
  readonly related: readonly string[];
};

type PackageApiGroupLike = {
  readonly title: string;
  readonly sourcePath: string;
  readonly exports: readonly string[];
};

type CliInstallDocLike = {
  readonly title: string;
  readonly command: string;
  readonly text: string;
};

type CliCommandExampleLike = {
  readonly title: string;
  readonly command: string;
};

type CliCommandDocLike = {
  readonly name: string;
  readonly summary: string;
  readonly usage: string;
  readonly examples: readonly CliCommandExampleLike[];
};

type CliOptionDocLike = {
  readonly flag: string;
  readonly description: string;
};

type CliOptionGroupLike = {
  readonly title: string;
  readonly description: string;
  readonly options: readonly CliOptionDocLike[];
};

type SampleDocLike = {
  readonly name: string;
  readonly folder: string;
  readonly stack: string;
  readonly summary: string;
  readonly endpoints: readonly string[];
  readonly flow: readonly string[];
};

type DecoratorDocLike = {
  readonly id: string;
  readonly name: string;
  readonly packageName: string;
  readonly packagePath: string;
  readonly kind: string;
  readonly targets: string;
  readonly summary: string;
  readonly exampleTitle: string;
  readonly exampleCode: string;
};

type DecoratorGroupLike = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly decorators: readonly DecoratorDocLike[];
};

const esTranslations: Record<string, string> = {
  "xTaskjs Documentation": "Documentación de xTaskjs",
  Overview: "Resumen",
  Architecture: "Arquitectura",
  Packages: "Paquetes",
  CLI: "CLI",
  Decorators: "Decoradores",
  Samples: "Ejemplos",
  "Hub with summary, quick start, and section entry points.": "Centro con resumen, inicio rápido y puntos de entrada a cada sección.",
  "Boot lifecycle, request pipeline, and security flow diagrams.": "Ciclo de arranque, canalización de peticiones y diagramas del flujo de seguridad.",
  "Detailed reference for core, common, adapters, TypeORM, security, mailer, internationalization, and scheduler.": "Referencia detallada de core, common, adaptadores, TypeORM, security, mailer, internationalization y scheduler.",
  "Console client installation, command reference, and generation workflow.": "Instalación del cliente de consola, referencia de comandos y flujo de generación.",
  "Decorator catalog organized by type and package, with examples.": "Catálogo de decoradores organizado por tipo y paquete, con ejemplos.",
  "Official sample applications and how to use them.": "Aplicaciones de ejemplo oficiales y cómo utilizarlas.",
  "Project bootstrap": "Arranque de proyectos",
  "The console client can scaffold a fresh XTaskJS application from the official typescript-starter and optionally install dependencies with npm, pnpm, yarn, or bun.": "El cliente de consola puede crear una aplicación XTaskJS nueva a partir del typescript-starter oficial y opcionalmente instalar dependencias con npm, pnpm, yarn o bun.",
  "Artifact generation": "Generación de artefactos",
  "The generate command emits controllers, services, repositories, DTOs, guards, middlewares, modules, and full resources that follow the same decorator patterns used across the upstream samples.": "El comando generate emite controladores, servicios, repositorios, DTOs, guards, middlewares, módulos y recursos completos que siguen los mismos patrones de decoradores usados en los ejemplos oficiales.",
  "Cache workflow": "Flujo de cache",
  "The current upstream CLI surface does not ship a dedicated cache generator, but create plus generate module/resource provide the supported starting point for wiring @xtaskjs/cache into a new or existing app.": "La superficie actual de la CLI oficial no incluye un generador dedicado para cache, pero create junto con generate module/resource proporcionan el punto de partida soportado para integrar @xtaskjs/cache en una aplicación nueva o existente.",
  "Operational checks": "Comprobaciones operativas",
  "The upstream README also documents npx usage, global-install troubleshooting, and guard, DTO, and CRUD behavior so teams can standardize their scaffolding workflow.": "El README oficial también documenta el uso con npx, la resolución de problemas de instalación global y el comportamiento de guard, DTO y CRUD para que los equipos puedan estandarizar su flujo de scaffolding.",
  "Global npm install": "Instalación global con npm",
  "Install the published package globally when you want a shell-wide xtask binary for repeated project scaffolding and code generation.": "Instala el paquete publicado globalmente cuando quieras un binario xtask disponible en toda la shell para repetir scaffolding de proyectos y generación de código.",
  "One-off execution with npx": "Ejecución puntual con npx",
  "Use npx to verify the published package or run the console client without changing the current machine's global toolchain.": "Usa npx para verificar el paquete publicado o ejecutar el cliente de consola sin cambiar la cadena global de herramientas de la máquina actual.",
  "Run from source": "Ejecutar desde el código fuente",
  "Run the CLI from source while iterating on templates, generators, or release packaging.": "Ejecuta la CLI desde el código fuente mientras iteras sobre plantillas, generadores o el empaquetado de releases.",
  "Create a cache-ready application": "Crear una aplicación lista para cache",
  "Use the verified create workflow from the CLI repo to bootstrap an app, then add the cache package before wiring cache decorators into generated code.": "Usa el flujo verificado de create desde el repositorio de la CLI para arrancar una aplicación y después añadir el paquete de cache antes de conectar decoradores de cache en el código generado.",
  "Bootstraps a new XTaskJS application from the official typescript-starter archive and can install dependencies immediately after scaffolding.": "Crea una nueva aplicación XTaskJS a partir del archivo oficial typescript-starter y puede instalar dependencias justo después del scaffolding.",
  "Scaffold a new application": "Crear una nueva aplicación",
  "Skip install and choose a package manager": "Omitir la instalación y elegir un gestor de paquetes",
  "Emits feature-oriented source files inside an existing XTaskJS app, supporting controller, service, repository, dto, guard, middleware, module, and resource scaffolds.": "Emite archivos fuente orientados a funcionalidades dentro de una app XTaskJS existente, con soporte para scaffolds de controller, service, repository, dto, guard, middleware, module y resource.",
  "Generate a controller": "Generar un controlador",
  "Generate a CRUD resource": "Generar un recurso CRUD",
  "Scaffold a cache-backed resource": "Generar un recurso preparado para cache",
  "Generate a guarded module scaffold": "Generar un scaffold de módulo con guard",
  "Global flags": "Flags globales",
  "Applies to the top-level xtask binary regardless of subcommand.": "Se aplican al binario xtask de nivel superior independientemente del subcomando.",
  "Print command help and exit.": "Muestra la ayuda del comando y sale.",
  "Show the installed CLI version.": "Muestra la versión instalada de la CLI.",
  "Project creation options": "Opciones de creación de proyectos",
  "Controls how the create command chooses a destination directory and installs dependencies.": "Controla cómo el comando create elige el directorio de destino e instala dependencias.",
  "Allow scaffolding into a non-empty destination directory.": "Permite hacer scaffolding en un directorio de destino no vacío.",
  "Download the starter but do not run the selected package manager afterward.": "Descarga el starter pero no ejecuta después el gestor de paquetes seleccionado.",
  "Choose which package manager to run after scaffolding: npm, pnpm, yarn, or bun.": "Elige qué gestor de paquetes ejecutar después del scaffolding: npm, pnpm, yarn o bun.",
  "Artifact generation options": "Opciones de generación de artefactos",
  "Shapes where generated files are written and how much scaffold code is emitted.": "Define dónde se escriben los archivos generados y cuánto código de scaffold se emite.",
  "Resolve generated output relative to a different source directory.": "Resuelve la salida generada respecto a un directorio fuente distinto.",
  "Override the route path used by generated controllers.": "Sobrescribe la ruta usada por los controladores generados.",
  "Write files directly into the target path instead of creating a feature subdirectory.": "Escribe archivos directamente en la ruta de destino en lugar de crear un subdirectorio de funcionalidad.",
  "Generate a guard file and wire it into module or resource controllers.": "Genera un archivo guard y lo conecta a controladores de module o resource.",
  "For resource scaffolds, also emit a DTO file for request validation.": "Para scaffolds de resource, emite también un archivo DTO para validación de peticiones.",
  "For resource scaffolds, emit CRUD-style controller, service, repository, and DTO code.": "Para scaffolds de resource, emite código de controller, service, repository y DTO con estilo CRUD.",
  "Overwrite existing files instead of aborting when the destination already exists.": "Sobrescribe archivos existentes en lugar de abortar cuando el destino ya existe.",
  "1. Check the active Node environment": "1. Comprueba el entorno Node activo",
  "Confirm node -v and the active npm global prefix before assuming the xtask binary is broken.": "Confirma node -v y el prefijo global activo de npm antes de asumir que el binario xtask está roto.",
  "2. Inspect the global install": "2. Inspecciona la instalación global",
  "Run npm list -g --depth=0 @xtaskjs/cli and type -a xtask to see whether the current shell can resolve the installed package.": "Ejecuta npm list -g --depth=0 @xtaskjs/cli y type -a xtask para ver si la shell actual puede resolver el paquete instalado.",
  "3. Reinstall for the active runtime": "3. Reinstala para el runtime activo",
  "If you use nvm or multiple Node versions, reinstall @xtaskjs/cli in the active version and refresh the shell hash.": "Si usas nvm o varias versiones de Node, reinstala @xtaskjs/cli en la versión activa y refresca la caché de la shell.",
  "4. Verify with a direct invocation": "4. Verifica con una invocación directa",
  "Use xtask --help or npx @xtaskjs/cli --help to confirm the published package works before troubleshooting project-specific commands.": "Usa xtask --help o npx @xtaskjs/cli --help para confirmar que el paquete publicado funciona antes de investigar comandos específicos del proyecto.",
  "The create command downloads the starter project from xtaskjs/typescript-starter.": "El comando create descarga el proyecto starter desde xtaskjs/typescript-starter.",
  "Supported generate types: controller, service, repository, resource, dto, guard, middleware, and module.": "Tipos compatibles con generate: controller, service, repository, resource, dto, guard, middleware y module.",
  "Resource and module scaffolds create a feature directory by default; pass --flat to write directly into the chosen path.": "Los scaffolds de resource y module crean un directorio de funcionalidad por defecto; usa --flat para escribir directamente en la ruta elegida.",
  "The --with-guard flag adds a guard file and applies @UseGuards(...) to generated module or resource controllers.": "La flag --with-guard añade un archivo guard y aplica @UseGuards(...) a los controladores generados de module o resource.",
  "The --with-dto flag only applies to resource scaffolds, and --crud upgrades the same scaffold to CRUD-style controller, service, repository, and DTO code.": "La flag --with-dto solo se aplica a scaffolds de resource, y --crud mejora ese mismo scaffold con código de controller, service, repository y DTO al estilo CRUD.",
  "Generated DTOs assume class-validator is installed and may require class-transformer for richer validation pipelines.": "Los DTO generados asumen que class-validator está instalado y pueden requerir class-transformer para canalizaciones de validación más completas.",
  "The current upstream CLI surface does not ship a dedicated cache generator; scaffold a module or resource first, then add @xtaskjs/cache configuration and decorators inside the generated files.": "La superficie actual de la CLI oficial no incluye un generador dedicado para cache; primero genera un módulo o un recurso y después añade la configuración y los decoradores de @xtaskjs/cache dentro de los archivos generados.",
  "A practical cache flow is: xtask create cache-demo, xtask generate resource cache-entries --path src/modules --crud --with-dto, then add configureCache(), CacheModel(), and cache decorators in the generated code.": "Un flujo práctico de cache es: xtask create cache-demo, xtask generate resource cache-entries --path src/modules --crud --with-dto, y después añadir configureCache(), CacheModel() y los decoradores de cache en el código generado.",
  "Monorepo shape": "Estructura del monorepo",
  "The upstream xtask repository groups runtime packages and sample applications in one workspace so APIs, adapters, decorators, and integrations evolve together.": "El repositorio principal de xtask agrupa los paquetes del runtime y las aplicaciones de ejemplo en un mismo workspace para que APIs, adaptadores, decoradores e integraciones evolucionen juntos.",
  "Decorator-first design": "Diseño guiado por decoradores",
  "Controllers, lifecycle hooks, guards, security rules, persistence bindings, and mail delivery are expressed through decorators and resolved at runtime through the kernel and container.": "Los controladores, hooks del ciclo de vida, guards, reglas de seguridad, enlaces de persistencia y entrega de correo se expresan mediante decoradores y se resuelven en tiempo de ejecución a través del kernel y el contenedor.",
  "Adapter and integration portability": "Portabilidad entre adaptadores e integraciones",
  "Business logic stays stable while node-http, Express, Fastify, TypeORM, security, and mailer integrations change how the app is delivered and extended.": "La lógica de negocio se mantiene estable mientras node-http, Express, Fastify, TypeORM, security y mailer cambian cómo se entrega y amplía la aplicación.",
  "1. Define components": "1. Define componentes",
  "Decorate services, controllers, runners, and listeners in src/ so the container can discover them.": "Decora servicios, controladores, runners y listeners en src/ para que el contenedor pueda descubrirlos.",
  "2. Call CreateApplication()": "2. Llama a CreateApplication()",
  "Core allocates the application lifecycle, kernel, and selected HTTP adapter.": "Core crea el ciclo de vida de la aplicación, el kernel y el adaptador HTTP seleccionado.",
  "3. Boot the kernel": "3. Arranca el kernel",
  "The container scans project directories, registers providers, and resolves component metadata.": "El contenedor analiza los directorios del proyecto, registra providers y resuelve la metadata de los componentes.",
  "4. Attach integrations": "4. Conecta las integraciones",
  "Optional packages such as typeorm and security register lifecycle bindings into the same container.": "Paquetes opcionales como typeorm y security registran enlaces de ciclo de vida en el mismo contenedor.",
  "5. Register routes and events": "5. Registra rutas y eventos",
  "Controllers and listeners are translated into lifecycle routes, handlers, and execution pipelines.": "Los controladores y listeners se traducen en rutas, handlers y canalizaciones de ejecución del ciclo de vida.",
  "6. Listen and serve": "6. Escucha y sirve",
  "The selected adapter starts accepting requests and dispatches them back through the lifecycle.": "El adaptador seleccionado empieza a aceptar peticiones y las reenvía a través del ciclo de vida.",
  "Adapter receives request": "El adaptador recibe la petición",
  "Express, Fastify, or node-http normalizes the request and forwards method + path into the framework.": "Express, Fastify o node-http normalizan la petición y reenvían método y ruta al framework.",
  "Route lookup": "Resolución de ruta",
  "ApplicationLifeCycle resolves the controller route registered during startup.": "ApplicationLifeCycle resuelve la ruta del controlador registrada durante el arranque.",
  "Guards and auth": "Guards y autenticación",
  "Guards can block or enrich the route context before the handler executes.": "Los guards pueden bloquear o enriquecer el contexto de la ruta antes de que se ejecute el handler.",
  "Pipes and middlewares": "Pipes y middlewares",
  "Arguments are transformed and cross-cutting logic runs in a consistent order.": "Los argumentos se transforman y la lógica transversal se ejecuta en un orden consistente.",
  "Controller handler": "Handler del controlador",
  "The handler returns JSON, a primitive response, or a view(...) result.": "El handler devuelve JSON, una respuesta primitiva o un resultado view(...).",
  "Adapter response": "Respuesta del adaptador",
  "The adapter serializes the payload, renders a view, or sends the appropriate status code.": "El adaptador serializa la carga, renderiza una vista o envía el código de estado correspondiente.",
  "Strategy APIs": "APIs de estrategias",
  "JWT or JWE strategies are registered before startup, defining token extraction and validation callbacks.": "Las estrategias JWT o JWE se registran antes del arranque, definiendo callbacks de extracción y validación del token.",
  "Security initialization": "Inicialización de security",
  "CreateApplication() initializes the security lifecycle and publishes auth services into the container.": "CreateApplication() inicializa el ciclo de vida de security y publica los servicios de autenticación en el contenedor.",
  "Guard activation": "Activación de guards",
  "Authenticated, Auth, Roles, and AllowAnonymous decorate routes and drive guard decisions.": "Authenticated, Auth, Roles y AllowAnonymous decoran rutas y guían las decisiones de los guards.",
  "Context enrichment": "Enriquecimiento del contexto",
  "Successful authentication populates req.user, req.auth, response locals, and route execution context.": "Una autenticación satisfactoria rellena req.user, req.auth, response locals y el contexto de ejecución de la ruta.",
  "Bootstrap, kernel, DI container, lifecycle, and HTTP application primitives.": "Bootstrap, kernel, contenedor DI, ciclo de vida y primitivas de aplicación HTTP.",
  "Core owns application startup. It boots the kernel, scans components, resolves adapters, and coordinates optional integrations like TypeORM and security during CreateApplication().": "Core controla el arranque de la aplicación. Inicia el kernel, analiza componentes, resuelve adaptadores y coordina integraciones opcionales como TypeORM y security durante CreateApplication().",
  "CreateApplication() bootstraps lifecycle + kernel + adapter in one entry point.": "CreateApplication() arranca ciclo de vida + kernel + adaptador en un único punto de entrada.",
  "Container autoloads decorated classes and resolves constructor dependencies.": "El contenedor carga automáticamente las clases decoradas y resuelve dependencias del constructor.",
  "ApplicationLifeCycle dispatches guards, pipes, middlewares, handlers, and lifecycle events.": "ApplicationLifeCycle despacha guards, pipes, middlewares, handlers y eventos del ciclo de vida.",
  "HTTP layer normalizes adapters and view results across node, Express, and Fastify.": "La capa HTTP normaliza adaptadores y resultados de vista entre node, Express y Fastify.",
  "Works alone with the default node-http adapter.": "Funciona por sí solo con el adaptador node-http por defecto.",
  "Delegates server integration to @xtaskjs/express-http or @xtaskjs/fastify-http.": "Delega la integración del servidor en @xtaskjs/express-http o @xtaskjs/fastify-http.",
  "Initializes @xtaskjs/typeorm and @xtaskjs/security when those packages are present.": "Inicializa @xtaskjs/typeorm y @xtaskjs/security cuando esos paquetes están presentes.",
  "Minimal application bootstrap": "Arranque mínimo de la aplicación",
  "Cross-package decorators, route metadata, logger, and shared execution types.": "Decoradores transversales, metadata de rutas, logger y tipos de ejecución compartidos.",
  "Common provides the public decorator surface for controllers and route pipelines. It is the language the rest of the framework uses to express middleware, guard, and event metadata.": "Common proporciona la superficie pública de decoradores para controladores y canalizaciones de rutas. Es el lenguaje que usa el resto del framework para expresar metadata de middlewares, guards y eventos.",
  "Controller, Get, Post, Patch, Delete decorators describe routes.": "Los decoradores Controller, Get, Post, Patch y Delete describen rutas.",
  "UseGuards, UseMiddlewares, and UsePipes compose route execution order.": "UseGuards, UseMiddlewares y UsePipes componen el orden de ejecución de la ruta.",
  "Logger and route metadata types are shared by framework packages.": "Los tipos del logger y la metadata de rutas se comparten entre los paquetes del framework.",
  "Lifecycle metadata drives runners and OnEvent listeners.": "La metadata del ciclo de vida alimenta runners y listeners OnEvent.",
  "Consumed by @xtaskjs/core during route registration and execution.": "Lo consume @xtaskjs/core durante el registro y la ejecución de rutas.",
  "Extended by @xtaskjs/security through additional decorators and guards.": "Lo amplía @xtaskjs/security mediante decoradores y guards adicionales.",
  "Controller metadata and pipeline composition": "Metadata del controlador y composición de la canalización",
  "Express adapter with static assets and template engine integration.": "Adaptador de Express con recursos estáticos e integración de motor de plantillas.",
  "The Express adapter translates framework routes into Express request handling. It adds static files, template engines, and JSON or rendered-view responses without changing controller code.": "El adaptador de Express traduce las rutas del framework al manejo de peticiones de Express. Añade archivos estáticos, motores de plantillas y respuestas JSON o renderizadas sin cambiar el código de los controladores.",
  "Wraps an existing Express application instance.": "Envuelve una instancia existente de aplicación Express.",
  "Supports native Express view engines such as Handlebars.": "Admite motores de vista nativos de Express como Handlebars.",
  "Serves static assets and rendered templates from configurable folders.": "Sirve recursos estáticos y plantillas renderizadas desde carpetas configurables.",
  "Uses the same controller contracts as node-http and Fastify.": "Usa los mismos contratos de controlador que node-http y Fastify.",
  "Selected explicitly with new ExpressAdapter(expressApp).": "Se selecciona explícitamente con new ExpressAdapter(expressApp).",
  "Pairs naturally with view(...) return values from controllers.": "Encaja de forma natural con valores de retorno view(...) desde los controladores.",
  "Used by the current xtaskjs.io site and the 07-security_express_app sample.": "Se usa en el sitio actual xtaskjs.io y en el ejemplo 07-security_express_app.",
  "Express bootstrap with templates": "Arranque de Express con plantillas",
  "Fastify adapter for the same controller model used by core and Express.": "Adaptador de Fastify para el mismo modelo de controladores usado por core y Express.",
  "Fastify support mirrors Express support but keeps Fastify-specific serving, view rendering, and static file behavior behind the same framework contracts.": "El soporte de Fastify refleja el de Express, pero mantiene el servido, el renderizado de vistas y el comportamiento de archivos estáticos específicos de Fastify tras los mismos contratos del framework.",
  "Wraps a Fastify instance and exposes the shared xtask HTTP adapter contract.": "Envuelve una instancia de Fastify y expone el contrato compartido del adaptador HTTP de xtask.",
  "Supports static assets and file-template rendering.": "Admite recursos estáticos y renderizado de plantillas de archivo.",
  "Preserves controller portability between Express and Fastify.": "Preserva la portabilidad de los controladores entre Express y Fastify.",
  "Backs both pure Fastify and Fastify + TypeORM samples.": "Sirve tanto para los ejemplos de Fastify puro como para Fastify + TypeORM.",
  "Good fit when you want Fastify performance but keep xtask decorators and DI.": "Es una buena opción cuando quieres el rendimiento de Fastify pero mantener los decoradores y la DI de xtask.",
  "Fastify bootstrap": "Arranque de Fastify",
  "TypeORM integration, datasource registration, and repository injection helpers.": "Integración con TypeORM, registro de datasources y utilidades de inyección de repositorios.",
  "TypeORM support attaches datasource lifecycle to xtask startup and shutdown. It gives the container a standard way to inject datasources and repositories while re-exporting the TypeORM surface.": "El soporte de TypeORM conecta el ciclo de vida del datasource al arranque y apagado de xtask. Proporciona al contenedor una forma estándar de inyectar datasources y repositorios mientras reexporta la superficie de TypeORM.",
  "Registers datasources during bootstrap and destroys them during app.close().": "Registra datasources durante el arranque y los destruye durante app.close().",
  "Re-exports TypeORM decorators and APIs from one package entry point.": "Reexporta decoradores y APIs de TypeORM desde un único punto de entrada del paquete.",
  "Supports datasource decorators and injection helpers.": "Admite decoradores de datasource y utilidades de inyección.",
  "Fits both SQLite demos and larger multi-datasource applications.": "Encaja tanto en demos con SQLite como en aplicaciones mayores con varios datasources.",
  "Activated automatically when the package exports initializeTypeOrmIntegration().": "Se activa automáticamente cuando el paquete exporta initializeTypeOrmIntegration().",
  "Used with Fastify in the SQLite sample and with Postgres in this website project.": "Se usa con Fastify en el ejemplo con SQLite y con Postgres en este proyecto web.",
  "Datasource registration": "Registro de datasource",
  "JWT and JWE authentication, authorization decorators, and DI-aware security lifecycle.": "Autenticación JWT y JWE, decoradores de autorización y ciclo de vida de security compatible con DI.",
  "Security builds on the core route pipeline. It registers strategies, authenticates requests through Passport-compatible flows, and injects auth state into route execution context for guards and controllers.": "Security se apoya en la canalización base de rutas. Registra estrategias, autentica peticiones mediante flujos compatibles con Passport e inyecta el estado de autenticación en el contexto de ejecución para guards y controladores.",
  "registerJwtStrategy() and registerJweStrategy() define authentication entry points.": "registerJwtStrategy() y registerJweStrategy() definen los puntos de entrada de autenticación.",
  "Authenticated, Auth, Roles, and AllowAnonymous decorate public or protected routes.": "Authenticated, Auth, Roles y AllowAnonymous decoran rutas públicas o protegidas.",
  "SecurityAuthenticationService and SecurityAuthorizationService are injected through the container.": "SecurityAuthenticationService y SecurityAuthorizationService se inyectan a través del contenedor.",
  "Lifecycle integration is automatic when CreateApplication() sees the package.": "La integración con el ciclo de vida es automática cuando CreateApplication() detecta el paquete.",
  "Depends on @xtaskjs/core and @xtaskjs/common route metadata.": "Depende de la metadata de rutas de @xtaskjs/core y @xtaskjs/common.",
  "Used in node-http and Express security samples, and in this admin session implementation.": "Se usa en los ejemplos de security con node-http y Express, y en esta implementación de sesiones de administración.",
  "JWT strategy plus protected controller": "Estrategia JWT y controlador protegido",
  "Nodemailer-backed delivery, template rendering, named transports, and DI-friendly mail services.": "Entrega basada en Nodemailer, renderizado de plantillas, transports con nombre y servicios de correo compatibles con DI.",
  "Mailer integrates outbound email into the same xtask lifecycle used by controllers and persistence. It registers transports at startup, exposes injectable mail services and transporters, and supports inline, EJS, or Handlebars-backed templates.": "Mailer integra el correo saliente en el mismo ciclo de vida de xtask usado por controladores y persistencia. Registra transports al arrancar, expone servicios y transporters inyectables y admite plantillas inline, EJS o Handlebars.",
  "registerMailerTransport() supports SMTP, Mailtrap, JSON transport, stream transport, and custom transporter factories.": "registerMailerTransport() admite SMTP, Mailtrap, JSON transport, stream transport y fábricas personalizadas de transporter.",
  "MailerService can send raw mail, render templates, and deliver template-driven messages.": "MailerService puede enviar correo sin procesar, renderizar plantillas y entregar mensajes basados en plantillas.",
  "registerMailerTemplate(), registerEjsTemplateRenderer(), and registerHandlebarsTemplateRenderer() support reusable email views.": "registerMailerTemplate(), registerEjsTemplateRenderer() y registerHandlebarsTemplateRenderer() permiten vistas de correo reutilizables.",
  "InjectMailerService(), InjectMailerTransport(), and InjectMailerLifecycleManager() connect delivery into DI-managed services.": "InjectMailerService(), InjectMailerTransport() e InjectMailerLifecycleManager() conectan la entrega con servicios gestionados por DI.",
  "Initialized automatically by @xtaskjs/core when the package is installed.": "Se inicializa automáticamente mediante @xtaskjs/core cuando el paquete está instalado.",
  "Used directly in the 08-email_express_app sample and in 07-security_express_app for protected profile notifications.": "Se usa directamente en el ejemplo 08-email_express_app y en 07-security_express_app para notificaciones protegidas del perfil.",
  "Works well beside security when mail actions should happen after authenticated requests.": "Funciona bien junto a security cuando las acciones de correo deben ejecutarse tras peticiones autenticadas.",
  "Named transports plus template-driven delivery": "Transports con nombre y entrega basada en plantillas",
  "Request-aware translations, locale fallback, namespace loading, and DI-friendly formatting services.": "Traducciones dependientes de la petición, fallback de locale, carga de namespaces y servicios de formateo compatibles con DI.",
  "Internationalization adds request-scoped locale resolution, translation lookup, pluralization, and formatting helpers to the xtask lifecycle. It registers locale services before controllers resolve and exposes an injectable service for controllers, views, and domain presenters.": "Internationalization añade resolución de locale por petición, búsqueda de traducciones, pluralización y helpers de formato al ciclo de vida de xtask. Registra los servicios de locale antes de que se resuelvan los controladores y expone un servicio inyectable para controladores, vistas y presenters de dominio.",
  "Request-aware translations with locale fallback and exact-count pluralization.": "Traducciones dependientes de la petición con fallback de locale y pluralización por conteo exacto.",
  "Async namespace loading for feature-specific translation bundles.": "Carga asíncrona de namespaces para paquetes de traducción específicos por funcionalidad.",
  "Built-in number, currency, date, and datetime formatting with optional custom formatters.": "Formateo integrado de números, moneda, fecha y fecha-hora con formatters personalizados opcionales.",
  "InjectInternationalizationService() exposes locale-aware translation and formatting inside DI-managed classes.": "InjectInternationalizationService() expone traducción y formateo conscientes del locale dentro de clases gestionadas por DI.",
  "Initializes automatically before container lifecycle listeners are resolved during CreateApplication().": "Se inicializa automáticamente antes de que se resuelvan los listeners del ciclo de vida del contenedor durante CreateApplication().",
  "Resolves locale from query parameters and request headers, and can be extended with custom resolvers.": "Resuelve el locale desde parámetros de consulta y cabeceras de la petición, y puede ampliarse con resolvers personalizados.",
  "Used by this website and by the 09-internationalization_app and 10-internationalization_express_app samples.": "Lo usan este sitio web y los ejemplos 09-internationalization_app y 10-internationalization_express_app.",
  "Locale registration plus injected translations": "Registro de locales más traducciones inyectadas",
  "Cron, interval, and timeout decorators with lifecycle-managed job discovery and control.": "Decoradores cron, interval y timeout con descubrimiento y control de trabajos gestionados por el ciclo de vida.",
  "Scheduler adds recurring and delayed jobs to xtask services. It discovers decorated methods after the DI container is ready, runs boot jobs during initialization, starts recurring work on lifecycle ready, and exposes service APIs for inspection and manual execution.": "Scheduler añade trabajos recurrentes y diferidos a los servicios xtask. Descubre los métodos decorados cuando el contenedor DI está listo, ejecuta trabajos de arranque durante la inicialización, inicia el trabajo recurrente en el evento ready del ciclo de vida y expone APIs de servicio para inspección y ejecución manual.",
  "Cron(), Every(), Interval(), and Timeout() decorators declare scheduled jobs on services.": "Los decoradores Cron(), Every(), Interval() y Timeout() declaran trabajos programados en servicios.",
  "Supports runOnBoot, runOnInit, named groups, retries, and per-job retry or error hooks.": "Admite runOnBoot, runOnInit, grupos con nombre, reintentos y hooks de reintento o error por trabajo.",
  "SchedulerService lists jobs and groups, and can start, stop, or run them manually.": "SchedulerService lista trabajos y grupos, y puede iniciarlos, detenerlos o ejecutarlos manualmente.",
  "Tracks runtime state such as run counts, failures, and the last execution error.": "Rastrea el estado de ejecución, como conteos, fallos y el último error de ejecución.",
  "Discovered automatically during CreateApplication() after the container has registered providers.": "Se descubre automáticamente durante CreateApplication() después de que el contenedor haya registrado los providers.",
  "Starts recurring jobs on lifecycle ready and stops active handles during app.close().": "Inicia los trabajos recurrentes en el evento ready del ciclo de vida y detiene los handles activos durante app.close().",
  "Demonstrated by the 11-scheduler_app sample with inspection endpoints and maintenance groups.": "Lo demuestra el ejemplo 11-scheduler_app con endpoints de inspección y grupos de mantenimiento.",
  "Scheduled jobs with grouped execution": "Trabajos programados con ejecución agrupada",
  "Smallest possible application. It proves that core can boot a server and route a health endpoint with no external adapter.": "La aplicación más pequeña posible. Demuestra que core puede arrancar un servidor y enrutar un endpoint de salud sin adaptador externo.",
  "Install dependencies inside the sample folder.": "Instala las dependencias dentro de la carpeta del ejemplo.",
  "Run npm start to boot CreateApplication() with node-http.": "Ejecuta npm start para arrancar CreateApplication() con node-http.",
  "Call /health to verify controller registration and logger wiring.": "Llama a /health para comprobar el registro del controlador y la configuración del logger.",
  "Shows how an existing Express app is wrapped by ExpressAdapter while controllers still return framework-native values.": "Muestra cómo una app Express existente se envuelve con ExpressAdapter mientras los controladores siguen devolviendo valores nativos del framework.",
  "Create an Express instance and enable body parsing or other middleware yourself.": "Crea una instancia de Express y habilita por tu cuenta body parsing u otros middlewares.",
  "Pass the instance into new ExpressAdapter(expressApp).": "Pasa la instancia a new ExpressAdapter(expressApp).",
  "Render a template-backed home page and expose a JSON health endpoint.": "Renderiza una home basada en plantillas y expone un endpoint JSON de salud.",
  "Demonstrates adapter portability: the same controller style runs on Fastify without changing business logic.": "Demuestra la portabilidad del adaptador: el mismo estilo de controlador funciona sobre Fastify sin cambiar la lógica de negocio.",
  "Create a Fastify instance with its own logger/runtime options.": "Crea una instancia de Fastify con sus propias opciones de logger/runtime.",
  "Wrap it with FastifyAdapter.": "Envuélvela con FastifyAdapter.",
  "Reuse the same controller conventions used by Express and node-http.": "Reutiliza las mismas convenciones de controlador usadas por Express y node-http.",
  "Adds persistent state on top of the Fastify adapter. The sample seeds users and demonstrates datasource lifecycle registration.": "Añade estado persistente sobre el adaptador de Fastify. El ejemplo siembra usuarios y demuestra el registro del ciclo de vida del datasource.",
  "Decorate a datasource configuration class with TypeOrmDataSource().": "Decora una clase de configuración del datasource con TypeOrmDataSource().",
  "Boot the app with FastifyAdapter.": "Arranca la aplicación con FastifyAdapter.",
  "Use injected repositories or datasources inside services to query and mutate state.": "Usa repositorios o datasources inyectados dentro de servicios para consultar y mutar el estado.",
  "Demonstrates JWT and JWE flows without a full web framework adapter, focusing on strategy registration and protected controllers.": "Demuestra flujos JWT y JWE sin un adaptador web completo, centrándose en el registro de estrategias y controladores protegidos.",
  "Register JWT and JWE strategies before CreateApplication().": "Registra estrategias JWT y JWE antes de CreateApplication().",
  "Issue a demo token from /auth/jwt/admin.": "Emite un token de demostración desde /auth/jwt/admin.",
  "Use Authorization: Bearer <token> against /me/ and /admin/.": "Usa Authorization: Bearer <token> contra /me/ y /admin/.",
  "Combines Express integration with security decorators and the mailer module, showing authenticated profile endpoints plus protected transactional and notification emails.": "Combina la integración de Express con decoradores de security y el módulo mailer, mostrando endpoints de perfil autenticado además de correos transaccionales y notificaciones protegidas.",
  "Create an Express app, register JWT and JWE strategies, then register mail transports and templates at startup.": "Crea una app Express, registra estrategias JWT y JWE, y después registra transports y plantillas de correo durante el arranque.",
  "Fetch a demo token from /auth/jwt/admin and call /me/ with Authorization: Bearer <token>.": "Obtén un token de demostración desde /auth/jwt/admin y llama a /me/ con Authorization: Bearer <token>.",
  "POST to /me/notify to render profile email templates and deliver through the default and notifications transports.": "Haz POST a /me/notify para renderizar plantillas de correo del perfil y enviarlas mediante los transports default y notifications.",
  "Dedicated mailer sample showing named transports, EJS-backed email templates, and DI-managed services that send welcome and campaign messages.": "Ejemplo dedicado a mailer que muestra transports con nombre, plantillas de correo basadas en EJS y servicios gestionados por DI que envían mensajes de bienvenida y campaña.",
  "Register the default and notifications transports, then attach the ejs-file renderer and email templates.": "Registra los transports default y notifications, y después conecta el renderer ejs-file y las plantillas de correo.",
  "Start the Express app through CreateApplication() and inspect /email/ for the sample contract.": "Inicia la app Express mediante CreateApplication() e inspecciona /email/ para ver el contrato del ejemplo.",
  "POST to /email/welcome or /email/campaign to render templates and send through the configured transporter.": "Haz POST a /email/welcome o /email/campaign para renderizar plantillas y enviarlas a través del transporter configurado.",
  "Shows request-scoped locale resolution, translation helpers, custom formatters, and lazy namespace loading on the default node-http adapter.": "Muestra resolución de locale por petición, helpers de traducción, formatters personalizados y carga diferida de namespaces sobre el adaptador node-http por defecto.",
  "Configure default locale, fallback locale, and built-in formatters before CreateApplication().": "Configura el locale por defecto, el fallback de locale y los formatters integrados antes de CreateApplication().",
  "Open /i18n to inspect translated messages, locale state, and loaded namespaces.": "Abre /i18n para inspeccionar mensajes traducidos, el estado del locale y los namespaces cargados.",
  "Hit /i18n/checkout to trigger lazy namespace loading and localized number, currency, and datetime formatting.": "Accede a /i18n/checkout para activar la carga diferida de namespaces y el formateo localizado de números, moneda y fecha-hora.",
  "Combines localized page rendering with the Express adapter, including query-driven locale switching, Accept-Language support, and lazy checkout translations.": "Combina renderizado de páginas localizadas con el adaptador de Express, incluyendo cambio de locale por query, soporte de Accept-Language y traducciones diferidas para checkout.",
  "Configure locale catalogs and custom formatters, then boot an Express app through ExpressAdapter.": "Configura catálogos de locale y formatters personalizados, y después arranca una app Express mediante ExpressAdapter.",
  "Open the localized home page and switch between en-US and es-ES through query parameters or Accept-Language.": "Abre la página principal localizada y cambia entre en-US y es-ES mediante parámetros de consulta o Accept-Language.",
  "Follow the checkout route to exercise lazy namespace loading with server-rendered views.": "Sigue la ruta de checkout para probar la carga diferida de namespaces con vistas renderizadas en el servidor.",
  "Demonstrates scheduled jobs integrated with xtask lifecycle, including boot execution, named groups, retries, and runtime inspection endpoints.": "Demuestra trabajos programados integrados con el ciclo de vida de xtask, incluyendo ejecución en arranque, grupos con nombre, reintentos y endpoints de inspección en tiempo de ejecución.",
  "Start the sample to let CreateApplication() discover scheduled methods after the container boots.": "Inicia el ejemplo para que CreateApplication() descubra los métodos programados después de que arranque el contenedor.",
  "Open /scheduler/status to inspect job metadata, counters, failures, and recent events.": "Abre /scheduler/status para inspeccionar metadata de trabajos, contadores, fallos y eventos recientes.",
  "Call /scheduler/run-maintenance to trigger a named job group manually and observe retry behavior.": "Llama a /scheduler/run-maintenance para disparar manualmente un grupo de trabajos con nombre y observar el comportamiento de reintento.",
  "HTTP Routing And Pipelines": "Routing HTTP y canalizaciones",
  "Route declaration and request-pipeline decorators exported by @xtaskjs/common. These are the core HTTP building blocks used by controllers in every sample.": "Decoradores de declaración de rutas y canalización de peticiones exportados por @xtaskjs/common. Son los bloques básicos HTTP usados por los controladores en todos los ejemplos.",
  "Lifecycle Runners And Events": "Runners y eventos del ciclo de vida",
  "Lifecycle decorators from @xtaskjs/common used to run startup logic, CLI tasks, and event handlers inside the application lifecycle.": "Decoradores de ciclo de vida de @xtaskjs/common usados para ejecutar lógica de arranque, tareas CLI y handlers de eventos dentro del ciclo de vida de la aplicación.",
  "Core DI And Components": "DI y componentes de core",
  "Dependency-injection and component decorators from @xtaskjs/core. These mark providers for container discovery and select named bindings for injection.": "Decoradores de inyección de dependencias y componentes de @xtaskjs/core. Marcan providers para el descubrimiento del contenedor y seleccionan bindings con nombre para la inyección.",
  "Security And Authorization": "Security y autorización",
  "Authentication, authorization, strategy, and injector decorators exported by @xtaskjs/security. These layer on top of @xtaskjs/common route metadata.": "Decoradores de autenticación, autorización, estrategias e inyección exportados por @xtaskjs/security. Se apoyan en la metadata de rutas de @xtaskjs/common.",
  "Persistence And Repositories": "Persistencia y repositorios",
  "TypeORM registration and injection decorators exported by @xtaskjs/typeorm. These bind datasources and repositories into the same DI container.": "Decoradores de registro e inyección de TypeORM exportados por @xtaskjs/typeorm. Vinculan datasources y repositorios dentro del mismo contenedor DI.",
  "Mailer Templates And Delivery": "Plantillas y entrega de mailer",
  "Mailer decorators exported by @xtaskjs/mailer. These register transports and templates and inject delivery services into DI-managed classes.": "Decoradores de mailer exportados por @xtaskjs/mailer. Registran transports y plantillas e inyectan servicios de entrega en clases gestionadas por DI.",
  "Internationalization And Locale Resolution": "Internationalization y resolución de locale",
  "Configuration and injector decorators exported by @xtaskjs/internationalization. These register locale behavior and expose translation services inside DI-managed classes.": "Decoradores de configuración e inyección exportados por @xtaskjs/internationalization. Registran el comportamiento de locale y exponen servicios de traducción dentro de clases gestionadas por DI.",
  "Scheduler Jobs And Lifecycle": "Trabajos scheduler y ciclo de vida",
  "Scheduling decorators from @xtaskjs/scheduler used to declare cron, interval, and timeout jobs and to inject runtime scheduler services.": "Decoradores de scheduling de @xtaskjs/scheduler usados para declarar trabajos cron, interval y timeout e inyectar servicios scheduler en tiempo de ejecución.",
  "Class decorator": "Decorador de clase",
  "Method decorator": "Decorador de método",
  "Class and method decorator": "Decorador de clase y método",
  "Property decorator": "Decorador de propiedad",
  "Parameter decorator": "Decorador de parámetro",
  "Parameter and property decorator": "Decorador de parámetro y propiedad",
  class: "clase",
  method: "método",
  "class or method": "clase o método",
  property: "propiedad",
  "constructor parameter": "parámetro del constructor",
  "constructor parameter or property": "parámetro del constructor o propiedad",
  "Defines the base route path for an HTTP controller and can attach shared middlewares, guards, and pipes.": "Define la ruta base de un controlador HTTP y puede adjuntar middlewares, guards y pipes compartidos.",
  "Route prefix on a controller": "Prefijo de ruta en un controlador",
  "Registers a GET route handler and optionally adds route-specific middleware, guards, or pipes.": "Registra un handler de ruta GET y opcionalmente añade middleware, guards o pipes específicos de la ruta.",
  "GET route": "Ruta GET",
  "Registers a POST route handler for commands, form submissions, or resource creation.": "Registra un handler de ruta POST para comandos, envíos de formularios o creación de recursos.",
  "POST route": "Ruta POST",
  "Registers a PATCH route handler for partial updates.": "Registra un handler de ruta PATCH para actualizaciones parciales.",
  "PATCH route": "Ruta PATCH",
  "Registers a DELETE route handler for removals and destructive operations.": "Registra un handler de ruta DELETE para eliminaciones y operaciones destructivas.",
  "DELETE route": "Ruta DELETE",
  "Adds one or more middlewares to a controller or route so cross-cutting logic runs before the handler.": "Añade uno o más middlewares a un controlador o ruta para que la lógica transversal se ejecute antes del handler.",
  "Class-level middleware": "Middleware a nivel de clase",
  "Attaches guard functions to a controller or route to allow, deny, or enrich request context before execution.": "Adjunta funciones guard a un controlador o ruta para permitir, denegar o enriquecer el contexto de la petición antes de la ejecución.",
  "Route-level guard": "Guard a nivel de ruta",
  "Applies argument transformation or validation functions before a route handler consumes input.": "Aplica funciones de transformación o validación de argumentos antes de que un handler de ruta consuma la entrada.",
  "Pipe-based payload cleanup": "Limpieza del payload mediante pipes",
  "Registers a lifecycle event handler for a given phase and execution priority.": "Registra un handler de evento del ciclo de vida para una fase dada y una prioridad de ejecución.",
  "Lifecycle phase listener": "Listener de fase del ciclo de vida",
  "Runs a method during application startup with optional priority ordering.": "Ejecuta un método durante el arranque de la aplicación con un orden de prioridad opcional.",
  "Startup seed": "Siembra de arranque",
  "Marks a method as a command-line lifecycle runner so it can execute in CLI-oriented flows.": "Marca un método como runner de línea de comandos para que pueda ejecutarse en flujos orientados a CLI.",
  "CLI task": "Tarea CLI",
  "Low-level component decorator that stores DI metadata such as scope, condition, name, and primary selection.": "Decorador de componente de bajo nivel que almacena metadata de DI como alcance, condición, nombre y selección primaria.",
  "Custom component metadata": "Metadata personalizada de componente",
  "Convenience stereotype for registering a class as a DI-managed service component.": "Estereotipo de conveniencia para registrar una clase como componente de servicio gestionado por DI.",
  "Service stereotype": "Estereotipo de servicio",
  "Registers a class as a controller component in the DI container. This is separate from the HTTP route decorator exported by @xtaskjs/common.": "Registra una clase como componente controlador en el contenedor DI. Es independiente del decorador de rutas HTTP exportado por @xtaskjs/common.",
  "DI controller stereotype": "Estereotipo DI de controlador",
  "Convenience stereotype for repository-like providers managed by the DI container.": "Estereotipo de conveniencia para providers tipo repositorio gestionados por el contenedor DI.",
  "Repository stereotype": "Estereotipo de repositorio",
  "Injects a dependency into a property. The package also exports Autowired as an alias of AutoWired.": "Inyecta una dependencia en una propiedad. El paquete también exporta Autowired como alias de AutoWired.",
  "Property injection": "Inyección de propiedades",
  "Selects a named binding for constructor-parameter injection when multiple implementations share the same type.": "Selecciona un binding con nombre para la inyección en parámetros del constructor cuando varias implementaciones comparten el mismo tipo.",
  "Named constructor injection": "Inyección nombrada en constructor",
  "Requires a successful authentication result before a controller or route executes. It can target a specific strategy or strategy list.": "Requiere un resultado de autenticación satisfactorio antes de que se ejecute un controlador o una ruta. Puede apuntar a una estrategia concreta o a una lista de estrategias.",
  "Protect a controller": "Proteger un controlador",
  "Alias of Authenticated for projects that prefer a shorter decorator name.": "Alias de Authenticated para proyectos que prefieren un nombre de decorador más corto.",
  "Alias for Authenticated": "Alias de Authenticated",
  "Applies role-based authorization requirements to an already authenticated route.": "Aplica requisitos de autorización por roles a una ruta ya autenticada.",
  "Role-gated endpoint": "Endpoint restringido por rol",
  "Marks a route as publicly accessible even when the surrounding controller is authenticated by default.": "Marca una ruta como accesible públicamente incluso cuando el controlador circundante está autenticado por defecto.",
  "Public health check": "Comprobación de salud pública",
  "Decorator form of registerJwtStrategy() for registering a JWT strategy definition during module loading.": "Forma decorador de registerJwtStrategy() para registrar una definición de estrategia JWT durante la carga del módulo.",
  "Decorator-based JWT strategy": "Estrategia JWT basada en decorador",
  "Decorator form of registerJweStrategy() for encrypted token flows.": "Forma decorador de registerJweStrategy() para flujos de token cifrados.",
  "Decorator-based JWE strategy": "Estrategia JWE basada en decorador",
  "Injects the SecurityAuthenticationService registered by the security lifecycle manager.": "Inyecta el SecurityAuthenticationService registrado por el gestor del ciclo de vida de security.",
  "Inject auth service": "Inyectar servicio de autenticación",
  "Injects the SecurityAuthorizationService used for role and permission decisions.": "Inyecta el SecurityAuthorizationService usado para decisiones de roles y permisos.",
  "Inject authorization service": "Inyectar servicio de autorización",
  "Injects the configured Passport instance managed by xtaskjs security.": "Inyecta la instancia de Passport configurada y gestionada por xtaskjs security.",
  "Inject Passport": "Inyectar Passport",
  "Injects the SecurityLifecycleManager so advanced services can inspect strategies or authentication state wiring.": "Inyecta el SecurityLifecycleManager para que los servicios avanzados puedan inspeccionar estrategias o el cableado del estado de autenticación.",
  "Inject lifecycle manager": "Inyectar gestor del ciclo de vida",
  "Registers a TypeORM datasource definition for xtask startup and shutdown management.": "Registra una definición de datasource de TypeORM para la gestión del arranque y apagado de xtask.",
  "Register a datasource": "Registrar un datasource",
  "Injects a named datasource instance managed by xtaskjs TypeORM integration.": "Inyecta una instancia de datasource con nombre gestionada por la integración TypeORM de xtaskjs.",
  "Inject the default datasource": "Inyectar el datasource por defecto",
  "Injects a TypeORM repository for a given entity and datasource name.": "Inyecta un repositorio TypeORM para una entidad y nombre de datasource concretos.",
  "Inject entity repository": "Inyectar repositorio de entidad",
  "Decorator form of registerMailerTransport() for registering a named mail transport during module loading.": "Forma decorador de registerMailerTransport() para registrar un transport de correo con nombre durante la carga del módulo.",
  "Register a transport with a decorator": "Registrar un transport con un decorador",
  "Decorator form of registerMailerTemplate() for reusable inline or file-rendered email templates.": "Forma decorador de registerMailerTemplate() para plantillas de correo reutilizables inline o renderizadas desde archivo.",
  "Register a template": "Registrar una plantilla",
  "Injects MailerService so a DI-managed service can render templates and send mail.": "Inyecta MailerService para que un servicio gestionado por DI pueda renderizar plantillas y enviar correo.",
  "Inject mailer service": "Inyectar servicio mailer",
  "Injects a named transport so a service can send directly on a specific channel such as notifications.": "Inyecta un transport con nombre para que un servicio pueda enviar directamente por un canal concreto, como notifications.",
  "Inject notifications transport": "Inyectar transport de notifications",
  "Injects the MailerLifecycleManager for advanced inspection, verification, or transporter lookup.": "Inyecta el MailerLifecycleManager para inspección avanzada, verificación o búsqueda de transporters.",
  "Decorator form of configureInternationalization() for registering default locale, fallback locale, currency, and timezone settings during module loading.": "Forma decorador de configureInternationalization() para registrar el locale por defecto, el fallback, la moneda y la zona horaria durante la carga del módulo.",
  "Register base internationalization settings": "Registrar configuración base de internationalization",
  "Registers a locale definition with translations, locale-specific currency and timezone values, and optional namespace dictionaries.": "Registra una definición de locale con traducciones, moneda y zona horaria específicas del locale y diccionarios de namespace opcionales.",
  "Register a locale catalog": "Registrar un catálogo de locale",
  "Registers a custom locale resolver that can derive locale context from the request, headers, container state, or tenant metadata.": "Registra un resolver de locale personalizado que puede derivar el contexto de locale desde la petición, las cabeceras, el estado del contenedor o metadata del tenant.",
  "Custom locale resolver": "Resolver de locale personalizado",
  "Injects InternationalizationService so controllers and services can translate keys, format values, inspect locales, and load namespaces on demand.": "Inyecta InternationalizationService para que controladores y servicios puedan traducir claves, formatear valores, inspeccionar locales y cargar namespaces bajo demanda.",
  "Inject translation service": "Inyectar servicio de traducción",
  "Injects the InternationalizationLifecycleManager for advanced inspection of loaded locales, namespaces, request context, or formatter registration.": "Inyecta el InternationalizationLifecycleManager para inspección avanzada de locales cargados, namespaces, contexto de petición o registro de formatters.",
  "Inject internationalization lifecycle": "Inyectar ciclo de vida de internationalization",
  "Registers a cron-based recurring job with optional groups, retries, timezone overrides, and boot execution behavior.": "Registra un trabajo recurrente basado en cron con grupos opcionales, reintentos, sobrescrituras de zona horaria y comportamiento de ejecución en arranque.",
  "Cron job": "Trabajo cron",
  "Registers a fixed-interval recurring job. Interval is an alias of Every for projects that prefer the more explicit name.": "Registra un trabajo recurrente por intervalo fijo. Interval es un alias de Every para proyectos que prefieren un nombre más explícito.",
  "Interval job": "Trabajo por intervalo",
  "Registers a one-shot delayed task that runs after startup instead of on a recurring cadence.": "Registra una tarea diferida de una sola ejecución que corre después del arranque en lugar de seguir una cadencia recurrente.",
  "Delayed warmup job": "Trabajo diferido de calentamiento",
  "Injects SchedulerService so services or controllers can inspect jobs and trigger groups or individual jobs manually.": "Inyecta SchedulerService para que servicios o controladores puedan inspeccionar trabajos y disparar grupos o trabajos individuales manualmente.",
  "Inject scheduler service": "Inyectar servicio scheduler",
  "Injects the SchedulerLifecycleManager for lower-level control over startup state, active handles, and discovered job metadata.": "Inyecta el SchedulerLifecycleManager para un control de bajo nivel sobre el estado de arranque, los handles activos y la metadata de trabajos descubiertos.",
  "Inject scheduler lifecycle": "Inyectar ciclo de vida de scheduler",
  Bootstrap: "Arranque",
  "Dependency Injection": "Inyección de dependencias",
  "HTTP Delivery": "Entrega HTTP",
  Rendering: "Renderizado",
  Integrations: "Integraciones",
  Security: "Seguridad",
  Messaging: "Mensajería",
  Performance: "Rendimiento",
  Persistence: "Persistencia",
  Localization: "Localización",
  Scheduling: "Planificación",
  Operations: "Operaciones",
  "Before startup": "Antes del arranque",
  "During CreateApplication()": "Durante CreateApplication()",
  "During app.close()": "Durante app.close()",
  "1. Install and import": "1. Instala e importa",
  "2. Pick an adapter": "2. Elige un adaptador",
  "3. Layer integrations later": "3. Añade integraciones después",
  "1. Define controllers": "1. Define controladores",
  "2. Compose the pipeline": "2. Compón la canalización",
  "3. Add lifecycle hooks": "3. Añade hooks del ciclo de vida",
  "1. Create the Express app": "1. Crea la app Express",
  "2. Pass the adapter": "2. Pasa el adaptador",
  "3. Return framework-native results": "3. Devuelve resultados nativos del framework",
  "1. Create the Fastify app": "1. Crea la app Fastify",
  "2. Wrap it with the adapter": "2. Envuélvela con el adaptador",
  "3. Add persistence or views": "3. Añade persistencia o vistas",
  "1. Register datasource definitions": "1. Registra definiciones de datasource",
  "2. Inject repositories or datasources": "2. Inyecta repositorios o datasources",
  "3. Let lifecycle manage connections": "3. Deja que el ciclo de vida gestione las conexiones",
  "1. Register strategies": "1. Registra estrategias",
  "2. Protect routes declaratively": "2. Protege rutas de forma declarativa",
  "3. Inject security services when needed": "3. Inyecta servicios de security cuando haga falta",
  "1. Register one or more transports": "1. Registra uno o más transports",
  "2. Define templates and renderers": "2. Define plantillas y renderers",
  "3. Inject MailerService into services": "3. Inyecta MailerService en servicios",
  "1. Configure locales and fallbacks": "1. Configura locales y fallbacks",
  "2. Resolve locale from the request": "2. Resuelve el locale desde la petición",
  "3. Inject translations into pages and services": "3. Inyecta traducciones en páginas y servicios",
  "1. Decorate job methods": "1. Decora métodos de trabajo",
  "2. Organize jobs with options": "2. Organiza trabajos con opciones",
  "3. Inspect and trigger jobs at runtime": "3. Inspecciona y dispara trabajos en tiempo de ejecución",
  "Import reflect-metadata and decorate controllers, services, and runners so the kernel can discover them during bootstrap.": "Importa reflect-metadata y decora controladores, servicios y runners para que el kernel pueda descubrirlos durante el arranque.",
  "Core builds the application lifecycle, selects the HTTP adapter, loads the DI container, and initializes optional integrations such as TypeORM, security, mailer, scheduler, and internationalization.": "Core construye el ciclo de vida de la aplicación, selecciona el adaptador HTTP, carga el contenedor DI e inicializa integraciones opcionales como TypeORM, security, mailer, scheduler e internationalization.",
  "Core emits shutdown lifecycle events, closes the active adapter, and asks installed integrations to release resources in a predictable order.": "Core emite eventos de apagado, cierra el adaptador activo y pide a las integraciones instaladas que liberen recursos en un orden predecible.",
  "Install @xtaskjs/core with reflect-metadata and use CreateApplication() as the single bootstrap entry point.": "Instala @xtaskjs/core con reflect-metadata y usa CreateApplication() como único punto de entrada del arranque.",
  "Start with node-http for the smallest runtime, or pair core with Express or Fastify adapters when you need ecosystem-specific middleware or rendering.": "Empieza con node-http para el runtime más pequeño, o combina core con los adaptadores de Express o Fastify cuando necesites middleware o renderizado propios del ecosistema.",
  "Add persistence, security, mail, localization, or scheduled jobs without changing the controller and DI patterns you started with.": "Añade persistencia, security, correo, localización o trabajos programados sin cambiar los patrones de controlador y DI con los que empezaste.",
  "Common decorators attach route, guard, middleware, pipe, and lifecycle metadata while modules are imported.": "Los decoradores de common adjuntan metadata de rutas, guards, middlewares, pipes y ciclo de vida mientras se importan los módulos.",
  "Core reads the metadata from @xtaskjs/common to register controller routes, lifecycle listeners, and execution pipelines.": "Core lee la metadata de @xtaskjs/common para registrar rutas de controlador, listeners del ciclo de vida y canalizaciones de ejecución.",
  "Common itself does not hold resources, but its lifecycle metadata continues to shape how shutdown listeners run.": "Common no mantiene recursos por sí mismo, pero su metadata de ciclo de vida sigue determinando cómo se ejecutan los listeners de apagado.",
  "Use Controller, Get, Post, Patch, and Delete to describe the public HTTP surface of your application.": "Usa Controller, Get, Post, Patch y Delete para describir la superficie HTTP pública de tu aplicación.",
  "Attach UseGuards, UseMiddlewares, and UsePipes to keep authentication, cross-cutting logic, and validation close to the route.": "Adjunta UseGuards, UseMiddlewares y UsePipes para mantener la autenticación, la lógica transversal y la validación cerca de la ruta.",
  "Use ApplicationRunner, CommandLineRunner, and OnEvent when startup work or runtime events should be expressed with the same decorator-first model.": "Usa ApplicationRunner, CommandLineRunner y OnEvent cuando el trabajo de arranque o los eventos de ejecución deban expresarse con el mismo modelo guiado por decoradores.",
  "Create an Express app, register its middleware stack, and optionally configure template engines or static asset behavior.": "Crea una app Express, registra su pila de middlewares y configura opcionalmente motores de plantillas o el comportamiento de recursos estáticos.",
  "The Express adapter maps xtaskjs routes into Express handlers and preserves view(), JSON, and status-code responses.": "El adaptador de Express mapea las rutas de xtaskjs a handlers de Express y preserva respuestas view(), JSON y códigos de estado.",
  "The xtask application stops the active server while your existing Express middleware and configuration remain the same application-wide boundary.": "La aplicación xtask detiene el servidor activo mientras tu middleware y configuración existentes de Express siguen siendo el mismo límite de aplicación.",
  "Enable JSON parsing, cookies, sessions, or any other Express middleware before handing control to xtaskjs.": "Habilita parseo JSON, cookies, sesiones o cualquier otro middleware de Express antes de ceder el control a xtaskjs.",
  "Wrap the instance with new ExpressAdapter(expressApp) and pass it into CreateApplication().": "Envuelve la instancia con new ExpressAdapter(expressApp) y pásala a CreateApplication().",
  "Keep controllers portable by returning plain objects or view() results while the adapter handles Express-specific rendering details.": "Mantén los controladores portables devolviendo objetos planos o resultados view() mientras el adaptador maneja los detalles de renderizado específicos de Express.",
  "Create a Fastify instance with your preferred logger and plugins before wiring it into the framework adapter.": "Crea una instancia de Fastify con el logger y los plugins que prefieras antes de conectarla al adaptador del framework.",
  "The Fastify adapter translates the shared xtaskjs controller contract into Fastify routes, static assets, and template lookups.": "El adaptador de Fastify traduce el contrato compartido de controladores de xtaskjs en rutas Fastify, recursos estáticos y resolución de plantillas.",
  "Shutdown flows through the application close sequence so Fastify resources stop together with the rest of the xtask lifecycle.": "El apagado fluye por la secuencia de cierre de la aplicación para que los recursos de Fastify se detengan junto con el resto del ciclo de vida de xtask.",
  "Start from a Fastify instance when you want lower-level performance tuning or plugin-driven composition.": "Parte de una instancia de Fastify cuando quieras ajustar rendimiento a bajo nivel o una composición guiada por plugins.",
  "Pass new FastifyAdapter(fastifyApp) into CreateApplication() to keep the same controller surface used by node-http and Express.": "Pasa new FastifyAdapter(fastifyApp) a CreateApplication() para mantener la misma superficie de controladores usada por node-http y Express.",
  "Pair the adapter with TypeORM or file-backed views without rewriting route handlers or service classes.": "Combina el adaptador con TypeORM o vistas respaldadas por archivos sin reescribir handlers de ruta ni clases de servicio.",
  "Register datasources with registerTypeOrmDataSource() or TypeOrmDataSource() so xtaskjs knows what to initialize.": "Registra datasources con registerTypeOrmDataSource() o TypeOrmDataSource() para que xtaskjs sepa qué inicializar.",
  "The integration opens datasources, publishes repository and datasource tokens into the container, and makes them injectable to services and controllers.": "La integración abre datasources, publica tokens de repositorio y datasource en el contenedor y los hace inyectables para servicios y controladores.",
  "Datasource connections are destroyed automatically so database shutdown is aligned with the main application lifecycle.": "Las conexiones de datasource se destruyen automáticamente para que el apagado de la base de datos quede alineado con el ciclo de vida principal de la aplicación.",
  "Describe your datasource once and keep entities, migrations, and connection details close to the app entry point.": "Describe tu datasource una sola vez y mantén entidades, migraciones y detalles de conexión cerca del punto de entrada de la app.",
  "Use the xtask TypeORM decorators and tokens to inject repositories into DI-managed services instead of constructing them manually.": "Usa los decoradores y tokens TypeORM de xtask para inyectar repositorios en servicios gestionados por DI en lugar de construirlos manualmente.",
  "Rely on bootstrap and shutdown hooks instead of manual initialize() and destroy() calls across the codebase.": "Confía en los hooks de arranque y apagado en lugar de llamadas manuales a initialize() y destroy() por todo el código.",
  "Register JWT or JWE strategies and decorate protected controllers so the framework knows what authentication surface to publish.": "Registra estrategias JWT o JWE y decora controladores protegidos para que el framework sepa qué superficie de autenticación publicar.",
  "Security initializes authentication and authorization services, wires Passport-compatible flows, and exposes auth context to the route pipeline.": "Security inicializa servicios de autenticación y autorización, conecta flujos compatibles con Passport y expone el contexto auth a la canalización de rutas.",
  "The security lifecycle manager tears down its state together with the rest of the application runtime.": "El gestor del ciclo de vida de security desmonta su estado junto con el resto del runtime de la aplicación.",
  "Call registerJwtStrategy() or registerJweStrategy() before startup, or use their decorator forms in configuration modules.": "Llama a registerJwtStrategy() o registerJweStrategy() antes del arranque, o usa sus formas decorador en módulos de configuración.",
  "Apply Authenticated, Roles, Auth, or AllowAnonymous to controllers and route handlers instead of embedding auth checks in business logic.": "Aplica Authenticated, Roles, Auth o AllowAnonymous a controladores y handlers de ruta en lugar de incrustar comprobaciones auth en la lógica de negocio.",
  "For advanced flows, inject the authentication, authorization, or lifecycle services from the DI container.": "Para flujos avanzados, inyecta los servicios de autenticación, autorización o ciclo de vida desde el contenedor DI.",
  "Register transports, template renderers, and reusable templates while modules load so the mail catalog is ready before requests arrive.": "Registra transports, renderers de plantillas y plantillas reutilizables mientras cargan los módulos para que el catálogo de correo esté listo antes de que lleguen peticiones.",
  "The mailer lifecycle publishes MailerService, named transporters, and optional startup verification into the DI container.": "El ciclo de vida de mailer publica MailerService, transporters con nombre y la verificación opcional de arranque en el contenedor DI.",
  "Transports marked for shutdown are closed automatically so SMTP or test transports do not leak resources.": "Los transports marcados para apagado se cierran automáticamente para que SMTP o los transports de prueba no dejen recursos abiertos.",
  "Start with a default transport, then add named channels like notifications when internal and external emails should be separated.": "Empieza con un transport por defecto y después añade canales con nombre como notifications cuando deban separarse correos internos y externos.",
  "Choose inline templates or file-backed EJS or Handlebars renderers based on how much reuse or designer collaboration you need.": "Elige plantillas inline o renderers EJS o Handlebars basados en archivos según el nivel de reutilización o colaboración con diseño que necesites.",
  "Send template-driven messages from DI-managed application services instead of scattering transport code across controllers.": "Envía mensajes basados en plantillas desde servicios de aplicación gestionados por DI en lugar de dispersar código de transporte por los controladores.",
  "Register locales, formatters, fallback settings, and optional locale resolvers so translation rules are known before request handling starts.": "Registra locales, formatters, ajustes de fallback y resolvers de locale opcionales para que las reglas de traducción se conozcan antes de que empiece el manejo de peticiones.",
  "Internationalization initializes request-aware locale services before controllers and views are resolved, enabling injected translations and formatting from the first request.": "Internationalization inicializa servicios de locale dependientes de la petición antes de que se resuelvan controladores y vistas, habilitando traducciones y formatos inyectados desde la primera petición.",
  "The lifecycle manager releases runtime translation state together with the rest of the application services.": "El gestor del ciclo de vida libera el estado de traducción en tiempo de ejecución junto con el resto de servicios de la aplicación.",
  "Register your locale catalogs, default locale, fallback locale, and any custom formatters during startup.": "Registra tus catálogos de locale, el locale por defecto, el fallback y cualquier formatter personalizado durante el arranque.",
  "Use query parameters, Accept-Language, cookies, or custom resolvers to make the current locale part of request context.": "Usa parámetros de consulta, Accept-Language, cookies o resolvers personalizados para que el locale actual forme parte del contexto de la petición.",
  "Call the injected service inside controllers, views, presenters, and domain helpers so all formatting stays consistent.": "Llama al servicio inyectado dentro de controladores, vistas, presenters y helpers de dominio para que todo el formateo se mantenga consistente.",
  "Decorate service methods with Cron, Every, Interval, or Timeout so the scheduler can discover jobs from the DI container.": "Decora métodos de servicio con Cron, Every, Interval o Timeout para que el scheduler pueda descubrir trabajos desde el contenedor DI.",
  "Scheduler discovery runs after the container is ready, wiring jobs into lifecycle phases and enabling boot-time execution or grouped control.": "El descubrimiento del scheduler se ejecuta después de que el contenedor esté listo, conectando trabajos a las fases del ciclo de vida y habilitando ejecución en arranque o control por grupos.",
  "Recurring timers and cron handles are stopped automatically so background work does not outlive the application process.": "Los temporizadores recurrentes y handles cron se detienen automáticamente para que el trabajo en segundo plano no sobreviva al proceso de la aplicación.",
  "Choose Cron for calendar schedules, Every or Interval for repeated delays, and Timeout for one-shot post-startup work.": "Elige Cron para calendarios, Every o Interval para demoras repetidas y Timeout para trabajo puntual después del arranque.",
  "Use names, groups, retries, timezone overrides, and runOnBoot or runOnInit to reflect operational intent in code.": "Usa nombres, grupos, reintentos, sobrescrituras de zona horaria y runOnBoot o runOnInit para reflejar la intención operativa en el código.",
  "Inject SchedulerService when operators or diagnostics endpoints need to list jobs, run one immediately, or rerun a whole group.": "Inyecta SchedulerService cuando operadores o endpoints de diagnóstico necesiten listar trabajos, ejecutar uno de inmediato o relanzar un grupo completo.",
  "Bootstrap and app": "Arranque y aplicación",
  "DI and components": "DI y componentes",
  "HTTP primitives": "Primitivas HTTP",
  "Routing decorators": "Decoradores de rutas",
  "Lifecycle decorators": "Decoradores de ciclo de vida",
  "Validation and types": "Validación y tipos",
  "Adapter runtime": "Runtime del adaptador",
  "Request and response types": "Tipos de petición y respuesta",
  "Adapter options": "Opciones del adaptador",
  "TypeORM bridge": "Puente TypeORM",
  "Re-exported ORM APIs": "APIs ORM reexportadas",
  "Route decorators": "Decoradores de ruta",
  "Strategy registration": "Registro de estrategias",
  "Injected services": "Servicios inyectados",
  "Transport registration": "Registro de transports",
  "Service and templates": "Servicio y plantillas",
  "Lifecycle surface": "Superficie de ciclo de vida",
  "Configuration and locales": "Configuración y locales",
  "Translation runtime": "Runtime de traducción",
  "Formatting and lifecycle": "Formateo y ciclo de vida",
  "Scheduling decorators": "Decoradores de scheduling",
  "Runtime control": "Control en tiempo de ejecución",
};

const translate = (locale: string, value: string): string => {
  if (!locale.toLowerCase().startsWith("es")) {
    return value;
  }

  return esTranslations[value] || value;
};

export const localizeDocumentationBase = (locale: string, value: {
  readonly title: string;
  readonly repoUrl: string;
  readonly docsPages: readonly DocsPageLike[];
}) => ({
  ...value,
  title: translate(locale, value.title),
  docsPages: value.docsPages.map((page) => ({
    ...page,
    label: translate(locale, page.label),
    description: translate(locale, page.description),
  })),
});

export const localizeHighlights = (locale: string, highlights: readonly DocsHighlightLike[]): readonly DocsHighlightLike[] =>
  highlights.map((highlight) => ({
    ...highlight,
    title: translate(locale, highlight.title),
    text: translate(locale, highlight.text),
  }));

export const localizeStringList = (locale: string, values: readonly string[]): readonly string[] =>
  values.map((value) => translate(locale, value));

export const localizeFlowSteps = (locale: string, steps: readonly DocsFlowStepLike[]): readonly DocsFlowStepLike[] =>
  steps.map((step) => ({
    ...step,
    title: translate(locale, step.title),
    text: translate(locale, step.text),
  }));

export const localizePackageDocs = (locale: string, docs: readonly PackageDocLike[]): readonly PackageDocLike[] =>
  docs.map((doc) => ({
    ...doc,
    tagline: translate(locale, doc.tagline),
    purpose: translate(locale, doc.purpose),
    features: doc.features.map((entry) => translate(locale, entry)),
    integration: doc.integration.map((entry) => translate(locale, entry)),
    exampleTitle: translate(locale, doc.exampleTitle),
  }));

export const localizePackageDeepDive = (locale: string, doc: PackageDeepDiveDocLike): PackageDeepDiveDocLike => ({
  ...doc,
  runtimeChart: doc.runtimeChart.map((entry) => ({
    ...entry,
    label: translate(locale, entry.label),
  })),
  lifecycle: localizeFlowSteps(locale, doc.lifecycle),
  usage: localizeFlowSteps(locale, doc.usage),
});

export const localizePackageApiGroups = (locale: string, groups: readonly PackageApiGroupLike[]): readonly PackageApiGroupLike[] =>
  groups.map((group) => ({
    ...group,
    title: translate(locale, group.title),
  }));

export const localizeCliInstallDocs = (locale: string, docs: readonly CliInstallDocLike[]): readonly CliInstallDocLike[] =>
  docs.map((doc) => ({
    ...doc,
    title: translate(locale, doc.title),
    text: translate(locale, doc.text),
  }));

export const localizeCliCommandDocs = (locale: string, docs: readonly CliCommandDocLike[]): readonly CliCommandDocLike[] =>
  docs.map((doc) => ({
    ...doc,
    summary: translate(locale, doc.summary),
    examples: doc.examples.map((example) => ({
      ...example,
      title: translate(locale, example.title),
    })),
  }));

export const localizeCliOptionGroups = (locale: string, groups: readonly CliOptionGroupLike[]): readonly CliOptionGroupLike[] =>
  groups.map((group) => ({
    ...group,
    title: translate(locale, group.title),
    description: translate(locale, group.description),
    options: group.options.map((option) => ({
      ...option,
      description: translate(locale, option.description),
    })),
  }));

export const localizeSampleDocs = (locale: string, docs: readonly SampleDocLike[]): readonly SampleDocLike[] =>
  docs.map((doc) => ({
    ...doc,
    summary: translate(locale, doc.summary),
    flow: doc.flow.map((entry) => translate(locale, entry)),
  }));

export const localizeDecoratorGroups = (
  locale: string,
  groups: readonly DecoratorGroupLike[]
): readonly DecoratorGroupLike[] =>
  groups.map((group) => ({
    ...group,
    title: translate(locale, group.title),
    description: translate(locale, group.description),
    decorators: group.decorators.map((decorator) => ({
      ...decorator,
      kind: translate(locale, decorator.kind),
      targets: translate(locale, decorator.targets),
      summary: translate(locale, decorator.summary),
      exampleTitle: translate(locale, decorator.exampleTitle),
    })),
  }));
# Configuration Approach

This project uses `@nestjs/config` combined with **Zod** (`src/config/env.validation.schema.ts`) to centralize, validate and type-cast all environment variables in startup.

## Global Config & Caching

In `src/app.module.ts`, `ConfigModule.forRoot()` is registered with:

* **isGlobal: true** - Makes `ConfigService` available across all modules without importing `ConfigModule` everywhere.
* **validationSchema** - Uses Zod schema to validate and coerce environment variables before the app boots.
* **cache: true** - Caches configuration values in memory so reading `process.env` repeatedly is avoided.

## Validation and Type Coercion with Zod

Since environment variables are always strings, I used `z.coerce.number()` for numeric values (`PORT`, `REDIS_PORT`, and queue settings) and `z.enum()` for restricted values (`NODE_ENV`, `LOGGING_LEVEL`):

* **Required variables** - `PROVIDER_VEHICLES_URL` has no default value and requires a non-empty string (`z.string().trim().min(1)`), failing immediately at boot if missing.
* **Safe defaults for local development** - Variables like `PORT` (`3000`), `DB_CONNECTION_URI` (`mongodb://localhost:27017/challenge-db`), `REDIS_HOST` (`localhost`), `REDIS_PORT` (`6379`) and BullMQ rate-limit parameters have default values so running the service locally needs minimal setup.

## Asynchronous Module Registration

Instead of reading `process.env` directly inside services or modules, third-party modules use `forRootAsync` / `registerAsync` injecting `ConfigService`:

* **DbConfigModule** - Injects `ConfigService` in `MongooseModule.forRootAsync` to set `DB_CONNECTION_URI`.
* **AppLoggerModule** - Injects `ConfigService` in `LoggerModule.forRootAsync` to configure `NODE_ENV` and `LOGGING_LEVEL`.
* **VehicleIngesterModule** - Injects `ConfigService` into:
  * `HttpClientModule.registerAsync` to configure `PROVIDER_VEHICLES_URL`.
  * `BullModule.forRootAsync` to configure `REDIS_HOST` and `REDIS_PORT`.
  * `BullModule.registerQueueAsync` to configure rate limiting (`INGESTION_RATE_LIMIT_MAX`, `INGESTION_RATE_LIMIT_DURATION_MS`) and retries (`INGESTION_MAX_ATTEMPTS`).

## Local vs Docker Environment Files

* **Local console run** - Reads `.env` from the root directory (created from `.env.example`), pointing to `localhost` for MongoDB and Redis.
* **Docker compose run** - In `docker/docker-compose.yml`, the `backend` container loads `.env.example` via `env_file` and overrides `DB_CONNECTION_URI` and `REDIS_HOST` to point to the internal container hostnames (`mongodb` and `redis`).


# Production Readiness Notes

## Scope covered
- Teams management
- Employees / users administration
- Settings configuration
- Audit trail exposure
- Permission-aware navigation
- Build and test verification gate

## Security review
- All new API routes are protected by authentication and RBAC middleware.
- Sensitive management endpoints require explicit `users.manage` or `settings.manage` permissions.
- Audit logs are write-only through the existing audit helper and readable by authorized administrators/managers.

## Performance review
- Backend queries are intentionally lightweight and limited to 100 audit entries per request.
- The client dashboard and reporting views remain server-driven to avoid local state drift.
- Large UI chunks remain a future optimization area and are not blocking the production-readiness snapshot.

## Business consistency
- Employee/user flows remain centralized under the existing user model.
- Teams and settings are structured as management surfaces rather than independent business workflows, which keeps the ERP coherent with the current RBAC design.

## Verification proof
- Backend: `npm run build`
- Backend tests: `npx tsx --test src/helpers/apiResponse.test.ts src/services/dailyClosure.service.test.ts src/utils/permissions.test.ts src/utils/token.test.ts`
- Frontend: `npm run build`

## Production deployment checklist
- For the Vercel frontend + Render API + managed MySQL deployment, follow [DEPLOYMENT_VERCEL_RENDER_MYSQL.md](./DEPLOYMENT_VERCEL_RENDER_MYSQL.md). Neon is PostgreSQL and is not compatible with the current MySQL driver/schema without a separate database migration.

### Docker Compose deployment

- Set unique production values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in a private `server/.env`; set a separate strong `MYSQL_ROOT_PASSWORD` in the deployment environment. Do not deploy the example file's blank secrets or reuse development credentials.
- Start the production Compose stack with `docker compose --env-file server/.env -f docker-compose.prod.yml up -d --build`. MySQL 8.4 listens on host port 3307; the backend uses `mysql:3306`. The backend waits for MySQL and MongoDB health checks.
- MongoDB remains the migration source on host port 27018 and its existing `mongo-data` volume must remain attached. Back up MongoDB and keep that volume; do not run `docker compose down -v` or remove/rename the volume as part of this rollout. MySQL persists separately in `kiosk-mysql-data-prod`.
- Compose provisions the MySQL service and credentials, but does not transfer MongoDB records. Do not cut over until the explicit migration below has been reviewed and verified.
- The backend runtime image includes `migrations/` (including `mysql-schema.sql`) for relational schema initialization. Schema initialization is not a MongoDB data migration; use the explicit dry-run/apply procedure below.

### MongoDB-to-MySQL staged migration

The migration reads MongoDB and writes MySQL only with `--apply`. First ensure the production stack is running and healthy, the private `server/.env` contains the production database credentials, and a recoverable MongoDB backup exists. From the `server/` directory, run the dry-run and inspect its source/row counts; only then run apply:

```bash
MONGO_URI=mongodb://127.0.0.1:27018/fuelstation_erp DB_HOST=127.0.0.1 DB_PORT=3307 npm run migrate:mongodb:mysql -- --dry-run
MONGO_URI=mongodb://127.0.0.1:27018/fuelstation_erp DB_HOST=127.0.0.1 DB_PORT=3307 npm run migrate:mongodb:mysql -- --apply
```

These commands use `DB_USER`, `DB_PASSWORD`, and `DB_NAME` from `server/.env`; the migration script loads that file. `--dry-run` reads/counts MongoDB documents without connecting to MySQL or writing data. `--apply` explicitly creates/updates the relational schema and imports/verifies records; it leaves MongoDB unchanged. Validate the migrated records and application behavior before changing production traffic. Retain the MongoDB service, volume, and backup through the rollback window; retire them only in a separately reviewed cleanup after cutover is verified.

- Ensure the API is exposed behind TLS and a reverse proxy.
- Seed initial admin accounts and production settings.
- Validate backup, restore, and log retention strategy before Go-Live.

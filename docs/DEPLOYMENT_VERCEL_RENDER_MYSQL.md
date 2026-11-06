# Deploying to Vercel and Render with MySQL

## Database choice

This project currently uses MySQL (`mysql2`) and a MySQL-specific schema. Neon is a PostgreSQL service and is not a compatible database for this application without a separate PostgreSQL migration. Keep a managed MySQL database for this deployment. Choose a provider that permits connections from Render and supports TLS; place the database and Render service in the same region where possible.

The application creates/updates its MySQL schema when it connects. It does not import data from a local database or MongoDB. A newly provisioned database starts without the existing business records.

## 1. Provision the MySQL database

Create a production database and a dedicated application user with access only to that database. Configure the provider's network access controls to permit the Render service to connect. Do not expose MySQL to all addresses unless the provider requires it and a stronger network control is in place.

Copy the provider's connection values for `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Enable TLS with `DB_SSL=true`. If the provider supplies its own CA certificate, set `DB_SSL_CA` to the PEM certificate; otherwise leave it empty and use Node's trusted certificate authorities.

Do not use a Neon connection string in these MySQL settings.

## 2. Create the Render API service

Create a Render Blueprint from the repository root and use [render.yaml](../render.yaml), or create a Node web service manually with:

- Root directory: `server`
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/api/v1/health`

Set the `DB_*` values from the MySQL provider. Set `CORS_ORIGIN` to the exact Vercel production origin, for example `https://your-project.vercel.app` (no trailing slash). Multiple exact origins can be comma-separated. Do not use a wildcard for credentialed CORS.

Generate two different random secrets of at least 32 characters for `JWT_SECRET` and `JWT_REFRESH_SECRET`. Set them only in Render's secret environment variables; never commit them to the repository.

On the first deployment, set `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_EMAIL`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` to create the first administrator. The application no longer seeds the known demo admin credentials in production. After confirming the admin account works, remove the `BOOTSTRAP_ADMIN_*` variables from Render. The database retains the created admin.

The API health check returns HTTP 503 until its database connection succeeds. Resolve the database network, credentials, or TLS settings if Render reports an unhealthy service.

## 3. Deploy the Vercel frontend

Create a Vercel project from the same repository:

- Root directory: `client`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

The Vercel configuration proxies `/api/*` requests to `https://kiosk-tunisia.onrender.com/api/*` before the SPA fallback. This allows the client default `/api/v1` API URL to work without a `VITE_API_URL` setting. If your Render service has a different URL, update the API rewrite destination in [client/vercel.json](../client/vercel.json) and redeploy Vercel. Alternatively, set the build-time `VITE_API_URL` to your Render URL followed by `/api/v1`; redeploy after changing it. The final rewrite sends application routes to `index.html`.

Once Vercel has assigned the final production domain, ensure Render's `CORS_ORIGIN` exactly matches it, then redeploy the API if needed. If using a custom frontend domain, include that origin as well.

## 4. Verify deployment

1. Open `https://your-api.onrender.com/api/v1/health`. Confirm HTTP 200 and `system.database.connected: true`.
2. Open the Vercel site and sign in with the production bootstrap administrator.
3. Configure the production station, products, pumps, users, and roles through the application.
4. Verify login, refresh, and logout, then create and close a test shift using clearly identified test records before production use.
5. Configure database backups and test a restore. Keep the existing MongoDB or local MySQL data untouched until any required data transfer is separately planned and verified.

## Operational notes

- Never enable `SEED_RESET`, use demo credentials, or run destructive seed/reset commands against production.
- MongoDB-to-MySQL migration is a separate, explicit operation; deploying this service does not migrate MongoDB or copy local MySQL records.
- Render's local filesystem is ephemeral. If persistent user-uploaded files are added or enabled, use object storage rather than relying on the service disk.
- Keep secrets in provider environment settings, not Vercel's frontend variables or source control. `VITE_*` variables are included in browser assets and must not contain credentials.

const apiBaseUrl = new URL(process.env.TEST_API_URL || 'http://localhost:5000/api/v1');
if (!apiBaseUrl.pathname.endsWith('/')) apiBaseUrl.pathname += '/';

if (!['localhost', '127.0.0.1', '::1'].includes(apiBaseUrl.hostname)) {
  throw new Error('Integration smoke tests are restricted to localhost. Use a local test stack.');
}

const healthResponse = await fetch(new URL('health', apiBaseUrl));
if (!healthResponse.ok) {
  throw new Error(`Health endpoint returned HTTP ${healthResponse.status}`);
}

const health = await healthResponse.json();
if (health.system?.database?.connected !== true) {
  throw new Error('API is running but its configured database is not connected.');
}

console.log(`API and database are healthy (${health.system.database.name}).`);

const protectedResponse = await fetch(new URL('stations', apiBaseUrl));
if (protectedResponse.status !== 401) {
  throw new Error(`Unauthenticated GET /stations returned HTTP ${protectedResponse.status}; expected 401.`);
}

console.log('Protected station endpoint rejects unauthenticated requests.');

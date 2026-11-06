const apiBaseUrl = new URL(process.env.TEST_API_URL || 'http://localhost:5000/api/v1');
if (!apiBaseUrl.pathname.endsWith('/')) apiBaseUrl.pathname += '/';

if (!['localhost', '127.0.0.1', '::1'].includes(apiBaseUrl.hostname)) {
  throw new Error('Security smoke tests are restricted to localhost. Use a local test stack.');
}

for (const authorization of [undefined, 'Bearer invalid-test-token']) {
  const headers = authorization ? { Authorization: authorization } : undefined;
  const response = await fetch(new URL('stations', apiBaseUrl), { headers });
  if (response.status !== 401) {
    throw new Error(`Protected endpoint returned HTTP ${response.status} for an invalid session; expected 401.`);
  }
}

console.log('Protected station endpoint rejects missing and invalid bearer tokens.');

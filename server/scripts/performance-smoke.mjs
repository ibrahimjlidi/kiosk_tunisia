const apiBaseUrl = new URL(process.env.PERF_API_URL || 'http://localhost:5000/api/v1/health');
const requests = Number(process.env.PERF_REQUESTS || 40);
const concurrency = Number(process.env.PERF_CONCURRENCY || 4);

if (!['localhost', '127.0.0.1', '::1'].includes(apiBaseUrl.hostname)) {
  throw new Error('Performance smoke tests are restricted to localhost. Do not target production.');
}
if (!Number.isInteger(requests) || requests < 1 || requests > 200) {
  throw new Error('PERF_REQUESTS must be an integer between 1 and 200.');
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 10) {
  throw new Error('PERF_CONCURRENCY must be an integer between 1 and 10.');
}

const latencies = [];
let nextRequest = 0;
const startedAt = performance.now();

async function worker() {
  while (nextRequest < requests) {
    nextRequest += 1;
    const requestStartedAt = performance.now();
    const response = await fetch(apiBaseUrl);
    latencies.push(performance.now() - requestStartedAt);
    if (!response.ok) throw new Error(`Health endpoint returned HTTP ${response.status}`);
    await response.body?.cancel();
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, requests) }, worker));
const elapsedMs = performance.now() - startedAt;
latencies.sort((a, b) => a - b);
const percentile = (fraction) => latencies[Math.ceil(latencies.length * fraction) - 1];

console.log(`Local health endpoint: ${requests} requests, concurrency ${concurrency}`);
console.log(`Elapsed: ${elapsedMs.toFixed(1)} ms; throughput: ${(requests * 1000 / elapsedMs).toFixed(1)} requests/s`);
console.log(`Latency: p50 ${percentile(0.5).toFixed(1)} ms; p95 ${percentile(0.95).toFixed(1)} ms; max ${latencies.at(-1).toFixed(1)} ms`);

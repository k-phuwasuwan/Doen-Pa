import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const requireFromNext = createRequire(require.resolve('next/package.json'));
const nextEnv = requireFromNext('@next/env');

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

try {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) throw new Error('missing-config');
  const endpoint = new URL('/auth/v1/settings', url);
  const response = await fetch(endpoint, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    console.error(`Supabase Auth connection failed (HTTP ${response.status}). Check the project URL and publishable key.`);
    process.exitCode = 1;
  } else {
    console.log('Supabase Auth connection OK. No user data was created or changed.');
  }
} catch {
  console.error('Could not connect to Supabase Auth. Check .env.local and network access.');
  process.exitCode = 1;
}

import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const output = mkdtempSync(join(tmpdir(), 'doen-pa-tests-'));
try {
  const compile = spawnSync(process.execPath, [
    'node_modules/typescript/bin/tsc', '--project', 'tsconfig.test.json', '--outDir', output,
  ], { stdio: 'inherit' });
  if (compile.status !== 0) process.exitCode = compile.status ?? 1;
  else {
    const tests = readdirSync(join(output, 'tests')).filter((file) => file.endsWith('.test.js'));
    const run = spawnSync(process.execPath, ['--test', ...tests.map((file) => join(output, 'tests', file))], { stdio: 'inherit' });
    process.exitCode = run.status ?? 1;
  }
} finally {
  rmSync(output, { recursive: true, force: true });
}

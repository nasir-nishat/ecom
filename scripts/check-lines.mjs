// Enforces the README's file-size rule: warn at 400 lines, fail at 500.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'supabase', 'scripts'];
const EXT = /\.(ts|tsx|astro|mjs|sql|css)$/;
const WARN = 400, FAIL = 500;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.test(name)) yield p;
  }
}

let failed = false;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n').length;
    if (lines > FAIL) { console.error(`✖ ${file}: ${lines} lines (max ${FAIL})`); failed = true; }
    else if (lines > WARN) console.warn(`⚠ ${file}: ${lines} lines — split before it hits ${FAIL}`);
  }
}
if (failed) process.exit(1);
console.log('✓ all files under the line limit');

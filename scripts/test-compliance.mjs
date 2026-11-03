import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../src/lib/compliance/guards.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const exports = {};
runInNewContext(outputText, { exports, require: () => ({ isProduction: () => true }) });
for (const query of ['singles only', 'SINGLES ONLY', 'no kids', 'family', 'race', 'religion']) {
  assert.equal(exports.isFairHousingSafe(query), false, `Guard must reject ${query}`);
}
assert.equal(exports.isFairHousingSafe('two bedrooms in Phoenix'), true);
console.log('PASS: six prohibited inputs rejected; ordinary city query allowed.');

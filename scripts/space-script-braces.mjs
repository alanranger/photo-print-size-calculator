/**
 * Squarespace 7.0 strips `{…}` with no inner whitespace. Space every
 * `${ expr }` and control-flow `{` inside the calculator <script>.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const file = join(root, '..', 'index.html');
const html = readFileSync(file, 'utf8');
const start = html.indexOf('<script>\n');
const end = html.lastIndexOf('\n</script>');
if (start < 0 || end < start) throw new Error('calculator script not found');
const before = html.slice(0, start + '<script>\n'.length);
const after = html.slice(end);
let js = html.slice(start + '<script>\n'.length, end);
js = js.replace(/\$\{([^}]*)\}/g, (_, inner) => `\${ ${inner.trim()} }`);
js = js.replace(/\$\{(?!\s)/g, '${ ');
js = js.replace(/=>\{/g, '=> {');
js = js.replace(/\)\{/g, ') {');
js = js.replace(/else\{/g, 'else {');
js = js.replace(/try\{/g, 'try {');
js = js.replace(/catch\{/g, 'catch {');
js = js.replace(/finally\{/g, 'finally {');
js = js.replace(/do\{/g, 'do {');
js = js.replace(/function\(/g, 'function (');
js = js.replace(/function\s*\(\)\s*\{/g, 'function () {');
writeFileSync(file, before + js + after, 'utf8');
const leftover = js.match(/\$\{[^ ]|=>\{|\)\{|else\{/g) || [];
if (leftover.length) throw new Error(`unspaced braces remain: ${leftover.join(', ')}`);
console.log('spaced calculator script braces');

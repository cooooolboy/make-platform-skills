#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(process.argv[2] ?? path.join(scriptDir, '..'));

const read = (relativePath) => {
  const filePath = path.join(repoRoot, relativePath);
  assert.ok(
    fs.existsSync(filePath),
    `Expected ${relativePath} under repo root ${repoRoot}`,
  );
  return fs.readFileSync(filePath, 'utf8');
};

const skill = read('skills/canvas-table-integration/SKILL.md');
const makeDisplay = read(
  'skills/canvas-table-integration/references/make-field-display-patterns.md',
);
const columnPatterns = read(
  'skills/canvas-table-integration/references/column-patterns.md',
);

assert.match(
  makeDisplay,
  /(¥1,000\.00|￥1,000\.00|\$1,000\.00)/,
  'Make field display docs must include a concrete preformatted currency example',
);
assert.match(
  makeDisplay,
  /(boundary adapter|边界适配|边界层)[\s\S]*(currency|Currency|金额)[\s\S]*(symbol|币种|货币符号|¥|￥|\$)[\s\S]*(thousands|千分|分隔符|,)/i,
  'Currency normalization must happen at the boundary adapter and remove symbols plus thousands separators',
);
assert.match(
  makeDisplay,
  /(strip|remove|去掉|移除|清洗)[\s\S]*(currency symbols|币种符号|货币符号|¥|￥|\$)[\s\S]*(thousands separators|千分位|千分|逗号|,)/i,
  'Currency rules must explicitly strip currency symbols and thousands separators before parsing',
);
assert.match(
  makeDisplay,
  /(Number\('¥1,000\.00'\)|Number\("¥1,000\.00"\))[\s\S]*(must not|do not|禁止|不得|不能)/i,
  'Docs must explicitly forbid Number("¥1,000.00") style parsing',
);
assert.match(
  makeDisplay,
  /(finite|Number\.isFinite|有限数字)[\s\S]*(format|格式化|render|渲染)/i,
  'Docs must still require finite-number validation before formatting/rendering',
);
assert.match(
  makeDisplay,
  /(Testing|测试)[\s\S]*(¥1,000\.00|￥1,000\.00|\$1,000\.00)[\s\S]*(1000|finite|有限数字)/i,
  'Testing guidance must cover preformatted currency strings normalizing to finite numbers',
);
assert.match(
  `${skill}\n${columnPatterns}`,
  /(preformatted|预格式化)[\s\S]*(currency|金额|Currency)[\s\S]*(boundary adapter|边界适配|边界层)/i,
  'Top-level or column docs must route preformatted currency cleanup to a boundary adapter',
);
for (const line of `${skill}\n${makeDisplay}\n${columnPatterns}`.split('\n')) {
  if (/Number\((value|rawValue|amount)\)\.toLocaleString\(\)/.test(line)) {
    assert.match(
      line,
      /(Do not|must not|禁止|不得|不能)/i,
      'Docs must not show direct Number(value).toLocaleString() as the currency path',
    );
  }
}

console.log('canvas table currency normalization contract passed');

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

const skill = read('skills/make-app-filter/SKILL.md');
const uiStyle = read('skills/make-app-filter/references/ui-style.md');
const testing = read('skills/make-app-filter/references/testing-and-pitfalls.md');
const packageIntegration = read('skills/make-app-filter/references/package-integration.md');
const makeui = read('skills/makeui/SKILL.md');
const readme = read('README.md');

assert.match(
  skill,
  /BizFinancePoc[\s\S]*(fixed|固定|三段|header|footer|body)/i,
  'make-app-filter must name BizFinancePoc as the fixed advanced-filter panel layout baseline',
);
assert.match(
  skill,
  /(高级筛选|advanced filter)[\s\S]*(头部|header)[\s\S]*(body|中间|条件区)[\s\S]*(底部|footer)[\s\S]*(必须|must|交付阻断|readiness blocker)/i,
  'make-app-filter must make the three-region advanced-filter panel layout mandatory',
);

assert.match(
  uiStyle,
  /(顶部固定|fixed header|header)[\s\S]*(左侧|left)[\s\S]*`?筛选`?[\s\S]*(右侧|right)[\s\S]*`?清空所有`?/i,
  'UI style must require a fixed header with 筛选 on the left and 清空所有 on the right',
);
assert.match(
  uiStyle,
  /(中间|body|condition)[\s\S]*(条件|condition)[\s\S]*(滚动|scroll|overflow)/i,
  'UI style must require the condition body to be the scrollable region',
);
assert.match(
  uiStyle,
  /(host|宿主)[\s\S]*(CSS|样式)[\s\S]*(advanced-filter__body)[\s\S]*(overflow-y|overflow)[\s\S]*(auto)/i,
  'UI style must make host CSS responsible for .advanced-filter__body overflow-y auto',
);
assert.match(
  uiStyle,
  /(底部固定|fixed footer|footer)[\s\S]*(左侧|left)[\s\S]*`?\+ 添加条件`?[\s\S]*`?\+ 添加条件组`?[\s\S]*(右侧|right)[\s\S]*`?确认`?/i,
  'UI style must require a fixed footer with add actions on the left and confirm on the right',
);
assert.match(
  uiStyle,
  /(单一滚动|全弹层滚动|full-panel scroll|controls scroll away|按钮.*滚走)[\s\S]*(交付阻断|readiness blocker|not ready|不得.*交付)/i,
  'UI style must reject single-scroll panels where controls scroll away',
);

assert.match(
  testing,
  /(header|头部)[\s\S]*(footer|底部)[\s\S]*(remain visible|始终可见|不随.*滚动)/i,
  'Testing checks must verify header and footer stay visible while conditions scroll',
);
assert.match(
  testing,
  /(缺少|missing|没有)[\s\S]*(顶部|header)[\s\S]*(底部|footer)[\s\S]*(阻断|blocker|回归|regression)/i,
  'Testing pitfalls must flag missing fixed header/footer as a blocker or regression',
);

assert.match(
  makeui,
  /(高级筛选|advanced filter)[\s\S]*(三段|固定|header|footer|body)[\s\S]*(make-app-filter)/i,
  'MakeUI must route advanced-filter fixed panel layout details to make-app-filter',
);

for (const [name, content] of [
  ['make-app-filter/SKILL.md', skill],
  ['testing-and-pitfalls.md', testing],
  ['package-integration.md', packageIntegration],
  ['README.md', readme],
]) {
  assert.match(
    content,
    /@qfei-design\/make-filter@\^0\.2\.2/,
    `${name} must require @qfei-design/make-filter@^0.2.2 as the validated fixed-panel baseline`,
  );
  assert.doesNotMatch(
    content,
    /@qfei-design\/make-filter@\^0\.1\.4|older than `?0\.1\.4`?|installed `?0\.1\.5\+`?|`0\.1\.4`/i,
    `${name} must not keep the old package baseline`,
  );
}

console.log('make filter panel layout contract passed');

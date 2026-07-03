#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, '..');

const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
const componentStructure = fs.readFileSync(
  path.join(skillDir, 'references', 'component-structure.md'),
  'utf8',
);

const combined = `${skill}\n${componentStructure}`;

assert.match(
  combined,
  /(readiness blocker|交付阻断|阻断项)/,
  'componentization must be documented as a readiness blocker',
);

assert.match(
  combined,
  /(do not report|不得报告|不能报告)[\s\S]*(ready|complete|完成|交付)/i,
  'docs must forbid reporting completion before componentization is satisfied',
);

const requiredBoundaries = [
  'App.tsx',
  'pages/',
  'components/',
  'hooks/',
  'lib/service-api',
  'table host',
  'toolbar',
  'Drawer',
  'field display',
  'table column',
];

for (const boundary of requiredBoundaries) {
  assert.match(
    combined,
    new RegExp(boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `componentization guidance must mention ${boundary}`,
  );
}

assert.match(
  combined,
  /App\.tsx[\s\S]*(must not|不得|不能)[\s\S]*(data fetching|数据加载|schema|table column|表格列|Drawer|抽屉)/i,
  'App.tsx must be explicitly forbidden from owning business implementation logic',
);

console.log('makeui component structure contract passed');

#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(process.argv[2] ?? path.join(scriptDir, '..'));

const makeuiFiles = [
  'skills/makeui/SKILL.md',
  'skills/makeui/references/component-structure.md',
  'skills/makeui/references/component-usage.md',
];

const canvasFiles = [
  'skills/canvas-table-integration/SKILL.md',
  'skills/canvas-table-integration/references/make-field-display-patterns.md',
  'skills/canvas-table-integration/references/track-workflows.md',
];

const requiredFieldTypes = [
  'Make.Field.ID',
  'Make.Field.Text',
  'Make.Field.TextArea',
  'Make.Field.URL',
  'Make.Field.Number',
  'Make.Field.Currency',
  'Make.Field.Percent',
  'Make.Field.Date',
  'Make.Field.DateTime',
  'Make.Field.DateRange',
  'Make.Field.SingleSelect',
  'Make.Field.MultiSelect',
  'Make.Field.SingleUser',
  'Make.Field.MultiUser',
  'Make.Field.SingleDepartment',
  'Make.Field.MultiDepartment',
  'Make.Field.File',
  'Make.Field.Lookup',
];

const read = (relativePath) => {
  const filePath = path.join(repoRoot, relativePath);
  assert.ok(
    fs.existsSync(filePath),
    `Expected ${relativePath} under repo root ${repoRoot}`,
  );
  return fs.readFileSync(filePath, 'utf8');
};

for (const relativePath of makeuiFiles) {
  const content = read(relativePath);
  assert.match(
    content,
    /apps\/ui\/src\/lib\/make-field-types\.ts/,
    `${relativePath} must require a shared Make field type registry in apps/ui`,
  );
  assert.match(
    content,
    /registry[\s\S]*(form|detail|table|filter|editor)/i,
    `${relativePath} must require field-type consumers to share the registry`,
  );
}

for (const relativePath of canvasFiles) {
  const content = read(relativePath);
  assert.match(
    content,
    /apps\/ui\/src\/lib\/make-field-types\.ts/,
    `${relativePath} must point Track C to the shared field type registry`,
  );
}

const combinedCanvasDocs = canvasFiles.map(read).join('\n');
assert.match(
  combinedCanvasDocs,
  /displayGroup[\s\S]*renderKind[\s\S]*width[\s\S]*align/,
  'Track C docs must describe the registry metadata used by CanvasTable columns',
);

for (const fieldType of requiredFieldTypes) {
  assert.match(
    combinedCanvasDocs,
    new RegExp(fieldType.replaceAll('.', '\\.')),
    `Track C docs must cover ${fieldType}`,
  );
}

console.log('make field type registry contract passed');

#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, '..');

const files = [
  path.join(skillDir, 'SKILL.md'),
  path.join(skillDir, 'references', 'app-shell-layout.md'),
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relative = path.relative(process.cwd(), file);

  assert.match(
    content,
    /current-context[\s\S]*userId[\s\S]*avatar[\s\S]*name/,
    `${relative} must document current-context userId/avatar/name normalization`,
  );
  assert.match(
    content,
    /name[\s\S]*userName[\s\S]*displayName[\s\S]*userId[\s\S]*(identity|身份)/,
    `${relative} must make userId an identity fallback, not the preferred display name`,
  );
  assert.match(
    content,
    /avatar[\s\S]*avatarUrl[\s\S]*avatarURL[\s\S]*photoURL/,
    `${relative} must document common avatar field aliases`,
  );
}

console.log('makeui current user contract passed');

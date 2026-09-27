const fs = require('fs');
const { execSync } = require('child_process');

const packagePath = 'package.json';

const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8')
);

const [major, minor, patch] = packageJson.version
  .split('.')
  .map(Number);

const nextMinor = minor + 1;

packageJson.version = `${major}.${nextMinor}.0`;

fs.writeFileSync(
  packagePath,
  JSON.stringify(packageJson, null, 2) + '\n'
);

execSync('git add package.json');

console.log(`\nKripin version bumped to ${major}.${nextMinor}\n`);
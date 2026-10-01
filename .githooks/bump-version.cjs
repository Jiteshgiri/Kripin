const fs = require('fs');
const { execSync } = require('child_process');

const packagePath = 'package.json';

const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8')
);

const [major, minor] = packageJson.version
  .split('.')
  .map(Number);

const nextVersion = `${major}.${minor + 1}.0`;

packageJson.version = nextVersion;

fs.writeFileSync(
  packagePath,
  JSON.stringify(packageJson, null, 2) + '\n'
);

execSync('git add package.json');

console.log(`Kripin version bumped automatically: ${packageJson.version}`);

const fs = require('fs');
const path = require('path');

const root = process.cwd();

const packageJson = JSON.parse(
  fs.readFileSync(
    path.join(root, 'package.json'),
    'utf8'
  )
);

const version = packageJson.version;

if (!version) {
  throw new Error('package.json version not found.');
}

const androidGradlePath = path.join(
  root,
  'android',
  'app',
  'build.gradle'
);

if (!fs.existsSync(androidGradlePath)) {
  console.log(
    `Android project not found. Skipping Android version sync for ${version}.`
  );
  process.exit(0);
}

const [major, minor, patch] = version
  .split('.')
  .map(Number);

const versionCode =
  major * 10000 +
  minor * 100 +
  patch;

let gradle = fs.readFileSync(
  androidGradlePath,
  'utf8'
);

gradle = gradle.replace(
  /versionCode\s+\d+/,
  `versionCode ${versionCode}`
);

gradle = gradle.replace(
  /versionName\s+"[^"]+"/,
  `versionName "${version}"`
);

fs.writeFileSync(
  androidGradlePath,
  gradle
);

console.log(
  `Android version synced: ${version} (versionCode ${versionCode})`
);

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const root = process.cwd();

const packageJsonPath = path.join(root, 'package.json');
const distPath = path.join(root, 'dist');
const publicOtaPath = path.join(root, 'public', 'ota');
const bundlesPath = path.join(publicOtaPath, 'bundles');

const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf8')
);

const version = packageJson.version;

if (!version) {
  throw new Error('Package version not found.');
}

if (!fs.existsSync(distPath)) {
  console.error('dist folder not found. Running build first...');

  execSync('npm run build', {
    stdio: 'inherit',
  });
}

if (!fs.existsSync(distPath)) {
  throw new Error('Build failed: dist folder does not exist.');
}

fs.mkdirSync(bundlesPath, {
  recursive: true,
});

const zipName = `${version}.zip`;
const zipPath = path.join(bundlesPath, zipName);

// Remove old ZIP for the same version.
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log(`\nPreparing Kripin OTA ${version}...`);

if (process.platform === 'win32') {
  const escapedDist = distPath.replace(/'/g, "''");
  const escapedZip = zipPath.replace(/'/g, "''");

  const command =
    `Compress-Archive -Path '${escapedDist}\\*' ` +
    `-DestinationPath '${escapedZip}' -Force`;

  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "${command}"`,
    {
      stdio: 'inherit',
    }
  );
} else {
  execSync(
    `cd "${distPath}" && zip -r "${zipPath}" .`,
    {
      stdio: 'inherit',
    }
  );
}

// Generate SHA-256 checksum.
const checksum = crypto
  .createHash('sha256')
  .update(fs.readFileSync(zipPath))
  .digest('hex');

const manifest = {
  version,
  bundleUrl: `/ota/bundles/${zipName}`,
  checksum,
};

const manifestPath = path.join(
  publicOtaPath,
  'latest.json'
);

fs.writeFileSync(
  manifestPath,
  JSON.stringify(manifest, null, 2) + '\n'
);

console.log('\nKripin OTA prepared successfully.');
console.log(`Version: ${version}`);
console.log(`Bundle: ${zipPath}`);
console.log(`SHA-256: ${checksum}`);
console.log(`Manifest: ${manifestPath}`);
console.log(
  `URL: https://kripin.vercel.app/ota/bundles/${zipName}\n`
);
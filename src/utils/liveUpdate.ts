import { Capacitor } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

interface OtaManifest {
  version: string;
  bundleUrl: string;
  checksum?: string;
}

const OTA_MANIFEST_URL =
  'https://kripin-ota.vercel.app/latest.json';

const isNewerVersion = (
  latest: string,
  current: string
): boolean => {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
};

export const checkForLiveUpdate = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LiveUpdate.ready();

    const currentBundle = await LiveUpdate.getCurrentBundle();

    const currentVersion =
      currentBundle.bundleId || '0.0.0';

    const response = await fetch(
      `${OTA_MANIFEST_URL}?t=${Date.now()}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.log(
        '[Kripin OTA] Manifest request failed:',
        response.status
      );
      return;
    }

    const manifest =
      (await response.json()) as OtaManifest;

    if (!manifest.version || !manifest.bundleUrl) {
      console.log(
        '[Kripin OTA] Invalid update manifest.'
      );
      return;
    }

    console.log(
      `[Kripin OTA] Current: ${currentVersion}, Latest: ${manifest.version}`
    );

    if (!isNewerVersion(manifest.version, currentVersion)) {
      console.log(
        '[Kripin OTA] App is already up to date.'
      );
      return;
    }

    const bundleUrl = new URL(
      manifest.bundleUrl,
      OTA_MANIFEST_URL
    ).toString();

    console.log(
      `[Kripin OTA] Downloading ${manifest.version}...`
    );

    await LiveUpdate.downloadBundle({
      url: bundleUrl,
      bundleId: manifest.version,
      ...(manifest.checksum
        ? {
            checksum: manifest.checksum,
          }
        : {}),
    });

    await LiveUpdate.setNextBundle({
      bundleId: manifest.version,
    });

    console.log(
      `[Kripin OTA] ${manifest.version} downloaded successfully.`
    );

    console.log(
      '[Kripin OTA] Applying update automatically...'
    );

    await LiveUpdate.reload();
  } catch (error) {
    console.log(
      '[Kripin OTA] Update check failed:',
      error
    );
  }
};


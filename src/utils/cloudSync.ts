const CLOUD_SYNC_CUTOFF_KEY = 'kripin_cloud_sync_started_at';

const API_BASE_URL = 'http://localhost:3001';

export interface CloudUserProfile {
  userId: string;
  name: string;
  mobile?: string;
  occupation?: string;
  avatarUrl?: string;
}

export interface CloudTransaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  dateTimestamp: number;
  createdAt?: number;
  isIncome: boolean;
  merchant?: string;
  paymentMode?: string;
  isAutoDebited?: boolean;
}

export const getCloudSyncCutoff = (): number | null => {
  const saved = localStorage.getItem(CLOUD_SYNC_CUTOFF_KEY);

  if (!saved) {
    return null;
  }

  const timestamp = Number(saved);

  return Number.isFinite(timestamp) ? timestamp : null;
};

export const initializeCloudSync = (): number => {
  const existing = getCloudSyncCutoff();

  if (existing !== null) {
    return existing;
  }

  const now = Date.now();

  localStorage.setItem(
    CLOUD_SYNC_CUTOFF_KEY,
    String(now)
  );

  console.log(
    `[Kripin Cloud] Sync activated at ${new Date(now).toISOString()}`
  );

  return now;
};

const isCloudSyncActive = (): boolean => {
  return getCloudSyncCutoff() !== null;
};

export const syncUserProfile = async (
  profile: CloudUserProfile
): Promise<boolean> => {
  if (!isCloudSyncActive()) {
    return false;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/users/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      }
    );

    if (!response.ok) {
      console.error(
        '[Kripin Cloud] User sync failed:',
        response.status
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      '[Kripin Cloud] User sync error:',
      error
    );

    return false;
  }
};

export const syncTransaction = async (
  transaction: CloudTransaction & {
    createdAt?: number;
  }
): Promise<boolean> => {
  const cutoff = getCloudSyncCutoff();

  if (cutoff === null) {
    return false;
  }

  /*
   * IMPORTANT:
   * Only transactions created after cloud sync activation
   * are allowed to reach the server.
   *
   * Old transactions may have an old/missing createdAt.
   * They are therefore never uploaded.
   */
  if (!transaction.createdAt || transaction.createdAt < cutoff) {
    console.log(
      '[Kripin Cloud] Skipping pre-cloud transaction:',
      transaction.id
    );

    return false;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/transactions/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      }
    );

    if (!response.ok) {
      console.error(
        '[Kripin Cloud] Transaction sync failed:',
        response.status
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      '[Kripin Cloud] Transaction sync error:',
      error
    );

    return false;
  }
};
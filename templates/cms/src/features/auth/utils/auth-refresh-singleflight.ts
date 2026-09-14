export interface SessionDataLike {
  accessToken: string;
  expiresIn: number;
}

export function createRefreshSingleFlight<T extends SessionDataLike | null>(
  execute: () => Promise<T>,
): () => Promise<T> {
  let inFlight: Promise<T> | null = null;
  let epoch = 0;

  return async () => {
    if (inFlight) return inFlight;

    const currentEpoch = ++epoch;

    inFlight = (async () => {
      const result = await execute();
      if (currentEpoch !== epoch) return null as T;
      return result;
    })().finally(() => {
      inFlight = null;
    });

    return inFlight;
  };
}

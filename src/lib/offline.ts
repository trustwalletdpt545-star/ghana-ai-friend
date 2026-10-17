// Comfortable AI Ghana - ALWAYS LIVE - No offline mode
export const CANNED: { keys: string[]; answer: string }[] = [];

export function getCannedResponse(message: string): string | null {
  return null; // never use canned offline answers
}

export const OFFLINE_ENABLED = false;
export const isOfflineMode = () => false;

import type { ScanStoreEntry } from "./types";

const TTL_MS = 30 * 60 * 1000;

type GlobalWithStore = typeof globalThis & {
  __cwvScanStore?: Map<string, ScanStoreEntry>;
};

function store(): Map<string, ScanStoreEntry> {
  const g = globalThis as GlobalWithStore;
  if (!g.__cwvScanStore) g.__cwvScanStore = new Map();
  return g.__cwvScanStore;
}

function sweep(now: number) {
  const s = store();
  for (const [id, entry] of s) {
    if (now - entry.createdAt > TTL_MS) s.delete(id);
  }
}

export function putScan(entry: ScanStoreEntry): void {
  store().set(entry.scanId, entry);
}

export function getScan(scanId: string): ScanStoreEntry | undefined {
  const now = Date.now();
  sweep(now);
  const entry = store().get(scanId);
  if (!entry) return undefined;
  if (now - entry.createdAt > TTL_MS) {
    store().delete(scanId);
    return undefined;
  }
  return entry;
}

export function deleteScan(scanId: string): void {
  store().delete(scanId);
}

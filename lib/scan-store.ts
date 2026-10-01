import { db } from "./db";
import type { ScanStoreEntry } from "./types";

export async function putScan(entry: ScanStoreEntry): Promise<void> {
  await db.collection("scans").doc(entry.scanId).set(entry);
}

export async function getScan(scanId: string): Promise<ScanStoreEntry | undefined> {
  try {
    const doc = await db.collection("scans").doc(scanId).get();
    if (!doc.exists) return undefined;
    return doc.data() as ScanStoreEntry;
  } catch (err) {
    console.error("Firestore getScan error:", err);
    return undefined;
  }
}

export async function markScanUnlocked(scanId: string): Promise<void> {
  try {
    await db.collection("scans").doc(scanId).update({ unlocked: true });
  } catch (err) {
    console.error("Firestore markScanUnlocked error:", err);
  }
}

export async function addRetestToScan(scanId: string, retest: import("./types").RetestRecord): Promise<void> {
  try {
    const { FieldValue } = await import("firebase-admin/firestore");
    await db.collection("scans").doc(scanId).update({
      retests: FieldValue.arrayUnion(retest)
    });
  } catch (err) {
    console.error("Firestore addRetestToScan error:", err);
  }
}

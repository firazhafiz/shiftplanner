// ============================================================
// Browser Fingerprint — Unique Hardware ID Generation
// ============================================================

import FingerprintJS from "@fingerprintjs/fingerprintjs";

let _fingerprint: string | null = null;

export async function getHardwareId(): Promise<string> {
  if (_fingerprint) return _fingerprint;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  _fingerprint = result.visitorId;
  return _fingerprint;
}

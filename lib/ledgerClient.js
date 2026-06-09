// Thin client for the /api/ledger endpoint.
// Every call degrades gracefully: if Supabase isn't configured (or the ledger
// table hasn't been created yet) the app keeps a local-only ledger so the
// feature still works in a demo, it just won't persist across reloads.

import { makeEntry, normalizeEntry } from './ledger';

export async function fetchLedger(user) {
  try {
    const res = await fetch(`/api/ledger?user=${encodeURIComponent(user)}`);
    if (!res.ok) return { entries: null, persisted: false };
    const body = await res.json();
    return { entries: (body.entries || []).map(normalizeEntry), persisted: true };
  } catch {
    return { entries: null, persisted: false };
  }
}

export async function appendLedger({ user, type, amount, ref = null, note = '' }) {
  // Optimistic local entry — returned immediately so the UI can update even if
  // the network write fails.
  const local = makeEntry({ user, type, amount, ref, note });
  try {
    const res = await fetch('/api/ledger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, type, amount, ref, note }),
    });
    if (!res.ok) return { entry: local, persisted: false };
    const body = await res.json();
    return { entry: normalizeEntry(body.entry), persisted: true };
  } catch {
    return { entry: local, persisted: false };
  }
}

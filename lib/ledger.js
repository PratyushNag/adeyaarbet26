// AdeYaar 2026 — Token Ledger
// ─────────────────────────────────────────────────────────────────────────
// Every token event is logged as an immutable ledger entry. The settlement
// rule fixes the core abuse: a player can mint unlimited "general" tokens,
// but any generated token that was never put at risk (staked) is removed at
// cash-out. Only tokens you actually staked — and the winnings they earned —
// count toward what you get paid.
//
// Worked example (the canonical case):
//   generate 10  → mint  +10
//   stake 1      → stake  -1
//   win 5        → win   +5
//   ─────────────────────────────
//   generated 10, staked 1  → 9 generated tokens were never staked → removed
//   settled = 10 - 1 + 5 - 9 = 5
//
// Algebraically settled === sum(win) whenever you never stake more than you
// generated, which is the whole point: minting tokens earns you nothing,
// only winning staked bets does.

import { fmtMoney } from './data';

export const LEDGER_TYPES = {
  MINT:  'mint',   // tokens generated / "added" to the wallet
  STAKE: 'stake',  // tokens spent placing a bet (put at risk)
  WIN:   'win',    // winnings credited from a settled bet
};

// Human labels + sign used purely for display.
export const LEDGER_META = {
  mint:  { label: 'Generated', sign: +1, tint: 'ink'  },
  stake: { label: 'Spent',     sign: -1, tint: 'loss' },
  win:   { label: 'Won',       sign: +1, tint: 'win'  },
};

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'led_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Build a normalized ledger entry. `amount` is always stored as a positive
// magnitude; the entry type carries the meaning (generated / spent / won).
export function makeEntry({ user, type, amount, ref = null, note = '', ts } = {}) {
  if (!LEDGER_META[type]) throw new Error(`Unknown ledger type: ${type}`);
  const mag = Math.abs(Math.round(Number(amount) || 0));
  return {
    id: newId(),
    user,
    type,
    amount: mag,
    ref,                       // optional id of the related bet
    note,
    ts: ts || new Date().toISOString(),
  };
}

// Normalize whatever the persistence layer hands back into a clean entry.
export function normalizeEntry(row) {
  return {
    id:     row.id ?? newId(),
    user:   row.user ?? row.username ?? null,
    type:   row.type,
    amount: Math.abs(Math.round(Number(row.amount) || 0)),
    ref:    row.ref ?? null,
    note:   row.note ?? '',
    ts:     row.ts ?? row.created_at ?? new Date().toISOString(),
  };
}

// The signed value an entry contributes to a running wallet balance.
export function signedAmount(entry) {
  const meta = LEDGER_META[entry.type];
  return (meta ? meta.sign : 0) * entry.amount;
}

// Settle a single player's ledger into a transparent breakdown.
//   generated  — total tokens minted
//   staked     — total tokens put at risk
//   won        — total winnings credited
//   unstaked   — generated tokens never staked (removed at cash-out)
//   wallet     — naive running balance (generated - staked + won)
//   settled    — what the player actually cashes out
export function settleLedger(entries = []) {
  let generated = 0, staked = 0, won = 0;
  for (const e of entries) {
    if (e.type === LEDGER_TYPES.MINT)  generated += e.amount;
    else if (e.type === LEDGER_TYPES.STAKE) staked += e.amount;
    else if (e.type === LEDGER_TYPES.WIN)   won += e.amount;
  }
  // Generated tokens you never staked are not real money — strip them out.
  const unstaked = Math.max(0, generated - staked);
  const wallet   = generated - staked + won;
  const settled  = wallet - unstaked;
  return { generated, staked, won, unstaked, wallet, settled };
}

// Settle every player found in a mixed ledger → { [user]: breakdown }.
export function settleAll(entries = []) {
  const byUser = {};
  for (const e of entries) {
    (byUser[e.user] = byUser[e.user] || []).push(e);
  }
  const out = {};
  for (const user of Object.keys(byUser)) out[user] = settleLedger(byUser[user]);
  return out;
}

// One-line human description of an entry, e.g. "Generated +₹10".
export function describeEntry(entry) {
  const meta = LEDGER_META[entry.type] || { label: entry.type, sign: 1 };
  const sign = meta.sign < 0 ? '−' : '+';
  return `${meta.label} ${sign}${fmtMoney(entry.amount)}`;
}

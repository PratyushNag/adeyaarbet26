import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { LEDGER_META, makeEntry, normalizeEntry, settleLedger } from '@/lib/ledger';

// GET /api/ledger?user=rahul
//   → { entries: [...], settlement: {...} } for one player
// GET /api/ledger
//   → { entries: [...] } for everyone (newest last)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');

  let query = supabase
    .from('ledger')
    .select('id, username, type, amount, ref, note, created_at')
    .order('created_at', { ascending: true });

  if (user) query = query.eq('username', user.trim().toLowerCase());

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const entries = (data || []).map(normalizeEntry);
  const body = { entries };
  if (user) body.settlement = settleLedger(entries);
  return NextResponse.json(body);
}

// POST /api/ledger
//   body: { user, type: 'mint'|'stake'|'win', amount, ref?, note? }
//   → { entry } the appended (normalized) ledger row
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { user, type, amount, ref = null, note = '' } = payload || {};
  if (!user || typeof user !== 'string') {
    return NextResponse.json({ error: 'Missing user' }, { status: 400 });
  }
  if (!LEDGER_META[type]) {
    return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
  }
  const mag = Math.abs(Math.round(Number(amount)));
  if (!Number.isFinite(mag) || mag <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
  }

  const entry = makeEntry({ user: user.trim().toLowerCase(), type, amount: mag, ref, note });

  const { data, error } = await supabase
    .from('ledger')
    .insert({
      username:   entry.user,
      type:       entry.type,
      amount:     entry.amount,
      ref:        entry.ref,
      note:       entry.note,
      created_at: entry.ts,
    })
    .select('id, username, type, amount, ref, note, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entry: normalizeEntry(data) });
}

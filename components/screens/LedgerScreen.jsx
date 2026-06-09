'use client';

import { useState } from 'react';
import { ME_ID, getMatch, getTeam, fmtMoney } from '@/lib/data';
import { LEDGER_META, settleLedger } from '@/lib/ledger';

function fmtTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function betLabel(bet) {
  const match = getMatch(bet.matchId);
  if (!match) return 'Bet';
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const pick = bet.pick === 'home' ? home.name : bet.pick === 'away' ? away.name : 'Draw';
  return `${pick} · ${home.code} v ${away.code}`;
}

// One open stake with inline "won / lost" settlement.
function StakeRow({ bet, onSettle }) {
  const suggested = Math.round(bet.amount * (bet.oddsAt || 2));
  const [open, setOpen] = useState(false);
  const [win, setWin] = useState(suggested);

  return (
    <div className="card" style={{ padding: 12, marginBottom: 8 }}>
      <div className="row between center">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {betLabel(bet)}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            Staked {fmtMoney(bet.amount)}
          </div>
        </div>
        {!open && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" style={{ padding: '7px 12px' }} onClick={() => setOpen(true)}>
              Settle
            </button>
          </div>
        )}
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Winnings credited</div>
          <input
            type="number"
            min={0}
            value={win}
            onChange={e => setWin(Math.max(0, Number(e.target.value)))}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)',
              background: 'var(--surface-2)', border: '1px solid var(--line)',
              color: 'var(--ink)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              marginBottom: 10, fontFamily: 'var(--font-mono)',
            }}
          />
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn primary"
              style={{ flex: 1 }}
              onClick={() => onSettle(bet.id, 'won', win)}
            >
              Won +{fmtMoney(win)}
            </button>
            <button
              className="btn"
              style={{ flex: 1, color: 'var(--loss)' }}
              onClick={() => onSettle(bet.id, 'lost', 0)}
            >
              Lost
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LedgerScreen({ ledger = [], bets = [], balance, onGenerate, onSettle, persisted = true }) {
  const mine = ledger.filter(e => e.user === ME_ID);
  const s = settleLedger(mine);
  const openStakes = bets.filter(b => b.user === ME_ID && b.status === 'open');

  const presets = [100, 1000, 5000];
  const [genAmount, setGenAmount] = useState(1000);

  // Settlement walk-through rows (matches the gen10 / stake1 / win5 → 5 model).
  const steps = [
    { label: 'Generated',        amount: s.generated, sign: +1, tint: 'var(--ink)'  },
    { label: 'Spent (staked)',   amount: s.staked,    sign: -1, tint: 'var(--loss)' },
    { label: 'Won',              amount: s.won,       sign: +1, tint: 'var(--win)'  },
    { label: 'Unstaked removed', amount: s.unstaked,  sign: -1, tint: 'var(--ink-3)' },
  ];

  const log = [...mine].reverse(); // newest first

  return (
    <div>
      <div className="section-head" style={{ marginTop: 8 }}>
        <div className="section-head__title display">Ledger</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          {fmtMoney(balance)} held
        </div>
      </div>

      {!persisted && (
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div className="card" style={{ padding: '10px 14px', fontSize: 11.5, color: 'var(--ink-3)' }}>
            Local session only — run <span className="mono">supabase/ledger.sql</span> to persist.
          </div>
        </div>
      )}

      {/* Settlement summary — the headline */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Cash-out settlement</div>

          {steps.map(step => (
            <div key={step.label} className="row between" style={{ marginBottom: 8 }}>
              <span className="muted" style={{ fontSize: 13 }}>{step.label}</span>
              <span className="mono" style={{ fontWeight: 600, color: step.tint }}>
                {step.sign < 0 ? '−' : '+'}{fmtMoney(step.amount)}
              </span>
            </div>
          ))}

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />

          <div className="row between center">
            <span style={{ fontWeight: 700 }}>Settled</span>
            <span className="mono" style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--gold)',
            }}>
              {fmtMoney(s.settled)}
            </span>
          </div>

          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>
            Generated tokens you never staked are removed at cash-out. Only staked
            tokens and the winnings they earn count toward your payout.
          </div>
        </div>
      </div>

      {/* Generate tokens */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Generate tokens</div>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            min={0}
            value={genAmount}
            onChange={e => setGenAmount(Math.max(0, Number(e.target.value)))}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)',
              background: 'var(--surface-2)', border: '1px solid var(--line)',
              color: 'var(--ink)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            className="btn primary"
            disabled={!genAmount}
            onClick={() => onGenerate(genAmount)}
          >
            Generate
          </button>
        </div>
        <div className="amount-presets">
          {presets.map(p => (
            <button key={p} className={genAmount === p ? 'active' : ''} onClick={() => setGenAmount(p)}>
              ₹{p}
            </button>
          ))}
        </div>
      </div>

      {/* Open stakes awaiting settlement */}
      {openStakes.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Open stakes · settle to log winnings</div>
          {openStakes.map(b => (
            <StakeRow key={b.id} bet={b} onSettle={onSettle} />
          ))}
        </div>
      )}

      {/* Full ledger log */}
      <div className="section-head">
        <div className="section-head__title display" style={{ fontSize: 18 }}>Activity</div>
      </div>
      <div style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {log.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 28, color: 'var(--ink-3)' }}>
            No ledger activity yet — generate tokens or place a bet.
          </div>
        )}
        {log.map(e => {
          const meta = LEDGER_META[e.type] || { label: e.type, sign: 1 };
          const cls = meta.tint === 'win' ? 'win' : meta.tint === 'loss' ? 'loss' : '';
          return (
            <div key={e.id} className="card" style={{ padding: '12px 14px' }}>
              <div className="row between center">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{meta.label}</div>
                  {e.note && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.note}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={'mono ' + cls} style={{ fontWeight: 700 }}>
                    {meta.sign < 0 ? '−' : '+'}{fmtMoney(e.amount)}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{fmtTime(e.ts)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

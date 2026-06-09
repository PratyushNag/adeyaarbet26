'use client';

import { getTeam, getFriend, fmtCompact, fmtDate, fmtDay, fmtMoney, getMatch, fmtTimeIST } from '@/lib/data';
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

// ── Icons ────────────────────────────────────────────────────
export const Icon = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z"/>
    </svg>
  ),
  ball: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>
    </svg>
  ),
  bracket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h5l3 3M3 18h5l3-3M21 12h-4l-3-3M14 15l3-3"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v6a5 5 0 01-10 0V4z"/>
      <path d="M7 7H4v3a3 3 0 003 3M17 7h3v3a3 3 0 01-3 3"/>
      <path d="M9 21h6M12 18v3"/>
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/>
      <path d="M9 8h6M9 12h6M9 16h4"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  ledger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h13a2 2 0 012 2v14H6a2 2 0 01-2-2z"/>
      <path d="M4 4v14M9 8h7M9 12h7"/>
    </svg>
  ),
};

// ── Flag ─────────────────────────────────────────────────────
export function Flag({ code, size = 'md' }) {
  const team = getTeam(code);
  const [imgFailed, setImgFailed] = useState(false);
  const cls = size === 'xl' ? 'flag xl' : size === 'lg' ? 'flag lg' : size === 'sm' ? 'flag sm' : 'flag';
  return (
    <div className={cls}>
      {imgFailed ? (
        <span>{team.flag}</span>
      ) : (
        <img
          src={`https://api.fifa.com/api/v3/picture/flags-sq-5/${code}`}
          alt={team.name}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', display: 'block' }}
        />
      )}
    </div>
  );
}

// ── Live dot ─────────────────────────────────────────────────
export function LiveDot({ minute }) {
  return (
    <span className="live-dot">
      <span>Live{minute ? ` · ${minute}'` : ''}</span>
    </span>
  );
}

// ── App Header ───────────────────────────────────────────────
export function AppHeader({ balance, onTap }) {
  return (
    <div className="app-header">
      <div className="app-header__brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">AdeYaar <em>26</em></div>
      </div>
      {/* balance pill hidden until funds/balance feature is ready
      <button className="balance-pill" onClick={onTap}>
        <div className="balance-pill__icon">₹</div>
        <span className="balance-pill__amt">{fmtCompact(balance)}</span>
      </button>
      */}
    </div>
  );
}

// ── Tab bar ──────────────────────────────────────────────────
export function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home',    label: 'Home',    icon: Icon.home },
    { id: 'matches', label: 'Matches', icon: Icon.ball },
    { id: 'bracket', label: 'Bracket', icon: Icon.bracket },
    { id: 'leaders', label: 'Leaders', icon: Icon.trophy },
    { id: 'bets',    label: 'My Bets', icon: Icon.receipt },
    { id: 'ledger',  label: 'Ledger',  icon: Icon.ledger },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button
          key={t.id}
          className={'tabbar__btn ' + (active === t.id ? 'active' : '')}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Section head ─────────────────────────────────────────────
export function SectionHead({ title, more, onMore }) {
  return (
    <div className="section-head">
      <div className="section-head__title display">{title}</div>
      {more && (
        <button className="section-head__more" onClick={onMore}>
          {more} →
        </button>
      )}
    </div>
  );
}

// ── Match card ───────────────────────────────────────────────
export function MatchCard({ match, onBet }) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const stageLabel = match.group ? `Group ${match.group}` : 'Knockout';
  const city = match.venue?.split(',').pop()?.trim();

  return (
    <div className="match-card">
      <div className="match-card__head">
        <span>{stageLabel} · {fmtDate(match.date)}{city ? ` · ${city}` : ''}</span>
        {isLive ? <LiveDot minute={match.minute} /> :
         isFinished ? <span style={{ color: 'var(--ink-3)' }}>FT</span> :
         <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtTimeIST(match.time)}</span>}
      </div>

      <div className="match-card__teams">
        <div className="match-card__team">
          <Flag code={match.home} size="lg" />
          <div className="match-card__team-name">{home.name}</div>
        </div>

        <div className="match-card__vs">
          {(isLive || isFinished) && match.score ? (
            <div className="match-card__score">{match.score[0]}–{match.score[1]}</div>
          ) : (
            <div className="match-card__vs-time">{fmtTimeIST(match.time)}</div>
          )}
        </div>

        <div className="match-card__team">
          <Flag code={match.away} size="lg" />
          <div className="match-card__team-name">{away.name}</div>
        </div>
      </div>

      {!isFinished && (
        <div className="match-card__odds">
          {[
            { key: 'home', label: home.code },
            { key: 'draw', label: 'X' },
            { key: 'away', label: away.code },
          ].map(o => (
            <button
              key={o.key}
              className="odds-btn"
              onClick={(e) => { e.stopPropagation(); onBet?.(match, o.key); }}
            >
              <span className="odds-btn__label">{o.label}</span>
              {/* odds-btn__val: odds coming soon */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hero match ───────────────────────────────────────────────
export function HeroMatch({ match, onBet }) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const isLive = match.status === 'live';

  return (
    <div className="hero">
      <div className="row between center">
        <div className="hero__stage">
          {isLive ? '★ Live now' : 'Round of 32 · Featured'}
        </div>
        {isLive && <LiveDot minute={match.minute} />}
      </div>

      <div className="hero__matchup">
        <div className="hero__team">
          <Flag code={match.home} size="xl" />
          <div className="hero__team-name">{home.name}</div>
        </div>
        <div className="col center" style={{ gap: 6 }}>
          {isLive && match.score ? (
            <div className="match-card__score" style={{ fontSize: 32 }}>
              {match.score[0]}–{match.score[1]}
            </div>
          ) : (
            <>
              <div className="hero__vs">VS</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                {fmtTimeIST(match.time)}
              </div>
            </>
          )}
        </div>
        <div className="hero__team">
          <Flag code={match.away} size="xl" />
          <div className="hero__team-name">{away.name}</div>
        </div>
      </div>

      <div className="hero__cta-row">
        <button className="btn primary lg" onClick={() => onBet(match, 'home')}>
          Bet {home.code}
        </button>
        <button className="btn lg" onClick={() => onBet(match, 'away')}>
          Bet {away.code}
        </button>
      </div>
    </div>
  );
}

// ── Place bet sheet ──────────────────────────────────────────
export function PlaceBetSheet({ match, pick, onClose, onConfirm, balance }) {
  const presets = [100, 250, 500, 1000];
  const [amount, setAmount] = useState(250);
  const [side, setSide] = useState(pick || 'home');
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const sideName = side === 'home' ? home.name : side === 'away' ? away.name : 'Draw';
  const overBalance = amount > balance;

  const verifyAndBet = async () => {
    if (!loginUsername || !loginPassword) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('password')
        .eq('username', loginUsername.trim().toLowerCase())
        .single();
      if (dbError || !data) {
        setLoginError('Wrong username or password');
      } else if (data.password !== loginPassword) {
        setLoginError('Wrong username or password');
      } else {
        onConfirm({ matchId: match.id, pick: side, amount });
      }
    } catch {
      setLoginError("Couldn't connect, try again");
    }
    setLoginLoading(false);
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        {showLogin ? (
          <>
            <div className="row between center" style={{ marginBottom: 14 }}>
              <div className="eyebrow">Confirm your identity</div>
              <button
                onClick={() => setShowLogin(false)}
                style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}
              >
                {Icon.close}
              </button>
            </div>

            <div style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 18, textAlign: 'center' }}>
              {sideName} · {fmtMoney(amount)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Username</div>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => { setLoginUsername(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifyAndBet()}
                  placeholder="e.g. rahul"
                  autoCapitalize="none"
                  autoCorrect="off"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
                    background: 'var(--surface-2)', border: '1px solid var(--line)',
                    color: 'var(--ink)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Password</div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifyAndBet()}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
                    background: 'var(--surface-2)', border: '1px solid var(--line)',
                    color: 'var(--ink)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {loginError && (
              <div style={{ color: 'var(--loss)', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              className="btn primary block lg"
              disabled={!loginUsername || !loginPassword || loginLoading}
              onClick={verifyAndBet}
            >
              {loginLoading ? 'Verifying…' : 'Confirm bet'}
            </button>
          </>
        ) : (
          <>
            <div className="row between center" style={{ marginBottom: 14 }}>
              <div className="eyebrow">Place your bet</div>
              <button
                onClick={onClose}
                style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}
              >
                {Icon.close}
              </button>
            </div>

            {/* Match preview */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="row between" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>
                <span>Round of 32 · {fmtDay(match.date)} {fmtTimeIST(match.time)}</span>
                <span className="mono">{match.id}</span>
              </div>
              <div className="row between center" style={{ gap: 10 }}>
                <div className="row center" style={{ gap: 8 }}>
                  <Flag code={match.home} />
                  <span style={{ fontWeight: 600 }}>{home.name}</span>
                </div>
                <span className="mono" style={{ color: 'var(--ink-3)' }}>vs</span>
                <div className="row center" style={{ gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{away.name}</span>
                  <Flag code={match.away} />
                </div>
              </div>
            </div>

            {/* Side picker */}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your pick</div>
            <div className="match-card__odds" style={{ marginBottom: 18 }}>
              {[
                { k: 'home', l: home.name },
                { k: 'draw', l: 'Draw' },
                { k: 'away', l: away.name },
              ].map(o => (
                <button
                  key={o.k}
                  className={'odds-btn ' + (side === o.k ? 'fav' : '')}
                  style={side === o.k ? { borderColor: 'var(--gold)', background: 'var(--gold-soft)' } : {}}
                  onClick={() => setSide(o.k)}
                >
                  <span className="odds-btn__label">
                    {o.l.length > 8 ? (o.k === 'home' ? home.code : o.k === 'away' ? away.code : 'X') : o.l}
                  </span>
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="row between" style={{ marginBottom: 10 }}>
              <div className="eyebrow">Amount</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Bal {fmtMoney(balance)}</div>
            </div>

            <div style={{
              textAlign: 'center', padding: '14px 0',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36,
              color: overBalance ? 'var(--loss)' : 'var(--ink)',
            }}>
              ₹{amount.toLocaleString('en-IN')}
            </div>

            <input
              type="range" className="slider"
              min={50} max={Math.max(5000, balance)} step={50}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              style={{ marginBottom: 14 }}
            />

            <div className="amount-presets" style={{ marginBottom: 18 }}>
              {presets.map(p => (
                <button key={p} className={amount === p ? 'active' : ''} onClick={() => setAmount(p)}>
                  ₹{p}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              padding: '14px 16px', borderRadius: 'var(--radius)',
              background: 'var(--surface-2)', marginBottom: 16,
              border: '1px solid var(--line)',
            }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="muted" style={{ fontSize: 12 }}>Pick</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{sideName}</span>
              </div>
              <div className="row between">
                <span className="muted" style={{ fontSize: 12 }}>Stake</span>
                <span className="mono" style={{ fontWeight: 700 }}>{fmtMoney(amount)}</span>
              </div>
            </div>

            <button
              className="btn primary block lg"
              disabled={overBalance}
              onClick={() => setShowLogin(true)}
            >
              {overBalance ? 'Insufficient balance' : `Place ₹${amount.toLocaleString('en-IN')} bet`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────
export function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <span>✓</span>
      <span>{message}</span>
    </div>
  );
}

// ── Bet card (My Bets screen) ────────────────────────────────
export function BetCard({ bet }) {
  const match = getMatch(bet.matchId);
  if (!match) return null;
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const pickedTeam = bet.pick === 'home' ? home : bet.pick === 'away' ? away : null;
  const possibleWin = Math.round(bet.amount * bet.oddsAt);
  const isLive = match.status === 'live';

  return (
    <div className="bet-card">
      <div className="bet-card__head">
        <span>{fmtDay(match.date)} · {fmtTimeIST(match.time)}</span>
        <span className={'bet-card__status ' + bet.status}>{bet.status}</span>
      </div>

      <div className="row between center">
        <div className="row center" style={{ gap: 8 }}>
          <Flag code={match.home} size="sm" />
          <span style={{ fontWeight: 500, fontSize: 13 }}>{home.code}</span>
          <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
            {match.score ? `${match.score[0]}-${match.score[1]}` : 'v'}
          </span>
          <span style={{ fontWeight: 500, fontSize: 13 }}>{away.code}</span>
          <Flag code={match.away} size="sm" />
        </div>
        {isLive && <LiveDot minute={match.minute} />}
      </div>

      <div className="bet-card__pick">
        <span className="eyebrow">Pick</span>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          {pickedTeam ? pickedTeam.name : 'Draw'}
        </span>
        <span className="mono dim" style={{ fontSize: 12 }}>@ {bet.oddsAt.toFixed(2)}</span>
      </div>

      <div className="bet-card__amounts">
        <div>
          <span>Stake</span>
          <span>{fmtMoney(bet.amount)}</span>
        </div>
        <div>
          <span>{bet.status === 'won' ? 'Payout' : bet.status === 'lost' ? 'Lost' : 'To win'}</span>
          <span className={bet.status === 'won' ? 'win' : bet.status === 'lost' ? 'loss' : 'gold'}>
            {bet.status === 'lost' ? '−' : ''}
            {fmtMoney(bet.status === 'won' ? bet.payout : possibleWin)}
          </span>
        </div>
        <div>
          <span>Profit</span>
          <span className={bet.status === 'won' ? 'win' : bet.status === 'lost' ? 'loss' : ''}>
            {bet.status === 'lost' ? '−' + fmtMoney(bet.amount) :
             bet.status === 'won' ? '+' + fmtMoney(bet.payout - bet.amount) :
             '+' + fmtMoney(possibleWin - bet.amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Login modal ──────────────────────────────────────────────
export function LoginModal({ onSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const verify = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('password')
        .eq('username', username.trim().toLowerCase())
        .single();

      if (dbError || !data) {
        setError('Wrong username or password');
      } else if (data.password !== password) {
        setError('Wrong username or password');
      } else {
        onSuccess();
      }
    } catch {
      setError("Couldn't connect, try again");
    }
    setLoading(false);
  };

  return (
    <div className="sheet-backdrop" style={{ zIndex: 200 }} onClick={onCancel}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="row between center" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Confirm your identity</div>
          <button
            onClick={onCancel}
            style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}
          >
            {Icon.close}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Username</div>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder="e.g. rahul"
              autoCapitalize="none"
              autoCorrect="off"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'var(--surface-2)', border: '1px solid var(--line)',
                color: 'var(--ink)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'var(--surface-2)', border: '1px solid var(--line)',
                color: 'var(--ink)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--loss)', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button
          className="btn primary block lg"
          disabled={!username || !password || loading}
          onClick={verify}
        >
          {loading ? 'Verifying…' : 'Confirm bet'}
        </button>
      </div>
    </div>
  );
}

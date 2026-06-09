'use client';

import { useState } from 'react';
import {
  FRIENDS, BETS, ACTIVITY, GROUPS, BRACKET, MATCHES,
  ME_ID, getFriend, getTeam, getMatch,
  fmtMoney, fmtCompact, fmtDay, fmtDate, fmtTimeIST,
} from '@/lib/data';
import { Flag, LiveDot, Icon } from '@/components';
import LedgerScreen from '@/components/screens/LedgerScreen';

// ── Desktop icons ─────────────────────────────────────────────
const DIcon = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z"/></svg>,
  ball: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg>,
  bracket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h5l3 3M3 18h5l3-3M21 12h-4l-3-3M14 15l3-3"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v6a5 5 0 01-10 0V4z"/><path d="M7 7H4v3a3 3 0 003 3M17 7h3v3a3 3 0 01-3 3"/><path d="M9 21h6M12 18v3"/></svg>,
  receipt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M14 21a2 2 0 01-4 0"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 005 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 5h.09A1.65 1.65 0 0010.5 4V3a2 2 0 114 0v.09A1.65 1.65 0 0016 4.5a1.65 1.65 0 001.82.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0020 9h.09a2 2 0 110 4H20a1.65 1.65 0 00-1.51 1z"/></svg>,
};

// ── Desktop Shell ─────────────────────────────────────────────
function DesktopShell({ tab, onNav, balance, children, title, sub, hideSearch }) {
  const me = getFriend(ME_ID);
  const myOpen = BETS.filter(b => b.user === ME_ID && b.status === 'open').length;

  const navItems = [
    { id: 'home',    label: 'Dashboard', icon: DIcon.home },
    { id: 'matches', label: 'Fixtures',  icon: DIcon.ball,    badge: '12' },
    { id: 'bracket', label: 'Bracket',   icon: DIcon.bracket },
    { id: 'leaders', label: 'Leaderboard', icon: DIcon.trophy },
    { id: 'bets',    label: 'My Bets',   icon: DIcon.receipt, badge: String(myOpen) },
    { id: 'ledger',  label: 'Ledger',    icon: Icon.ledger },
  ];

  return (
    <div className="desk" data-theme="midnight">
      <aside className="desk-sidebar">
        <div className="desk-brand">
          <div className="desk-brand__mark">A</div>
          <div>
            <div className="desk-brand__name">AdeYaar <em>26</em></div>
            <div className="desk-brand__sub">Group · Yaaron</div>
          </div>
        </div>

        <nav className="desk-nav">
          <div className="desk-nav__sect">Tournament</div>
          {navItems.map(n => (
            <button
              key={n.id}
              className={'desk-nav__btn ' + (tab === n.id ? 'active' : '')}
              onClick={() => onNav(n.id)}
            >
              {n.icon}
              <span>{n.label}</span>
              {n.badge && <span className="badge">{n.badge}</span>}
            </button>
          ))}
        </nav>

        {/* balance/funds hidden until feature is ready
        <div className="desk-balance">
          <div className="desk-balance__label">Wallet · Yaaron Cup</div>
          <div className="desk-balance__amt">{fmtMoney(balance)}</div>
          <div className="desk-balance__sub">+₹3,150 this week · #1 of 8</div>
          <button className="desk-balance__cta">Add funds</button>
        </div>
        */}

        <div className="desk-user">
          <div className="desk-user__avatar">{me?.name[0]}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="desk-user__name">{me?.name}</div>
            <div className="desk-user__id">@{me?.id}</div>
          </div>
          <button className="desk-icon-btn" style={{ width: 32, height: 32 }}>
            {DIcon.settings}
          </button>
        </div>
      </aside>

      <main className="desk-main">
        <div className="desk-topbar">
          <div>
            <div className="desk-topbar__title">{title}</div>
            {sub && <div className="desk-topbar__sub">{sub}</div>}
          </div>
          {!hideSearch && (
            <div className="desk-search">
              {DIcon.search}
              <span>Search teams, matches, friends…</span>
              <kbd>⌘K</kbd>
            </div>
          )}
          <div className="desk-topbar__actions">
            <button className="desk-icon-btn">
              {DIcon.bell}
              <span className="dot"></span>
            </button>
            <button className="desk-icon-btn">{DIcon.settings}</button>
          </div>
        </div>

        <div className="desk-content">
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Desktop fixture row ───────────────────────────────────────
function DeskFix({ match, onBet }) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const IS_LIVE = match.status === 'live';
  const IS_FINISHED = match.status === 'finished';
  const favOdds = match.odds ? Math.min(match.odds.home, match.odds.draw, match.odds.away) : null;

  return (
    <div className="desk-fix">
      <div className="desk-fix__time">
        <b>{IS_LIVE ? 'LIVE' : IS_FINISHED ? 'FT' : fmtTimeIST(match.time)}</b>
        <span>{fmtDay(match.date).slice(0,3)} · {fmtDate(match.date)}</span>
      </div>
      <div className="desk-fix__teams">
        <div className="desk-fix__team">
          <Flag code={match.home} size="sm" />
          <span>{home.name}</span>
          {(IS_LIVE || IS_FINISHED) && match.score && (
            <span className="form mono" style={{ marginLeft: 'auto', color: 'var(--ink)' }}>{match.score[0]}</span>
          )}
        </div>
        <div className="desk-fix__team">
          <Flag code={match.away} size="sm" />
          <span>{away.name}</span>
          {(IS_LIVE || IS_FINISHED) && match.score && (
            <span className="form mono" style={{ marginLeft: 'auto', color: 'var(--ink)' }}>{match.score[1]}</span>
          )}
        </div>
      </div>
      {!IS_FINISHED && match.odds && (
        <div className="desk-fix__odds">
          {[
            { k: 'home', l: '1',  v: match.odds.home },
            { k: 'draw', l: 'X',  v: match.odds.draw },
            { k: 'away', l: '2',  v: match.odds.away },
          ].map(o => (
            <button
              key={o.k}
              className={'odds-btn ' + (o.v === favOdds ? 'fav' : '')}
              onClick={() => onBet(match, o.k)}
            >
              <span className="odds-btn__label">{o.l}</span>
              <span className="odds-btn__val">{o.v.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Desktop Home ──────────────────────────────────────────────
function DHomeScreen({ matches, balance, onBet, onNav }) {
  const live = matches.filter(m => m.status === 'live');
  const upcoming = matches.filter(m => m.status === 'upcoming').slice(0, 6);
  const featured = live[0] || upcoming[0];

  const myOpenBets = BETS.filter(b => b.user === ME_ID && b.status === 'open');
  const totalStake = myOpenBets.reduce((s, b) => s + b.amount, 0);
  const myWon = BETS.filter(b => b.user === ME_ID && b.status === 'won')
    .reduce((s, b) => s + (b.payout - b.amount), 0);

  const sorted = [...FRIENDS].sort((a, b) => b.balance - a.balance).slice(0, 5);

  if (!featured) return <div className="eyebrow" style={{ padding: 24 }}>Loading…</div>;

  const home = getTeam(featured.home);
  const away = getTeam(featured.away);
  const IS_LIVE = featured.status === 'live';
  const favOdds = featured.odds ? Math.min(featured.odds.home, featured.odds.draw, featured.odds.away) : null;

  return (
    <>
      {/* Featured / live hero */}
      <section className="dhero">
        <div className="dhero__top">
          <div className="eyebrow" style={{ color: IS_LIVE ? 'var(--live)' : 'var(--gold)' }}>
            {IS_LIVE ? '★ Live · Group Watching' : 'Featured · Round of 32'}
          </div>
          {IS_LIVE
            ? <LiveDot minute={featured.minute} />
            : <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                {fmtDay(featured.date)} · {fmtTimeIST(featured.time)} · {featured.venue}
              </span>
          }
        </div>

        <div className="dhero__matchup">
          <div className="dhero__team">
            <Flag code={featured.home} size="xl" />
            <div>
              <div className="dhero__team-name">{home.name}</div>
              <div className="dhero__team-meta">Group {home.group} · FIFA 2026</div>
            </div>
          </div>
          {IS_LIVE && featured.score ? (
            <div>
              <div className="dhero__score">{featured.score[0]} : {featured.score[1]}</div>
              <div className="dhero__vs-time" style={{ textAlign: 'center' }}>{featured.minute}&apos;</div>
            </div>
          ) : (
            <div>
              <div className="dhero__vs">VS</div>
              <div className="dhero__vs-time">{fmtTimeIST(featured.time)}</div>
            </div>
          )}
          <div className="dhero__team right">
            <Flag code={featured.away} size="xl" />
            <div>
              <div className="dhero__team-name">{away.name}</div>
              <div className="dhero__team-meta">Group {away.group} · FIFA 2026</div>
            </div>
          </div>
        </div>

        {featured.odds && (
          <div className="dhero__odds">
            {[
              { k: 'home', l: `${home.code} to win`, v: featured.odds.home },
              { k: 'draw', l: 'Draw',                v: featured.odds.draw },
              { k: 'away', l: `${away.code} to win`, v: featured.odds.away },
            ].map(o => (
              <button
                key={o.k}
                className={'odds-btn ' + (o.v === favOdds ? 'fav' : '')}
                onClick={() => onBet(featured, o.k)}
              >
                <span className="odds-btn__label">{o.l}</span>
                <span className="odds-btn__val">{o.v.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Stat tiles */}
      <div className="desk-stats" style={{ marginTop: 22 }}>
        <div className="desk-stat gold">
          <div className="desk-stat__label">Open stake</div>
          <div className="desk-stat__val">{fmtMoney(totalStake)}</div>
          <div className="desk-stat__sub">{myOpenBets.length} live bets</div>
        </div>
        <div className="desk-stat gold">
          <div className="desk-stat__label">Net this week</div>
          <div className="desk-stat__val">+{fmtCompact(myWon)}</div>
          <div className="desk-stat__sub">3 won · 1 lost</div>
        </div>
        <div className="desk-stat">
          <div className="desk-stat__label">Group rank</div>
          <div className="desk-stat__val">#1<span style={{ color: 'var(--ink-3)', fontSize: 16, fontWeight: 600 }}> /8</span></div>
          <div className="desk-stat__sub">+₹3,140 ahead</div>
        </div>
        <div className="desk-stat">
          <div className="desk-stat__label">Pot total</div>
          <div className="desk-stat__val">{fmtCompact(FRIENDS.reduce((s, f) => s + f.balance, 0))}</div>
          <div className="desk-stat__sub">across 8 friends</div>
        </div>
      </div>

      <div className="desk-grid split">
        <div className="desk-section">
          <div className="desk-section__head">
            <h3>Today&apos;s fixtures</h3>
            <button className="more" onClick={() => onNav('matches')}>See all →</button>
          </div>
          {[...live, ...upcoming].slice(0, 5).map(m => (
            <DeskFix key={m.id} match={m} onBet={onBet} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="desk-section">
            <div className="desk-section__head">
              <h3>Group leaderboard</h3>
              <button className="more" onClick={() => onNav('leaders')}>Full board →</button>
            </div>
            <div className="desk-lb">
              {sorted.map((f, i) => (
                <div key={f.id} className={'desk-lb__row ' + (f.id === ME_ID ? 'me' : '')}>
                  <span className="desk-lb__rank">{i + 1}</span>
                  <div className="desk-lb__avatar">{f.name[0]}</div>
                  <span className="desk-lb__name">
                    {f.name}
                    {f.id === ME_ID && (
                      <span style={{ marginLeft: 6, color: 'var(--gold)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>YOU</span>
                    )}
                  </span>
                  <span className="desk-lb__amt">{fmtMoney(f.balance)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="desk-section">
            <div className="desk-section__head">
              <h3>Friend activity</h3>
              <span className="more mono" style={{ color: 'var(--gold)' }}>● live</span>
            </div>
            <div className="desk-feed">
              {ACTIVITY.map(a => {
                const friend = getFriend(a.user);
                return (
                  <div key={a.id} className="desk-feed__item">
                    <div className="desk-feed__avatar">{friend?.name[0]}</div>
                    <div className="desk-feed__text">
                      <b>{friend?.name}</b> {a.text}
                    </div>
                    <span className="desk-feed__when">{a.when}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Desktop Matches ───────────────────────────────────────────
function DMatchesScreen({ matches, onBet }) {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all',   label: 'All fixtures' },
    { id: 'live',  label: 'Live now' },
    { id: 'today', label: 'Today' },
    { id: 'r32',   label: 'Round of 32' },
    { id: 'group', label: 'Group stage' },
  ];

  let filtered = matches;
  if (filter === 'live')  filtered = matches.filter(m => m.status === 'live');
  if (filter === 'today') filtered = matches.filter(m => m.date === '2026-06-29');
  if (filter === 'r32')   filtered = matches.filter(m => m.stage === 'R32');
  if (filter === 'group') filtered = matches.filter(m => m.stage === 'GROUP');

  const byDate = {};
  filtered.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
  const dates = Object.keys(byDate).sort();

  return (
    <>
      <div className="desk-chiprow">
        {filters.map(f => (
          <button
            key={f.id}
            className={'chip ' + (filter === f.id ? 'active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {dates.map(date => (
        <div key={date} style={{ marginBottom: 22 }}>
          <div className="desk-section__head" style={{ marginBottom: 12 }}>
            <h3>{fmtDay(date)} · <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{fmtDate(date)}</span></h3>
            <span className="more mono">{byDate[date].length} matches</span>
          </div>
          <div className="desk-grid fixtures" style={{ marginTop: 0 }}>
            {byDate[date].map(m => (
              <DeskFix key={m.id} match={m} onBet={onBet} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Desktop Bracket ───────────────────────────────────────────
function DBracketScreen({ matches = MATCHES }) {
  const [view, setView] = useState('groups');

  const r32 = BRACKET.R32?.slice(0, 8) || [];

  return (
    <>
      <div className="desk-chiprow">
        {[
          { id: 'groups',   label: 'Group stage' },
          { id: 'knockout', label: 'Knockout bracket' },
        ].map(t => (
          <button
            key={t.id}
            className={'chip ' + (view === t.id ? 'active' : '')}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === 'groups' && (
        <div className="desk-groups">
          {GROUPS.map(g => {
            const groupMatches = matches.filter(m => m.group === g.id);
            const cities = [...new Set(groupMatches.map(m => m.venue?.split(',').pop()?.trim()).filter(Boolean))];
            return (
              <div key={g.id} className="group-card">
                <div className="group-card__title">Group <em>{g.id}</em></div>
                {g.teams.map((t, i) => {
                  const team = getTeam(t.code);
                  return (
                    <div key={t.code} className={'group-row ' + (i < 2 ? 'q' : '')}>
                      <span className="rk">{i + 1}</span>
                      <span style={{ fontSize: 14 }}>{team.flag}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{team.name}</span>
                      <span className="pts">{t.pts}</span>
                    </div>
                  );
                })}
                <div style={{
                  fontSize: 9.5, color: 'var(--ink-3)', marginTop: 8, paddingTop: 6,
                  borderTop: '1px solid var(--line)', letterSpacing: '0.06em',
                }}>
                  Top 2 + best 3rds advance
                  {cities.length > 0 && (
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>· {cities.join(' · ')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'knockout' && (
        <div className="desk-bracket">
          <div style={{ padding: '0 0 8px', fontSize: 11, color: 'var(--ink-3)' }}>
            Scroll horizontally to navigate the bracket →
          </div>
          <div className="bracket-scroll">
            <div className="bracket">
              <div className="bracket-round">
                <div className="bracket-round__title">Round of 32</div>
                {r32.map((m, i) => (
                  <DBracketMatch key={i} home={m.home} away={m.away} />
                ))}
              </div>
              <div className="bracket-round">
                <div className="bracket-round__title">Round of 16</div>
                {[0,1,2,3].map(i => <DBracketMatch key={i} tbd />)}
              </div>
              <div className="bracket-round">
                <div className="bracket-round__title">Quarterfinals</div>
                {[0,1].map(i => <DBracketMatch key={i} tbd />)}
              </div>
              <div className="bracket-round">
                <div className="bracket-round__title">Semifinal</div>
                <DBracketMatch tbd />
              </div>
              <div className="bracket-round" style={{ justifyContent: 'center' }}>
                <div className="bracket-round__title" style={{ color: 'var(--gold)' }}>Final · Jul 19</div>
                <div className="bracket-match" style={{ borderColor: 'var(--gold)', background: 'var(--gold-soft)' }}>
                  <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--gold)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>METLIFE</div>
                    <div style={{ fontSize: 24, marginTop: 4 }}>🏆</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>TBD vs TBD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DBracketMatch({ home, away, tbd }) {
  if (tbd) {
    return (
      <div className="bracket-match" style={{ opacity: 0.55 }}>
        <div className="bracket-team">
          <div className="bracket-team__name"><span style={{ color: 'var(--ink-3)' }}>TBD</span></div>
          <span className="bracket-score" style={{ color: 'var(--ink-3)' }}>·</span>
        </div>
        <div className="bracket-team">
          <div className="bracket-team__name"><span style={{ color: 'var(--ink-3)' }}>TBD</span></div>
          <span className="bracket-score" style={{ color: 'var(--ink-3)' }}>·</span>
        </div>
      </div>
    );
  }
  const h = getTeam(home), a = getTeam(away);
  return (
    <div className="bracket-match">
      <div className="bracket-team">
        <div className="bracket-team__name">
          <span style={{ fontSize: 14 }}>{h.flag}</span>
          <span>{h.name}</span>
        </div>
        <span className="bracket-score">—</span>
      </div>
      <div className="bracket-team">
        <div className="bracket-team__name">
          <span style={{ fontSize: 14 }}>{a.flag}</span>
          <span>{a.name}</span>
        </div>
        <span className="bracket-score">—</span>
      </div>
    </div>
  );
}

// ── Desktop Leaderboard ───────────────────────────────────────
function DLeaderboardScreen() {
  const [period, setPeriod] = useState('alltime');
  const sorted = [...FRIENDS].sort((a, b) => b.balance - a.balance);
  const top3 = sorted.slice(0, 3);

  return (
    <>
      <div className="desk-chiprow">
        {[
          { id: 'alltime', label: 'All time' },
          { id: 'week',    label: 'This week' },
          { id: 'today',   label: 'Today' },
        ].map(p => (
          <button
            key={p.id}
            className={'chip ' + (period === p.id ? 'active' : '')}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="desk-grid split" style={{ marginTop: 0 }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 14, padding: '28px 28px 24px',
        }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Top of the table</div>
          <div className="podium" style={{ padding: 0, marginBottom: 0 }}>
            {[
              { ...top3[1], rank: 2 },
              { ...top3[0], rank: 1 },
              { ...top3[2], rank: 3 },
            ].map(f => (
              <div key={f.id} className={'podium-block rank' + f.rank}>
                <div className="podium-avatar">{f.name[0]}</div>
                <div className="podium-name">{f.name}</div>
                <div className="podium-amt">{fmtMoney(f.balance)}</div>
                <div className="podium-bar">{f.rank}</div>
              </div>
            ))}
          </div>
          <div style={{
            textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)',
            marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line)',
          }}>
            Settled at end of tournament · Winner takes the pot
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {sorted.map((f, i) => {
            const IS_ME = f.id === ME_ID;
            const delta = (i % 3 === 0) ? +Math.round(f.balance * 0.08) :
                          (i % 3 === 1) ? -Math.round(f.balance * 0.04) :
                                          +Math.round(f.balance * 0.02);
            return (
              <div key={f.id} className={'lb-row ' + (IS_ME ? 'me' : '')} style={{ padding: '13px 18px' }}>
                <span className="lb-rank">{i + 1}</span>
                <div className="lb-avatar">{f.name[0]}</div>
                <div className="lb-name">
                  {f.name}
                  {IS_ME && (
                    <span style={{
                      marginLeft: 8, fontSize: 9, padding: '2px 6px',
                      background: 'var(--gold)', color: '#051912',
                      borderRadius: 4, fontWeight: 800, letterSpacing: '0.06em',
                    }}>YOU</span>
                  )}
                </div>
                <span className="lb-amt">{fmtMoney(f.balance)}</span>
                <span className={'lb-delta ' + (delta >= 0 ? 'win' : 'loss')}>
                  {delta >= 0 ? '↑' : '↓'} {fmtCompact(Math.abs(delta))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Desktop My Bets ───────────────────────────────────────────
function DBetsScreen() {
  const [tab, setTab] = useState('open');
  const mine = BETS.filter(b => b.user === ME_ID);
  const filtered = tab === 'all' ? mine : mine.filter(b => b.status === tab);

  const totalOpen = mine.filter(b => b.status === 'open').reduce((s, b) => s + b.amount, 0);
  const totalWon  = mine.filter(b => b.status === 'won').reduce((s, b) => s + (b.payout - b.amount), 0);
  const winRate   = (() => {
    const settled = mine.filter(b => b.status === 'won' || b.status === 'lost');
    if (!settled.length) return 0;
    return Math.round(100 * mine.filter(b => b.status === 'won').length / settled.length);
  })();

  return (
    <>
      <div className="desk-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 22 }}>
        <div className="desk-stat gold">
          <div className="desk-stat__label">Open stake</div>
          <div className="desk-stat__val">{fmtMoney(totalOpen)}</div>
          <div className="desk-stat__sub">{mine.filter(b => b.status === 'open').length} live bets</div>
        </div>
        <div className="desk-stat gold">
          <div className="desk-stat__label">Lifetime won</div>
          <div className="desk-stat__val">+{fmtMoney(totalWon)}</div>
          <div className="desk-stat__sub">across {mine.filter(b => b.status === 'won').length} bets</div>
        </div>
        <div className="desk-stat">
          <div className="desk-stat__label">Win rate</div>
          <div className="desk-stat__val">{winRate}%</div>
          <div className="desk-stat__sub">last 30 days</div>
        </div>
      </div>

      <div className="desk-chiprow">
        {[
          { id: 'open', label: 'Open · ' + mine.filter(b => b.status === 'open').length },
          { id: 'won',  label: 'Won · '  + mine.filter(b => b.status === 'won').length  },
          { id: 'lost', label: 'Lost · ' + mine.filter(b => b.status === 'lost').length },
          { id: 'all',  label: 'All bets' },
        ].map(t => (
          <button
            key={t.id}
            className={'chip ' + (tab === t.id ? 'active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr 130px 110px 110px 80px',
        gap: 16, padding: '0 18px 8px',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        color: 'var(--ink-3)', textTransform: 'uppercase',
      }}>
        <span>Date</span>
        <span>Match</span>
        <span>Pick</span>
        <span style={{ textAlign: 'right' }}>Stake</span>
        <span style={{ textAlign: 'right' }}>Return</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      <div className="desk-bets">
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>
            No {tab} bets
          </div>
        )}
        {filtered.map(b => {
          const m = getMatch(b.matchId);
          if (!m) return null;
          const h = getTeam(m.home);
          const a = getTeam(m.away);
          const pickName = b.pick === 'home' ? h.name : b.pick === 'away' ? a.name : 'Draw';
          const possible = Math.round(b.amount * b.oddsAt);
          const ret = b.status === 'won' ? b.payout : b.status === 'lost' ? 0 : possible;
          return (
            <div key={b.id} className="desk-bet">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                <div style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 12 }}>{fmtTimeIST(m.time)}</div>
                {fmtDate(m.date)}
              </div>
              <div className="desk-bet__match">
                <span style={{ fontSize: 14 }}>{h.flag}</span>
                <span>{h.code}</span>
                <span className="vs">vs</span>
                <span>{a.code}</span>
                <span style={{ fontSize: 14 }}>{a.flag}</span>
                {m.status === 'live' && <LiveDot minute={m.minute} />}
              </div>
              <div className="desk-bet__pick">
                {pickName}
                <span className="odds">@ {b.oddsAt.toFixed(2)}</span>
              </div>
              <div className="desk-bet__num">{fmtMoney(b.amount)}</div>
              <div className={'desk-bet__num ' + (b.status === 'won' ? 'win' : b.status === 'lost' ? 'loss' : 'gold')}>
                {b.status === 'lost' ? '—' : fmtMoney(ret)}
              </div>
              <div className="desk-bet__status">
                <span className={'bet-card__status ' + b.status}>{b.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Desktop App (root) ────────────────────────────────────────
export default function DesktopApp({ tab, setTab, balance, openBet, matches, ledgerProps }) {
  const titles = {
    home:    { title: 'Dashboard',    sub: 'FIFA World Cup 2026 · Group stage underway' },
    matches: { title: 'Fixtures',     sub: 'All matches · group stage + knockout' },
    bracket: { title: 'Tournament',   sub: '48 teams · 12 groups · single elimination' },
    leaders: { title: 'Leaderboard',  sub: 'Yaaron group · 8 friends · ₹102,840 pot' },
    bets:    { title: 'My Bets',      sub: 'Your stakes across the tournament' },
    ledger:  { title: 'Token Ledger', sub: 'Generated · spent · won — settled at cash-out' },
  };
  const t = titles[tab] || titles.home;

  return (
    <DesktopShell
      tab={tab} onNav={setTab} balance={balance}
      title={t.title} sub={t.sub}
      hideSearch={tab === 'bracket'}
    >
      {tab === 'home'    && <DHomeScreen matches={matches} balance={balance} onBet={openBet} onNav={setTab} />}
      {tab === 'matches' && <DMatchesScreen matches={matches} onBet={openBet} />}
      {tab === 'bracket' && <DBracketScreen matches={matches} />}
      {tab === 'leaders' && <DLeaderboardScreen />}
      {tab === 'bets'    && <DBetsScreen />}
      {tab === 'ledger'  && <LedgerScreen {...ledgerProps} />}
    </DesktopShell>
  );
}

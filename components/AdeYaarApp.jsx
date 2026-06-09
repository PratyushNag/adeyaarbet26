'use client';

import { useState, useEffect, useCallback } from 'react';
import { MATCHES, getFriend, getMatch, getTeam, ME_ID, fmtCompact, fmtMoney } from '@/lib/data';
import { LEDGER_TYPES } from '@/lib/ledger';
import { fetchLedger, appendLedger } from '@/lib/ledgerClient';
import { AppHeader, TabBar, PlaceBetSheet, Toast } from '@/components';
import HomeScreen from '@/components/screens/HomeScreen';
import MatchesScreen from '@/components/screens/MatchesScreen';
import BracketScreen from '@/components/screens/BracketScreen';
import LeaderboardScreen from '@/components/screens/LeaderboardScreen';
import BetsScreen from '@/components/screens/BetsScreen';
import LedgerScreen from '@/components/screens/LedgerScreen';
import DesktopApp from '@/components/desktop/DesktopApp';

function getFifaStatus(fifa) {
  if (fifa.HomeTeamScore != null && fifa.AwayTeamScore != null) return 'finished';
  if (fifa.MatchStatus === 3) return 'live';
  return 'upcoming';
}

function mergeWithFifa(staticMatch, fifaResults) {
  if (!fifaResults?.length) return { ...staticMatch, status: 'upcoming' };
  const fifa = fifaResults.find(m =>
    m.Home?.Abbreviation === staticMatch.home &&
    m.Away?.Abbreviation === staticMatch.away
  );
  if (!fifa) return { ...staticMatch, status: 'upcoming' };
  const stadiumName = fifa.Stadium?.Name?.[0]?.Description;
  const cityName = fifa.Stadium?.CityName?.[0]?.Description;
  const venue = stadiumName
    ? cityName ? `${stadiumName}, ${cityName}` : stadiumName
    : staticMatch.venue;
  const status = getFifaStatus(fifa);
  const score = (fifa.HomeTeamScore != null && fifa.AwayTeamScore != null)
    ? [fifa.HomeTeamScore, fifa.AwayTeamScore]
    : null;
  const minute = fifa.MatchMinute ?? null;
  return { ...staticMatch, venue, fifaId: fifa.IdMatch, status, score, minute };
}

export default function AdeYaarApp() {
  const theme = 'midnight';
  const [tab, setTab]           = useState('home');
  const [betSheet, setBetSheet] = useState(null);
  const [toast, setToast]       = useState(null);
  const [balance, setBalance]   = useState(getFriend(ME_ID).balance);
  const [fifaData, setFifaData] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [ledger, setLedger]     = useState([]);
  const [bets, setBets]         = useState([]);
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    fetch('/api/fifa/matches')
      .then(r => r.json())
      .then(setFifaData)
      .catch(() => {});
  }, []);

  // Load the ledger. If nothing exists yet, seed the starting balance as a
  // "generated" entry so the cash-out math has a baseline to work from.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { entries, persisted: ok } = await fetchLedger(ME_ID);
      if (cancelled) return;
      setPersisted(ok);
      if (entries && entries.length) {
        setLedger(entries);
        return;
      }
      const seed = getFriend(ME_ID).balance;
      const { entry, persisted: wrote } = await appendLedger({
        user: ME_ID, type: LEDGER_TYPES.MINT, amount: seed, note: 'Opening balance',
      });
      if (cancelled) return;
      setPersisted(ok && wrote);
      setLedger([entry]);
    })();
    return () => { cancelled = true; };
  }, []);

  // Append a ledger entry locally (optimistic) and persist best-effort.
  const logLedger = useCallback(async ({ type, amount, ref = null, note = '' }) => {
    const { entry, persisted: wrote } = await appendLedger({ user: ME_ID, type, amount, ref, note });
    setLedger(prev => [...prev, entry]);
    if (!wrote) setPersisted(false);
  }, []);

  // Generate ("mint") tokens — logged so it can never be hidden at cash-out.
  const generateTokens = useCallback((amount) => {
    const amt = Math.max(0, Math.round(Number(amount) || 0));
    if (!amt) return;
    setBalance(b => b + amt);
    logLedger({ type: LEDGER_TYPES.MINT, amount: amt, note: 'Generated tokens' });
    setToast(`Generated ₹${amt.toLocaleString('en-IN')}`);
  }, [logLedger]);

  // Settle an open stake. Winning logs the winnings; losing just closes it
  // (the staked tokens were already spent and don't come back).
  const settleBet = useCallback((betId, outcome, winAmount) => {
    setBets(prev => prev.map(b => b.id === betId ? { ...b, status: outcome } : b));
    const bet = bets.find(b => b.id === betId);
    if (!bet) return;
    const match = getMatch(bet.matchId);
    const team  = bet.pick === 'home' ? getTeam(match.home) :
                  bet.pick === 'away' ? getTeam(match.away) : null;
    const pickName = team ? team.name : 'Draw';
    if (outcome === 'won') {
      const amt = Math.max(0, Math.round(Number(winAmount) || 0));
      setBalance(b => b + amt);
      logLedger({ type: LEDGER_TYPES.WIN, amount: amt, ref: betId, note: `Won on ${pickName}` });
      setToast(`Won ₹${amt.toLocaleString('en-IN')} on ${pickName}`);
    } else {
      setToast(`Marked lost · ${pickName}`);
    }
  }, [bets, logLedger]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const matches = MATCHES.map(m => mergeWithFifa(m, fifaData));

  const openBet  = (match, pick) => setBetSheet({ match, pick });
  const closeBet = () => setBetSheet(null);

  const confirmBet = ({ matchId, pick, amount, oddsAt }) => {
    setBalance(b => b - amount);
    setBetSheet(null);
    const match = getMatch(matchId);
    const team  = pick === 'home' ? getTeam(match.home) :
                  pick === 'away' ? getTeam(match.away) : null;
    const pickName = team ? team.name : 'Draw';
    const betId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'bet_' + Date.now().toString(36);
    setBets(prev => [...prev, {
      id: betId, user: ME_ID, matchId, pick, amount,
      oddsAt: oddsAt || 2, status: 'open',
    }]);
    // Log the staked tokens — this is the "spent" side of the ledger.
    logLedger({ type: LEDGER_TYPES.STAKE, amount, ref: betId, note: `Stake on ${pickName}` });
    setToast(`Bet placed · ₹${amount.toLocaleString('en-IN')} on ${pickName}`);
  };

  const ledgerProps = {
    ledger, bets, balance, persisted,
    onGenerate: generateTokens,
    onSettle: settleBet,
  };

  if (isDesktop) {
    return (
      <>
        <DesktopApp
          tab={tab} setTab={setTab}
          balance={balance} openBet={openBet}
          matches={matches}
          ledgerProps={ledgerProps}
        />
        {betSheet && (
          <PlaceBetSheet
            match={betSheet.match}
            pick={betSheet.pick}
            balance={balance}
            onClose={closeBet}
            onConfirm={confirmBet}
          />
        )}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="stage">
      {/* Phone frame */}
      <div className="phone-frame">
        <div className="app" data-theme={theme}>
          <AppHeader balance={balance} onTap={() => setTab('bets')} />

          <div className="scroll">
            {tab === 'home'    && <HomeScreen matches={matches} balance={balance} onBet={openBet} onNav={setTab} />}
            {tab === 'matches' && <MatchesScreen matches={matches} onBet={openBet} />}
            {tab === 'bracket' && <BracketScreen matches={matches} />}
            {tab === 'leaders' && <LeaderboardScreen balance={balance} />}
            {tab === 'bets'    && <BetsScreen />}
            {tab === 'ledger'  && <LedgerScreen {...ledgerProps} />}
          </div>

          <TabBar active={tab} onChange={setTab} />

          {betSheet && (
            <PlaceBetSheet
              match={betSheet.match}
              pick={betSheet.pick}
              balance={balance}
              onClose={closeBet}
              onConfirm={confirmBet}
            />
          )}

          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </div>
      </div>
    </div>
  );
}

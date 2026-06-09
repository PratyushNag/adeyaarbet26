-- AdeYaar 2026 — Token ledger table
-- Run this in the Supabase SQL editor once to enable persistent ledger logging.
-- Every token event (generated / spent / won) is an append-only row here, so a
-- player can't quietly mint tokens off the books: minting is logged, and at
-- cash-out any generated tokens that were never staked are removed.

create table if not exists public.ledger (
  id         uuid primary key default gen_random_uuid(),
  username   text not null,
  type       text not null check (type in ('mint', 'stake', 'win')),
  amount     integer not null check (amount >= 0),
  ref        text,            -- optional id of the related bet
  note       text default '',
  created_at timestamptz not null default now()
);

-- Fast lookups when settling a single player's ledger.
create index if not exists ledger_username_created_idx
  on public.ledger (username, created_at);

-- The app reads/writes the ledger with the anon key, mirroring the existing
-- `users` table usage. Enable RLS with permissive policies for the group app.
alter table public.ledger enable row level security;

drop policy if exists ledger_read on public.ledger;
create policy ledger_read on public.ledger
  for select using (true);

drop policy if exists ledger_insert on public.ledger;
create policy ledger_insert on public.ledger
  for insert with check (true);

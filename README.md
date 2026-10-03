# dwb

Moh's clothing shop: React + Vite on Supabase, with Chargily Pay V2 checkout
through Supabase Edge Functions in `supabase/functions/`.

## Environment

Copy `.env.example` to `.env` for the browser values (`VITE_*`, public).

Server secrets (Chargily API URL and key) live in Supabase as Edge Function
secrets, never in `.env` and never with a `VITE_` prefix. See
`supabase/functions/.env.example`. `SUPABASE_URL` and the service/secret keys
are injected into the functions by Supabase automatically.

## Database setup (once)

Run `scripts/checkout-setup.sql` in the Supabase SQL editor. It lets the
checkout page read `delivery_rates` and adds a row for any missing wilaya
(codes 1-58, matching `supabase/functions/_shared/algeria.json`). Then set prices:

```sql
update delivery_rates set home_price = 600, desk_price = 400 where wilaya_code = 16;
```

An option is offered when its price is not null. If only one is priced, the
checkout selects it automatically; if neither is, the wilaya shows as
unavailable. `is_active = false` turns a whole wilaya off.

## Edge Functions

- `create-checkout`: called by the checkout page through
  `supabase.functions.invoke`. Reprices the cart server-side, stores the order,
  and for Edahabia/CIB creates the Chargily checkout.
- `chargily-webhook`: Chargily's webhook (`{SUPABASE_URL}/functions/v1/chargily-webhook`),
  authenticated by its HMAC signature. Marks orders paid and products sold.
- `_shared/`: code used by both functions and, for `checkout.js` and
  `algeria.json`, by the browser too (one copy of the validation rules and the
  wilaya list). It sits under `supabase/functions` because only that tree is
  bundled on deploy.

Both are deployed with `--no-verify-jwt` (also set in `supabase/config.toml`).
Chargily sends no Supabase token, so the webhook relies on its HMAC signature.
Shoppers aren't logged in and call `create-checkout` with the site's public
key, so the JWT check would add nothing there, and it would reject every call
once the site switches from the legacy anon key to an `sb_publishable_` key
(Supabase retires legacy keys at the end of 2026).

### Deploy

```sh
npx supabase login
npx supabase link --project-ref dwiswljucejiodfryhcg
cp supabase/functions/.env.example supabase/functions/.env   # then fill it in
npx supabase secrets set --env-file supabase/functions/.env
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy chargily-webhook --no-verify-jwt
```

## Local development

```sh
npm install
npm run dev
```

The site calls the deployed `create-checkout` function. Chargily's success and
failure redirects go back to whichever site made the request (its `Origin`
header), so a local dev server gets redirected back to itself. Test cards are listed in
Chargily's docs (test mode, `CHARGILY_API_URL=https://pay.chargily.net/test/api/v2`).

## Hosting

The site is a static SPA (`npm run build` → `dist/`). Whatever host serves it
must fall back to `index.html` for unknown paths, so deep links like
`/checkout/success` work.

## Checkout flow

1. `/checkout` sends cart ids + quantities + customer details to
   `create-checkout`.
2. The function re-reads products and the delivery rate, recomputes the total,
   and inserts a `pending` / `unpaid` order.
3. Cash on delivery: done; the customer lands on `/checkout/success`.
   Edahabia/CIB: the function creates a Chargily checkout for that amount and
   the browser is redirected to it.
4. Chargily calls `chargily-webhook` (HMAC-signed). `checkout.paid` marks the
   order `paid` / `confirmed` and its products sold; `failed` / `canceled`
   update `payment_status`.
5. The customer lands on `/checkout/success` (cart cleared) or
   `/checkout/failed` (cart kept).

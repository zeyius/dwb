# dwb

Moh's clothing shop: React + Vite on Supabase, with Chargily Pay V2 checkout
through Vercel functions in `api/`.

## Environment

Copy `.env.example`. Browser values (`VITE_*`) go in `.env`; server secrets go
in `.env.local` locally and in Vercel → Settings → Environment Variables in
production. `CHARGILY_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never get
a `VITE_` prefix: those are bundled into the public site.

## Database setup (once)

Run `scripts/checkout-setup.sql` in the Supabase SQL editor. It lets the
checkout page read `delivery_rates` and adds a row for any missing wilaya
(codes 1-58, matching `src/data/algeria.json`). Then set prices:

```sql
update delivery_rates set home_price = 600, desk_price = 400 where wilaya_code = 16;
```

An option is offered when its price is not null. If only one is priced, the
checkout selects it automatically; if neither is, the wilaya shows as
unavailable. `is_active = false` turns a whole wilaya off.

## Local development

```sh
npm install
npx vercel dev        # site + /api on http://localhost:3000
```

`vercel dev` needs a Vercel login and a linked project the first time.
Chargily's test mode redirects back to `SITE_URL` fine on localhost, but its
webhook can't reach your machine. To test payment confirmation, expose port
3000 with a tunnel (e.g. `cloudflared tunnel --url http://localhost:3000`) and
set `SITE_URL` to the tunnel URL.

Test cards are listed in Chargily's docs (test mode,
`CHARGILY_API_URL=https://pay.chargily.net/test/api/v2`).

## Checkout flow

1. `/checkout` posts cart ids + quantities + customer details to
   `api/create-checkout`.
2. The function re-reads products and the delivery rate with the service role
   key, recomputes the total, inserts an `unpaid` order, creates a Chargily
   checkout for that amount, and returns its URL.
3. Chargily calls `api/chargily-webhook` (HMAC-signed). `checkout.paid` marks
   the order `paid` / `confirmed` and its products sold; `failed` / `canceled`
   update `payment_status`.
4. The customer lands on `/checkout/success` (cart cleared) or
   `/checkout/failed` (cart kept).

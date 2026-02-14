---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Stripe Local Testing Guide

This project uses Stripe Checkout for paid service orders and a webhook endpoint to finalize order state.

## Environment Checklist

Set these values in `backend/.env`:

- `STRIPE_KEY` - publishable key (starts with `pk_test_...`)
- `STRIPE_SECRET` - secret key (starts with `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` - webhook signing secret from Stripe CLI or Dashboard
- `FRONTEND_URL` - frontend base URL, default `http://localhost:3000`

Frontend already calls backend through `NEXT_PUBLIC_API_URL`.

## Start Local Services

1. Start backend + dependencies.
2. Start frontend (`npm run dev` in `frontend`).
3. Ensure backend API is reachable at `http://localhost:8000/api/v1`.

## Stripe CLI Webhook Forwarding

Run Stripe CLI in a separate terminal:

```bash
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe
```

Stripe CLI prints a webhook secret (`whsec_...`). Copy it into `STRIPE_WEBHOOK_SECRET`.

## End-to-End Payment Test

1. Log in as a customer.
2. Go to `/workspace/services`.
3. Select a property and one paid service.
4. Create order, then click **Pay with Stripe** on `/orders/{id}`.
5. Complete payment with Stripe test card:

```text
4242 4242 4242 4242
Any future expiry date
Any CVC
Any ZIP/postal code
```

6. Stripe redirects to `/orders/{id}/confirmation`.
7. Verify order status moves to `paid` and ticket is created.

## Free Service Path Test

1. Select only free services in `/workspace/services`.
2. Create order.
3. Confirm order becomes `paid` immediately and ticket is created without Stripe redirect.

## Useful Stripe CLI Commands

Trigger events manually:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

## Verification Checklist

- `orders.payment_status` transitions correctly:
  - `pending` -> `paid` on `checkout.session.completed`
  - `pending` -> `failed` on `payment_intent.payment_failed`
  - `paid` -> `refunded` on `charge.refunded`
- `orders.status` transitions correctly (`confirmed` after successful payment).
- `tickets` are created once per order item after successful/free payment.

## Common Issues

- `Stripe secret is not configured`: missing `STRIPE_SECRET`.
- `Stripe webhook secret is not configured`: missing `STRIPE_WEBHOOK_SECRET`.
- Signature error: old or wrong `whsec_...` value.
- Success/cancel redirect wrong host: check `FRONTEND_URL`.

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]

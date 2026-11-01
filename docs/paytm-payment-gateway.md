# Paytm Payment Gateway

Checkout uses Paytm's hosted payment page for UPI. Full-payment orders charge
the server-calculated order total; Cash on Delivery orders charge an advance of
up to ₹100. An order is confirmed only after the server verifies the signed
Paytm status response, matching the merchant, order ID, and amount.

## Environment variables

Set these as server-side environment variables in `.env.local` for local
development and in the deployment provider for production:

- `PAYTM_MID`: the merchant MID from Paytm.
- `PAYTM_MERCHANT_KEY`: the merchant key; keep it private.
- `PAYTM_ENV`: `production` for live credentials or `staging` for staging
  credentials.

Never use a `NEXT_PUBLIC_` prefix for the MID/key pair, put credentials in
source control, or send them in chat. The checkout is unavailable unless all
three variables are set to valid values.

Paytm must have the deployed store domain enabled for Payment Gateway checkout.
The callback URL sent during transaction initiation is
`https://megasale-nine.vercel.app/api/paytm/callback`.

## Database

Apply `supabase/migrations/009_paytm_gateway.sql` to the same Supabase project
used by the deployed site. The migration stores the payment provider and
Paytm's transaction reference; existing orders default to the prior UPI
provider value.

## Payment verification

The browser return is not treated as proof of payment. The callback checksum is
validated, and the server queries Paytm's payment-status API before confirming
an order. If Paytm is delayed, the result page and admin order list can check
the status again. COD orders remain COD after their advance is verified.

Do not test production credentials with an unapproved or live charge. Use
staging credentials for integration tests; with production-only credentials,
validate the deployment and configuration without initiating a transaction.

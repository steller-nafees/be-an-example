# Welcome to your Lovable project

TODO: Document your project here

## Stripe test checkout

To use the Stripe test flow added to checkout, set these Supabase Edge Function secrets:

- `STRIPE_SECRET_KEY` with your Stripe test secret key
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The app redirects to Stripe Checkout in test mode. Use the Stripe test card `4242 4242 4242 4242` with any future expiry date and any CVC.

# Welcome to your Lovable project

TODO: Document your project here

## Stripe checkout

To use live Stripe Checkout, set these Supabase Edge Function secrets:

- `STRIPE_SECRET_KEY` with your live Stripe secret key
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The app redirects to Stripe Checkout using your connected Stripe account. Configure your live payment methods in the Stripe Dashboard before going live.

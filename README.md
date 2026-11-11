# KipCash

KipCash is a personal finance app for tracking accounts, transactions, budgets by category, receipts, reconciliations, and reports. It uses Next.js and Supabase. Each signed-in user has their own data, protected by Supabase Row Level Security (RLS).

## Run your own local instance

### 1. Create a Supabase project

Create a project in [Supabase](https://supabase.com/). In the project dashboard, open **Project Settings → API** and copy the Project URL and **publishable** key. Do not use or share the `service_role` key.

### 2. Set up the database

Open **SQL Editor** in the Supabase dashboard. For a new project, run these files in order:

First create the `profiles` table expected by the profile migration and app:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);
```

Then apply the app schema and migrations in this order:

1. [`supabase/schema/finance-workspace.sql`](supabase/schema/finance-workspace.sql)
2. [`supabase/migrations/20261013180000_add_profile_details.sql`](supabase/migrations/20261013180000_add_profile_details.sql)
3. [`supabase/migrations/20261013190000_account_archive_only.sql`](supabase/migrations/20261013190000_account_archive_only.sql)
4. [`supabase/migrations/20261014100000_transaction_lifecycle.sql`](supabase/migrations/20261014100000_transaction_lifecycle.sql)
5. [`supabase/migrations/20261014110000_categories_payees_management.sql`](supabase/migrations/20261014110000_categories_payees_management.sql)
6. [`supabase/migrations/20261015100000_currency_exchange_management.sql`](supabase/migrations/20261015100000_currency_exchange_management.sql)
7. [`supabase/migrations/20261016100000_reconciliation_and_receipts.sql`](supabase/migrations/20261016100000_reconciliation_and_receipts.sql)
8. [`supabase/migrations/20261018120000_reporting_analytics.sql`](supabase/migrations/20261018120000_reporting_analytics.sql)

The migrations enable the app's profile fields, transaction management, categories and payees, currency handling, receipt storage, reconciliation, and reports. The first migration, `20261013170000_remove_legacy_expenses.sql`, drops an obsolete `public.expenses` table. It is only for upgrading an older KipCash installation that still has that legacy table; do not run it on a fresh project.

In **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` for local development and add `http://localhost:3000/**` to the Redirect URLs. For a deployed instance, set the Site URL and allowed redirect URL to your HTTPS domain. Configure the Supabase Auth email templates for reauthentication to display the OTP token with `{{ .Token }}`.

### 3. Configure and start the app

Copy `.env.example` to `.env.local` and fill in your own project's values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The publishable key is designed to be used by the browser. Never put a Supabase `service_role` key or other privileged secret in a `NEXT_PUBLIC_` variable. Keep `.env.local` private; it is ignored by Git.

Then install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and sign in. If email confirmation is enabled in Supabase Auth, confirm the signup using the email Supabase sends. Use `/finance` to add your accounts and transactions; the navigation also links to reports, account and category management, reconciliation, and your profile. KipCash starts with an empty personal workspace, so add your own financial data after signing in.

## Features and routes

- `/finance` — accounts, balances, and transaction overview
- `/reports` — cash flow, spending, account balances, and transaction insights
- `/accounts` and `/transactions` — focused account and transaction management
- `/categories` and `/payees` — manage categories, subcategories, and payees
- `/reconciliation` — reconcile an account statement
- `/profile` — personal details and password security

The former `/manage-expenses` and `/expenses` URLs redirect to `/finance` for existing bookmarks.

Exchange rates use the keyless Frankfurter API. The app caches rates in `public.exchange_rates` and saves the applied base-currency rate on each transaction.

## Deployment

The app is configured for a static export to `out/`. Build with the same three environment variables above, setting `NEXT_PUBLIC_SITE_URL` to your deployed HTTPS URL. Configure that domain in Supabase Auth's Site URL and Redirect URLs as well.

### Automatic S3/CloudFront deployment

The [deploy workflow](.github/workflows/deploy.yml) builds the static export, syncs it to S3, and invalidates CloudFront when `main` is updated. It can also be started manually from the GitHub Actions tab.

Configure these GitHub Actions secrets:

- `AWS_DEPLOY_ROLE_ARN` — IAM role configured to trust this repository through GitHub OIDC
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — use only the publishable key, never the `service_role` key
- `NEXT_PUBLIC_SITE_URL` — the deployed HTTPS URL

Configure these GitHub Actions variables:

- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

Restrict the deployment role to this repository and the `main` branch. Give it only the permissions needed to list and sync the target bucket, delete stale export files, and create CloudFront invalidations.

## Development checks

```sh
npm run lint
npx tsc --noEmit
npm run build
```

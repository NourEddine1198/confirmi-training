# Confirmi Training

Agent training platform for order confirmation and status management. Trainees practice on realistic scenarios and results are saved to a database for the trainer to review.

## What's inside

- **Status Training** — `/training/training-status.html` — 10 scenarios testing order status decisions
- **Confirmation Training** — `/training/training-confirmation.html` — 8 scenarios testing order confirmation skills
- **Admin Dashboard** — `/training/training-admin.html` — View all training results, filter by agent/module

## How to run locally

```bash
npm install
# Edit .env with your Neon database URL
npm run db:push    # Creates the database table
npm run dev        # Starts on http://localhost:3000
```

## How to deploy

Push to GitHub, then connect the repo to Netlify. Set these environment variables in Netlify:
- `DATABASE_URL` — your Neon connection string
- `TRAINING_ADMIN_PASSWORD` — password for the admin dashboard

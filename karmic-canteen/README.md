## Karmic Canteen Platform

Karmic Canteen is a web-based engagement and planning experience for Karmic Solutions employees and the kitchen operations crew. It streamlines menu visibility, proactively captures meal commitments, and arms canteen admins with waste-reduction analytics.

### Core modules

- **Authentication** – Secure credential check using a Credentials provider. Demo users are seeded (`asha.menon@karmicsolutions.com` / `password123`, `karan.patel@karmicsolutions.com` / `admin123`).
- **Employee workspace** – Interactive view of the upcoming menu with per-meal attendance toggles, dietary profile management, and personal engagement streak tracking.
- **Admin console** – Demand radar summarising breakfast/lunch/snack commitments, average drop-off, and a week-long heatmap to fine-tune procurement.
- **Mock data services** – Temporary in-memory persistence for menus, user profiles, preferences, and commitments (suitable for demos and to be replaced with a production datastore).

### Getting started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with one of the demo accounts. Update `NEXTAUTH_SECRET` in `.env.local` when deploying.

### Environment

Copy the sample environment file:

```bash
cp .env.local.example .env.local
```

### Production readiness

- Swap the mock data layer (`src/lib/mockDb.ts`) with a persistent data store (PostgreSQL, Supabase, etc.).
- Integrate with the corporate identity provider via SAML/OAuth using the same NextAuth scaffolding.
- Add scheduled jobs for reminder notifications and procurement exports.

### Tech stack

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [SWR](https://swr.vercel.app/) data hooks

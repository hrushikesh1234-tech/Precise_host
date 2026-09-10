# Running the project

This is a TanStack Start application built with Vite, React, TypeScript, Tailwind CSS, and Supabase.

## Development

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 5000
```

## Production build

```sh
npm run build
```

The Vite configuration uses Nitro's Vercel preset, so the production build is emitted to `.vercel/output` for Vercel's deployment output API.

## Environment variables

The public site needs:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Admin gallery changes also need these server-only variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

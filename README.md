# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Copy `.env.example` to `.env` and provide the five Supabase/admin values before
starting. Apply the SQL files in `supabase/migrations` to the connected Supabase
project. The migrations create the public content tables and the private
`gallery` Storage bucket.

## Vercel deployment

Import the repository in Vercel and add the same five variables from
`.env.example` in Project Settings → Environment Variables. `npm run build`
emits Vercel Build Output API files under `.vercel/output`; `vercel.json` and
the Nitro `vercel` preset configure the deployment.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

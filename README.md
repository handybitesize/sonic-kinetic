# Sonic Kinetic

Vercel-ready Next.js build of the Sonic Kinetic rhythm training app.

## Stack

- Next.js App Router
- React
- CSS with a custom neon design system
- Web Audio API for the click track

## Local Run

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy To Vercel

This project is structured as a normal Next.js app, so Vercel can deploy it directly.

```bash
npm install
npx vercel
```

Or push it to GitHub and import the repository in Vercel.

## Gameplay

- `Start Practice` begins the session
- `LISTEN` phase plays a click loop
- `TAP` phase opens the center pad for input
- Click the pad or press `Space`
- Hits are scored as `PERFECT`, `GREAT`, `GOOD`, or `MISS`
- After 3 clean loops the target pattern increases in complexity

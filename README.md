# Tour search (test task)

React + TypeScript + Vite.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Local run

```bash
npm install
npm run dev
```

## Git / Husky

After `git init`, run `npm install` so the `prepare` script registers Husky. Commits run `lint-staged` (ESLint + Prettier on staged files).

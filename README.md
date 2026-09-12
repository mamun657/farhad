# Farhad Global Trade

Farhad Global Trade is a premium landing page for an import and supply business focused on connecting international sourcing with the Bangladeshi market.

## Stack

- React + Vite
- Express API for chat and health checks
- Render-ready static build output

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment

This project is intended for deployment on Render using a Node web service or static-site configuration that serves the built Vite app from `dist/`.

## Environment variables

Create a local `.env` file with the variables you need. Do not commit secrets.

```bash
PORT=3000
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
GROQ_API_KEY=
GROQ_MODEL=
```

## Media

Place updated branding and video assets in the project media structure:

```text
public/
  media/
    farhad-global-trade-hero.mp4
    farhad-global-trade-poster.svg
    automotive.jpg
    electronics.jpg
    fresh-fruits.jpg
    cattle-feed.jpg
```

## Git

This project was prepared to be connected to a new GitHub repository later. Do not attach an old repository remote.

# O'Prep - The Ultimate Study Methodology Platform

This is the O'Prep study methodology platform built with [Next.js](https://nextjs.org) and TypeScript.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin Guide

### Website Content Management

Admins can manage website content through the `/admin/website` interface. This includes:

#### Community Voices

- **Add/Edit Voices**: Click "Add Voice" to create new community testimonials
- **Fields**: Name, Role, Institution, Content, Image URL, Active Status
- **Display**: Shows on homepage if active

#### Campus Stories

- **Add/Edit Stories**: Click "Add Story" to create campus experience stories
- **Fields**: Title, Institution, Content, Author, Image URL, Active Status
- **Display**: Shows on homepage if active

#### Learner Testimonials

- **Add/Edit Testimonials**: Click "Add Testimonial" to create learner success stories
- **Fields**: Name, Program, Institution, Content, Image URL, Active Status
- **Display**: Shows on homepage if active

#### Blog Posts

- **Add/Edit Posts**: Click "Add Post" to create blog articles
- **Fields**: Title, Content, Excerpt, Author, Category, Tags, Image URL, Published Status
- **Display**: Available via `/api/website/blog` endpoints

### Content Guidelines

- **Active Status**: Only active/published content appears on the public website
- **Image URLs**: Use full URLs for images (hosted externally)
- **Content**: Keep content concise and engaging
- **Categories**: Use consistent category names for blog posts

### API Endpoints

- Public website consumes content via `/api/website/*` endpoints
- Admin management via `/api/admin/website/*` endpoints

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Cloudflare Workers

This project is configured for Cloudflare Workers using OpenNext.

### Deploy from Cloudflare Dashboard (GitHub repo)

Use this flow if you want to deploy by importing this repository directly in Cloudflare UI.

1. In Cloudflare dashboard, open **Workers & Pages**.
2. Click **Create application**.
3. Click **Import a repository** and select this GitHub repo.
4. In build settings, use exactly:

```text
Build command: npx @opennextjs/cloudflare build
Deploy command: npx @opennextjs/cloudflare deploy
Root directory: /
```

5. Set environment variables/secrets in Cloudflare for your production app.

Required (minimum):
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL

Also add these from `.env.example` when used in your deployment:
- JWT_SECRET
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET_NAME

Important: the Worker name in dashboard must match `name` in `wrangler.jsonc` (`prepnmcn`). If you choose another Worker name in UI, update `wrangler.jsonc` to match before deploying.

### Commands

- Build worker bundle only:

```bash
pnpm cf:build
```

- Build and deploy to Cloudflare:

```bash
pnpm cf:deploy
```

- Generate Worker environment type definitions:

```bash
pnpm cf:typegen
```

### Notes

- `wrangler.jsonc` uses `nodejs_compat` for Node APIs required by this app.
- This app currently uses a Node/Postgres + TypeORM setup; ensure your Cloudflare environment can reach your Postgres database.

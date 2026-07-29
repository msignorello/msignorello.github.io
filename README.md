# mattsignorello.com

Source for Matt Signorello's personal website: a portfolio, writing archive, and
home for professional and personal projects.

The site is intentionally built as a lightweight static project rather than a
traditional CMS. Articles and feature pages are stored as Markdown/MDX, the
presentation is shared through reusable Astro layouts, and every published
change can be reviewed in Git history.

## What This Project Demonstrates

- Product and content design for a professional portfolio
- Astro and TypeScript-based static-site development
- Structured Markdown/MDX publishing
- Responsive, accessible layouts without a client-side application framework
- SEO metadata, structured data, RSS, sitemap, and legacy URL redirects
- Privacy-aware GA4 analytics and outbound-link tracking
- Automated deployment through GitHub Actions and GitHub Pages

## Technology

- [Astro](https://astro.build/)
- MDX content collections
- TypeScript
- Plain CSS
- GitHub Actions and GitHub Pages

## Local Development

This project uses pnpm.

```sh
pnpm install
pnpm dev
```

The production build is generated in `dist/`:

```sh
pnpm build
```

## Content

- Articles: `src/content/articles/`
- Personal feature pages: `src/content/features/`
- Homepage content: `src/data/homepage.ts`
- Public images: `public/images/`

See [EDITING.md](EDITING.md) for the article format and routine editing steps.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`. The workflow builds the
static Astro site and publishes it through GitHub Pages.

Google Analytics is optional. To enable it, add a GitHub Actions repository
variable named `PUBLIC_GA_MEASUREMENT_ID` with the site's GA4 measurement ID.
No passwords or private API credentials are required by the site.

The custom domain is declared in `public/CNAME`. DNS should only be moved to
GitHub Pages after the deployed site has been reviewed.

## Content Rights

This repository is public so the implementation can be inspected. Unless
otherwise noted, the writing, photographs, personal information, and visual
assets remain copyright Matt Signorello and are not offered for reuse.

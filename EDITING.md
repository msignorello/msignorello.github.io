# Website Editing Guide

This site is designed so routine edits happen in Markdown/MDX content files, not inside layouts.

## Common Edits

### Add or edit an article

Articles live in:

```text
src/content/articles/
```

Each article is an `.mdx` file with frontmatter:

```yaml
---
title: "Article title"
description: "Short SEO description."
date: "2026-07-08"
tags: ["Leadership", "Systems"]
coverImage:
  src: "/images/articles/example.webp"
  alt: "Useful description of the image"
featured: false
---
```

Edit the body below the frontmatter like normal Markdown.

Use a lowercase, hyphenated filename that matches the final URL. For example:

```text
why-product-support-belongs-in-the-roadmap.mdx
```

An AI writing or editing agent should return the complete `.mdx` file, including
frontmatter, headings, lists, callouts, image suggestions, and the finished article
body. It should not invent metrics, employers, dates, quotations, or project claims.

### Add or edit a feature page

Feature pages live in:

```text
src/content/features/
```

Use these for evergreen pages like Lucy, arcade, hobbies, or collections.

### Replace images

Store site-owned images in:

```text
public/images/
```

Recommended slots:

- Article covers: `public/images/articles/`
- Other site images: `public/images/`

Paths in Markdown begin at `/images/`. Include descriptive alternative text for
every meaningful image.

### Update contact information

The contact page uses direct links rather than a form or server-side email service:

```text
src/pages/contact.astro
```

Update the email, LinkedIn profile, or consulting link there. No SMTP password or
other email credential belongs in this project.

## Local Preview

Install dependencies:

```sh
pnpm install
```

Run the development server:

```sh
pnpm dev
```

Build production output:

```sh
pnpm build
```

## Publishing

1. Edit or add content.
2. Run `pnpm build` and review the local site.
3. Commit the change to Git.
4. Push the `main` branch to GitHub.
5. GitHub Actions builds and publishes the site automatically.

The generated `dist/` directory is not committed. Never add `.env`, working
exports, résumé source documents, passwords, or API secrets to the repository.

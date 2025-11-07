# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application called "okane" bootstrapped with `create-next-app`. It uses the App Router architecture with React 19, TypeScript, and Tailwind CSS v4.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Technology Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (loaded via next/font/google)
- **Linting**: ESLint with Next.js config (core-web-vitals + TypeScript)

## Project Structure

```
okane/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout with font setup
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind v4 and CSS variables
├── public/                # Static assets
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.mjs      # ESLint flat config
└── postcss.config.mjs     # PostCSS config for Tailwind
```

## Architecture Notes

### App Router (Next.js 16)
- Uses the `app/` directory structure (not `pages/`)
- Server Components by default (use `"use client"` directive when needed)
- File-based routing: `app/page.tsx` = `/`, `app/about/page.tsx` = `/about`
- Special files: `layout.tsx` (shared UI), `page.tsx` (route UI), `loading.tsx`, `error.tsx`

### TypeScript Configuration
- Path alias configured: `@/*` maps to root directory
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler (optimized for Next.js)
- JSX mode: react-jsx (React 19)

### Styling System
- **Tailwind CSS v4**: Uses new `@import "tailwindcss"` syntax (not v3's @tailwind directives)
- **CSS Variables**: Color scheme uses `--background` and `--foreground` with dark mode support via `prefers-color-scheme`
- **Theme Customization**: Uses `@theme inline` directive to define custom design tokens
- **Font Variables**: `--font-geist-sans` and `--font-geist-mono` for typography

### ESLint Configuration
- Uses new flat config format (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Development Patterns

### Creating New Pages
1. Create a new directory in `app/` (e.g., `app/dashboard/`)
2. Add `page.tsx` for the route UI
3. Optionally add `layout.tsx` for shared layout

### Adding Client Interactivity
When you need hooks, event handlers, or browser APIs:
```tsx
"use client"

export default function InteractiveComponent() {
  // Now you can use useState, useEffect, onClick, etc.
}
```

### Styling Components
- Use Tailwind utility classes directly in JSX
- Reference CSS variables: `bg-background`, `text-foreground`
- Custom fonts are available via: `font-sans` (Geist Sans), `font-mono` (Geist Mono)
- Dark mode: Use `dark:` prefix (e.g., `dark:bg-zinc-900`)

### Import Aliases
Use `@/` prefix for cleaner imports from project root:
```tsx
import { Component } from '@/app/components/Component'
import { utility } from '@/lib/utils'
```

## Important Notes

- This project uses **Tailwind CSS v4**, which has different syntax than v3 (uses `@import` instead of `@tailwind` directives)
- React 19 is used, which may have breaking changes from React 18
- ESLint uses flat config format (no `.eslintrc.json`)
- The project is in initial state - only the default Next.js template exists

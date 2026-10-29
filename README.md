# Toolkit Pro — React Application

A modern React SPA (Vite + TypeScript) providing 218+ free browser-based tools for text, images, PDFs, calculators, unit converters, security, and developer utilities.

Every single tool runs deterministic, local code inside the visitor's browser tab — no AI, no user accounts, and zero file uploads to external servers.

## Features

- **218+ Browser-Based Tools** across 10 functional categories:
  - Text & Writing (34 tools)
  - Image & Design (32 tools)
  - Calculators & Converters (50 tools)
  - Dev Tools (29 tools)
  - Unit Converters (15 tools)
  - Security (8 tools)
  - PDF Tools (16 tools)
  - Productivity (14 tools)
  - Color & CSS (6 tools)
  - SEO & Marketing (14 tools)
- **Local & Private Execution**: Text processing, regex, cryptographic hashes, canvas image manipulation, and PDF operations all run locally in the client.
- **Full Internationalization (i18n)**: English and Hindi (हिंदी) language support.
- **Theme Support**: Light, Dark, and System Auto mode with synchronized accent tokens.
- **Favorites & History**: Save favourite tools and quickly revisit the 12 most recently used tools via localStorage.
- **Deep Linking**: Direct URL hash navigation support (`#tool=<id>`, `#cat=<category>`, `#search=<term>`, `#all-tools`).

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Routing**: Client-side hash routing with browser history support
- **Styling**: Modern CSS Design System with responsive variables & dark mode

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server (host 0.0.0.0, port 3000)
npm run dev

# Build for production
npm run build
```

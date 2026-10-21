# digvijay.creates — Video Editor Portfolio

> **Digvijay Rishikesh Kohinkar**  
> Creative Video Editor · Vadodara, India  
> Live URL: [https://digvijaycreates.vercel.app](https://digvijaycreates.vercel.app)

---

## 🎬 Overview

A high-performance, cinematic editorial portfolio designed for modern web browsers. The experience showcases video editing, atmospheric color grading, rhythm, sound design, and narrative pacing through interactive WebGL film reel mechanics and custom ASCII falling matrix transitions.

---

## ⚡ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **3D & Canvas**: WebGL Canvas 3D Film Reel & Particle Camera
- **Motion & Audio**: Hardware-accelerated CSS transforms, Web Audio API, `prefers-reduced-motion` compliance
- **Deployment & Hosting**: [Vercel](https://vercel.com/) with Edge caching & security headers

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested up to Node 24)
- npm 9+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/Dmavala/digvijay.creates.git
cd digvijay.creates

# Install dependencies
npm install

# Start local development server
npm run dev
```
Visit `http://localhost:5173` in your browser.

### Production Build
```bash
# Compile TypeScript and bundle assets with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## ⚙️ Vercel Deployment Settings

If linking or deploying to Vercel manually:

| Setting | Value |
| --- | --- |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | `20.x` or `24.x` |

---

## 🔍 SEO & Accessibility Optimizations

- **Semantic HTML5**: Single `<h1>` tag with proper `<h2>`/`<h3>` hierarchy, `<header>`, `<nav>`, `<main id="main-content">`, and `<section>` landmarks.
- **Skip Link**: Accessible skip-to-content mechanism for keyboard users.
- **Search Engine Discovery**: Comprehensive JSON-LD (`schema.org/Person`), dynamic `robots.txt`, XML sitemap (`sitemap.xml`), and Open Graph / Twitter Card image previews (1200x630).
- **Accessible ASCII Art**: Labeled with `role="img"` and `aria-label`, with inner preformatted character blocks marked `aria-hidden="true"`.
- **Keyboard Navigation**: High-contrast, custom `:focus-visible` outline states.
- **Touch Targets**: Minimum 44x44px hit targets across mobile navigation and media controls.
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and HTTP permissions policies via `vercel.json`.

---

## 📬 Contact & Profiles

- **Email**: [dkohinkar0003s@gmail.com](mailto:dkohinkar0003s@gmail.com)
- **GitHub**: [github.com/Dmavala](https://github.com/Dmavala)
- **LinkedIn**: [linkedin.com/in/digvijay-kohinkar-096693343](https://www.linkedin.com/in/digvijay-kohinkar-096693343)
- **Instagram**: [@digvijay.creates](https://www.instagram.com/digvijay.creates)

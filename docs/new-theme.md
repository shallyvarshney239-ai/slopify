# Slopify — New Theme: "Clarity Intelligence" 
### Complete UI Reconstruction Guide · Team Avenger

---

## 0. Design Philosophy & Concept

**Theme Name:** Clarity Intelligence  
**Aesthetic Direction:** *Refined Analytical Luxury* — think a premium Bloomberg terminal crossed with a modern SaaS intelligence platform. Clean, authoritative, data-forward. No neon, no cyberpunk. Instead: crisp whites, deep navy structure, teal precision lines, warm beige breathing room, and sky-blue interactive energy.

**The One Unforgettable Thing:** Every section feels like a high-stakes intelligence briefing — structured, precise, and quietly powerful. The landing page opens like a classified report cover sliding into view. The results dashboard feels like a forensic analyst's workstation, not a hacker's terminal.

**Core UX Shift:**  
- Old: dark neon cyberpunk hacker aesthetic, fixed neon background, aggressive glows  
- New: light/mid-tone analytical platform, card-based hierarchy, micro-animations on data, trust-inspiring whitespace

**Color System:**

```css
/* PRIMARY PALETTE */
--navy-900: #0B1929;      /* Deep background anchor, headers */
--navy-700: #0F2D4A;      /* Section backgrounds, nav */
--navy-500: #1B4B73;      /* Card borders, active states */
--teal-500: #0D9488;      /* Primary accent, CTAs, highlights */
--teal-400: #14B8A6;      /* Hover states, interactive teal */
--teal-200: #99F6E4;      /* Teal glow / shimmer */
--sky-400:  #38BDF8;      /* Links, secondary interactions */
--sky-200:  #BAE6FD;      /* Sky tints, hover backgrounds */
--beige-100:#F5F0E8;      /* Page background (landing) */
--beige-200:#EDE8DC;      /* Card backgrounds, surfaces */
--beige-300:#D9D2C4;      /* Borders, dividers */
--white:    #FFFFFF;
--text-ink: #0F172A;      /* Body text on light bg */
--text-mid: #334155;      /* Secondary text */
--text-muted: #64748B;    /* Labels, meta */

/* SCORE COLORS (replacing neon) */
--score-high:   #059669;  /* emerald — high engagement */
--score-mid:    #D97706;  /* amber */
--score-low:    #DC2626;  /* red */
```

**Typography:**

```css
/* IMPORT in index.html or main.jsx */
/* https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap */

--font-display: 'DM Serif Display', Georgia, serif;   /* Hero headlines */
--font-sans:    'Plus Jakarta Sans', sans-serif;       /* All UI text */
--font-mono:    'DM Mono', 'Fira Code', monospace;    /* SHAs, scores, data */
```

---

## 1. `index.html` — Changes Required

```html
<!-- Replace the <head> section entirely -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slopify — Code Comprehension Intelligence</title>
  <meta name="description" content="Slopify measures whether developers actually understood code before merging. Cognitive engagement analysis for GitHub repositories." />
  
  <!-- OG Tags -->
  <meta property="og:title" content="Slopify — Code Comprehension Intelligence" />
  <meta property="og:description" content="Detect paste-and-pray commits. Measure true cognitive engagement in your codebase." />
  <meta property="og:image" content="/og-preview.png" />
  <meta property="og:url" content="https://slopify-delta.vercel.app" />

  <!-- Fonts: DM Serif Display + Plus Jakarta Sans + DM Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
```

---

## 2. `src/styles/globals.css` — Full Replacement

Replace the entire file. This is the master design token and dashboard stylesheet.

```css
/* ============================================================
   SLOPIFY — CLARITY INTELLIGENCE THEME
   globals.css — Dashboard + Shared Tokens
   ============================================================ */

/* --- Reset --- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

/* --- Design Tokens --- */
:root {
  /* Color Palette */
  --navy-900: #0B1929;
  --navy-800: #0D2137;
  --navy-700: #0F2D4A;
  --navy-500: #1B4B73;
  --navy-400: #2563A8;
  --teal-600: #0F766E;
  --teal-500: #0D9488;
  --teal-400: #14B8A6;
  --teal-200: #99F6E4;
  --teal-100: #CCFBF1;
  --sky-500:  #0EA5E9;
  --sky-400:  #38BDF8;
  --sky-200:  #BAE6FD;
  --sky-100:  #E0F2FE;
  --beige-100:#F5F0E8;
  --beige-200:#EDE8DC;
  --beige-300:#D9D2C4;
  --white:    #FFFFFF;

  /* Semantic */
  --bg-page:      #F0EDE6;        /* warm beige page bg */
  --bg-card:      #FFFFFF;
  --bg-card-alt:  #F8F6F2;
  --bg-dark:      var(--navy-900);
  --bg-dark-card: var(--navy-800);
  --border:       var(--beige-300);
  --border-subtle:#E8E3D9;
  --border-dark:  rgba(255,255,255,0.08);

  --text-primary:   var(--navy-900);
  --text-secondary: #334155;
  --text-muted:     #64748B;
  --text-on-dark:   #E2F4F7;
  --text-muted-dark:rgba(226,244,247,0.55);

  /* Accent */
  --accent:         var(--teal-500);
  --accent-hover:   var(--teal-400);
  --accent-glow:    0 0 20px rgba(13,148,136,0.35);
  --link:           var(--sky-500);

  /* Score colors */
  --score-high:  #059669;
  --score-mid:   #D97706;
  --score-low:   #DC2626;
  --score-high-bg: #ECFDF5;
  --score-mid-bg:  #FFFBEB;
  --score-low-bg:  #FEF2F2;

  /* Typography */
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-sans:    'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-mono:    'DM Mono', 'Fira Code', monospace;

  /* Spacing */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --radius-xl:  28px;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(11,25,41,0.08), 0 1px 2px rgba(11,25,41,0.06);
  --shadow-md:  0 4px 16px rgba(11,25,41,0.10), 0 2px 6px rgba(11,25,41,0.07);
  --shadow-lg:  0 12px 40px rgba(11,25,41,0.14);
  --shadow-teal: 0 4px 20px rgba(13,148,136,0.25);
}

/* --- Body base --- */
body {
  font-family: var(--font-sans);
  background: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   NAVBAR
   ============================================================ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 25, 41, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(13,148,136,0.2);
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.nav-brand-name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--white);
  letter-spacing: -0.01em;
}

.nav-brand-badge {
  font-size: 0.6rem;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--teal-400);
  background: rgba(13,148,136,0.15);
  border: 1px solid rgba(13,148,136,0.3);
  padding: 2px 7px;
  border-radius: 99px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted-dark);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link:hover {
  color: var(--teal-200);
  background: rgba(13,148,136,0.12);
  border-color: rgba(13,148,136,0.2);
}

.nav-link-primary {
  color: var(--teal-400);
  border-color: rgba(13,148,136,0.35);
  background: rgba(13,148,136,0.08);
}
.nav-link-primary:hover {
  background: rgba(13,148,136,0.2);
  color: var(--teal-200);
}

.nav-pulse {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--sky-400);
  font-family: var(--font-mono);
}
.nav-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal-400);
  animation: pulse-dot 1.4s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

/* ============================================================
   RESULTS SHELL
   ============================================================ */
.results-shell {
  max-width: 1240px;
  margin: 0 auto;
  padding: 36px 28px 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* --- Case header --- */
.case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: var(--navy-900);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(13,148,136,0.2);
}
.case-id {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--teal-400);
}
.case-repo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--white);
  letter-spacing: -0.02em;
}
.case-meta {
  font-size: 0.78rem;
  color: var(--text-muted-dark);
  font-family: var(--font-mono);
}

/* --- Section wrapper --- */
.section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 0;
}
.section-title {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.section-title-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title-icon svg {
  color: var(--teal-500);
}
.section-body {
  padding: 20px 24px 24px;
}

.section-dark {
  background: var(--navy-800);
  border-color: rgba(255,255,255,0.06);
}
.section-dark .section-title {
  color: var(--text-muted-dark);
}

/* --- Two-column grid --- */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media (max-width: 860px) {
  .two-col { grid-template-columns: 1fr; }
}

/* ============================================================
   SUMMARY STATS
   ============================================================ */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
  background: var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}
@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 520px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: var(--bg-card);
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.15s;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--teal-500);
  opacity: 0;
  transition: opacity 0.2s;
}
.stat-card:hover::before { opacity: 1; }
.stat-card:hover { background: var(--beige-100); }

.stat-card-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.stat-card-value {
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1;
  color: var(--navy-900);
  letter-spacing: -0.03em;
}
.stat-card-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.stat-card-grade {
  font-family: var(--font-display);
  font-size: 2.4rem;
  line-height: 1;
  letter-spacing: -0.03em;
}
.grade-a { color: var(--score-high); }
.grade-b { color: #16a34a; }
.grade-c { color: var(--score-mid); }
.grade-d { color: #ea580c; }
.grade-f { color: var(--score-low); }

.verdict-bar {
  margin-top: 4px;
  padding: 12px 20px;
  background: var(--bg-card-alt);
  border-top: 1px solid var(--border-subtle);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.verdict-bar-icon { font-size: 1rem; }

/* ============================================================
   COLLAPSE EVENT BANNER
   ============================================================ */
.collapse-banner {
  background: linear-gradient(135deg, #FEF2F2 0%, #FFF7F0 100%);
  border: 1px solid #FCA5A5;
  border-radius: var(--radius-md);
  padding: 14px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.collapse-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.collapse-banner-icon {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #FEE2E2;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--score-low);
}
.collapse-banner-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #991B1B;
  margin-bottom: 2px;
}
.collapse-banner-sub {
  font-size: 0.78rem;
  color: #B91C1C;
  font-family: var(--font-mono);
}
.collapse-banner-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: #B91C1C;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.collapse-banner-dismiss:hover { opacity: 1; }

/* ============================================================
   ERA PANEL
   ============================================================ */
.era-panel {
  padding: 20px 24px;
}
.era-columns {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 16px;
  align-items: center;
}
.era-col {
  background: var(--bg-card-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 18px 20px;
}
.era-col-label {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.era-label-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
}
.era-score {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--navy-900);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 6px;
}
.era-meta { font-size: 0.73rem; color: var(--text-muted); font-family: var(--font-mono); }
.era-delta-col {
  text-align: center;
}
.era-delta-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: -0.03em;
  line-height: 1;
}
.era-delta-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
.era-verdict {
  margin-top: 14px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-size: 0.78rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.02em;
}
.era-verdict-decline { background: #FEF2F2; color: #991B1B; }
.era-verdict-moderate { background: #FFFBEB; color: #92400E; }
.era-verdict-stable { background: #F0FDF4; color: #14532D; }
.era-verdict-improvement { background: #ECFDF5; color: #065F46; }

/* ============================================================
   TIMELINE VIEW
   ============================================================ */
.timeline-container {
  padding: 8px 24px 20px;
  position: relative;
}
.timeline-label {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  margin-bottom: 8px;
}
.timeline-svg text { font-family: var(--font-mono); }

/* ============================================================
   SCORE HISTOGRAM
   ============================================================ */
.histogram-container {
  padding: 8px 24px 20px;
}
.histogram-svg text { font-family: var(--font-mono); }

/* ============================================================
   CONTRIBUTOR MATRIX
   ============================================================ */
.contributor-table {
  width: 100%;
  border-collapse: collapse;
}
.contributor-table th {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-card-alt);
}
.contributor-table td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.82rem;
  vertical-align: middle;
}
.contributor-table tr:last-child td { border-bottom: none; }
.contributor-table tr:hover td { background: var(--beige-100); }
.contributor-author {
  font-weight: 600;
  color: var(--navy-700);
  font-size: 0.82rem;
}
.contributor-score {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
}
.contributor-trend-up   { color: var(--score-high); }
.contributor-trend-down { color: var(--score-low); }
.contributor-trend-flat { color: var(--text-muted); }
.contributor-pct {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-family: var(--font-mono);
}
.contributor-pct-high { background: #FEF2F2; color: #DC2626; }
.contributor-pct-low  { background: #F0FDF4; color: #059669; }

/* ============================================================
   FLAG LIST
   ============================================================ */
.flag-list { padding: 0 24px 20px; }

.flag-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
  padding-top: 16px;
}
.flag-filter-btn {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 99px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-sans);
}
.flag-filter-btn:hover { border-color: var(--teal-500); color: var(--teal-600); }
.flag-filter-btn.active {
  background: var(--teal-500);
  color: white;
  border-color: var(--teal-500);
}
.flag-filter-count {
  background: rgba(255,255,255,0.25);
  border-radius: 99px;
  padding: 0 5px;
  font-size: 0.65rem;
  margin-left: 4px;
}

.flag-table {
  width: 100%;
  border-collapse: collapse;
}
.flag-table th {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 9px 12px;
  text-align: left;
  background: var(--bg-card-alt);
  border-bottom: 1px solid var(--border-subtle);
}
.flag-table td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.8rem;
  cursor: pointer;
}
.flag-table tr:last-child td { border-bottom: none; }
.flag-table tr:hover td   { background: var(--sky-100); }
.flag-table tr.selected td { background: var(--teal-100); border-left: 2px solid var(--teal-500); }

.flag-sha {
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: var(--sky-500);
}
.flag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.67rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.flag-chip-danger  { background: #FEE2E2; color: #991B1B; }
.flag-chip-warning { background: #FEF3C7; color: #92400E; }
.flag-chip-success { background: #D1FAE5; color: #065F46; }
.flag-message {
  color: var(--text-secondary);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   COMMIT INSPECTOR
   ============================================================ */
.inspector-card {
  background: var(--navy-900);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(13,148,136,0.25);
  overflow: hidden;
}
.inspector-header {
  background: var(--navy-800);
  padding: 18px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.inspector-sha {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--teal-400);
  margin-bottom: 4px;
}
.inspector-author {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-on-dark);
}
.inspector-date {
  font-size: 0.72rem;
  color: var(--text-muted-dark);
  font-family: var(--font-mono);
}
.inspector-message {
  padding: 14px 24px;
  font-size: 0.85rem;
  color: var(--text-on-dark);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-style: italic;
  opacity: 0.85;
}
.inspector-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(255,255,255,0.04);
}
.inspector-section {
  background: var(--navy-900);
  padding: 16px 20px;
}
.inspector-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--teal-400);
  margin-bottom: 12px;
}
.score-bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.score-bar-label {
  font-size: 0.75rem;
  color: var(--text-muted-dark);
  min-width: 120px;
}
.score-bar-track {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.08);
  border-radius: 99px;
  overflow: hidden;
}
.score-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--teal-500);
  transition: width 0.5s ease;
}
.score-bar-val {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-on-dark);
  min-width: 36px;
  text-align: right;
}

.inspector-flags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.inspector-diff-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.inspector-diff-item {
  background: rgba(255,255,255,0.04);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
}
.inspector-diff-val {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--sky-400);
}
.inspector-diff-label {
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted-dark);
  margin-top: 2px;
}
.inspector-close {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--text-muted-dark);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
}
.inspector-close:hover {
  background: rgba(255,255,255,0.15);
  color: var(--white);
}

/* ============================================================
   FILE HEAT MAP
   ============================================================ */
.fhm-list { padding: 0 24px 20px; }
.fhm-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.fhm-row:last-child { border-bottom: none; }
.fhm-rank {
  font-family: var(--font-mono);
  font-size: 0.67rem;
  color: var(--text-muted);
  width: 20px;
  text-align: right;
  flex-shrink: 0;
}
.fhm-path {
  font-family: var(--font-mono);
  font-size: 0.77rem;
  color: var(--sky-500);
  width: 280px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fhm-bar-track {
  flex: 1;
  height: 6px;
  background: var(--beige-300);
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}
.fhm-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--teal-600), var(--teal-400));
  position: relative;
}
.fhm-bar-marker {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 12px;
  background: var(--navy-700);
  border-radius: 1px;
}
.fhm-stats {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}
.fhm-commit-count {
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: var(--text-muted);
  min-width: 55px;
  text-align: right;
}
.fhm-badge {
  font-size: 0.67rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
  background: #FEE2E2;
  color: #991B1B;
  font-family: var(--font-mono);
  white-space: nowrap;
}

/* ============================================================
   LOADING SCREEN
   ============================================================ */
.fullscreen-loader {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--navy-900);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}
.fl-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(13,148,136,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(13,148,136,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}
.fl-center { 
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 1;
}
.fl-ring-outer {
  width: 100px; height: 100px;
  border-radius: 50%;
  border: 1px solid rgba(13,148,136,0.2);
  display: flex; align-items: center; justify-content: center;
  position: relative;
  animation: ring-spin 3s linear infinite;
}
.fl-ring-outer::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--teal-500);
  animation: ring-spin 1.5s linear infinite reverse;
}
@keyframes ring-spin { to { transform: rotate(360deg); } }
.fl-progress-pct {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--white);
  letter-spacing: -0.03em;
}
.fl-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--white);
  letter-spacing: -0.02em;
}
.fl-stage {
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: var(--teal-400);
  letter-spacing: 0.05em;
}
.fl-progress-bar {
  width: 320px;
  height: 3px;
  background: rgba(255,255,255,0.07);
  border-radius: 99px;
  overflow: hidden;
}
.fl-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal-600), var(--teal-400));
  border-radius: 99px;
  transition: width 0.5s ease;
  box-shadow: 0 0 12px rgba(20,184,166,0.5);
}
.fl-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 280px;
}
.fl-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
  color: var(--text-muted-dark);
  font-family: var(--font-mono);
}
.fl-step-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  flex-shrink: 0;
  transition: background 0.3s;
}
.fl-step.active .fl-step-dot { background: var(--teal-400); box-shadow: 0 0 6px var(--teal-400); }
.fl-step.done   .fl-step-dot { background: var(--score-high); }
.fl-step.active { color: var(--text-on-dark); }

/* ============================================================
   RESULTS ERROR
   ============================================================ */
.results-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
  text-align: center;
  padding: 40px;
}
.results-error-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #FEF2F2;
  border: 2px solid #FCA5A5;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}
.results-error-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--navy-900);
  letter-spacing: -0.02em;
}
.results-error-msg {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 400px;
}
.results-error-actions { display: flex; gap: 10px; margin-top: 8px; }
.btn-outline {
  padding: 10px 22px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-sans);
}
.btn-outline:hover { border-color: var(--teal-500); color: var(--teal-600); }
.btn-primary {
  padding: 10px 22px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--teal-500);
  color: white;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-sans);
}
.btn-primary:hover { background: var(--teal-400); box-shadow: var(--shadow-teal); }

/* ============================================================
   EVAL PAGE
   ============================================================ */
.eval-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 28px 80px;
}
.eval-header {
  padding: 32px 0 24px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 32px;
}
.eval-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--teal-600);
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.eval-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--navy-900);
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}
.eval-sub { font-size: 0.9rem; color: var(--text-muted); }
.eval-section { margin-bottom: 36px; }
.eval-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.eval-section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.flag-metrics-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-subtle);
}
.flag-metrics-table th {
  padding: 12px 16px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  background: var(--bg-card-alt);
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
}
.flag-metrics-table td {
  padding: 11px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.82rem;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}
.flag-metrics-table tr:last-child td { border-bottom: none; }
.flag-metrics-table tr:hover td { background: var(--beige-100); }

.confusion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-width: 380px;
}
.confusion-cell {
  padding: 20px;
  border-radius: var(--radius-md);
  text-align: center;
  border: 1px solid var(--border-subtle);
}
.confusion-cell-tp { background: #ECFDF5; border-color: #86EFAC; }
.confusion-cell-tn { background: #ECFDF5; border-color: #86EFAC; }
.confusion-cell-fp { background: #FEF2F2; border-color: #FCA5A5; }
.confusion-cell-fn { background: #FFFBEB; border-color: #FCD34D; }
.confusion-val {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: -0.03em;
  line-height: 1;
}
.confusion-label {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-top: 4px;
}

.failure-gallery { display: flex; flex-direction: column; gap: 10px; }
.failure-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
  box-shadow: var(--shadow-sm);
}
.failure-card-badge {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 4px 9px;
  border-radius: 99px;
  white-space: nowrap;
}
.failure-fp { background: #FEE2E2; color: #991B1B; }
.failure-fn { background: #FEF3C7; color: #92400E; }
.failure-id {
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: var(--sky-500);
}
.failure-msg { font-size: 0.82rem; color: var(--text-secondary); margin-top: 3px; }
.failure-note { font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; font-style: italic; }

/* ============================================================
   UTILITIES
   ============================================================ */
.score-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mono { font-family: var(--font-mono); }
.text-high  { color: var(--score-high); }
.text-mid   { color: var(--score-mid); }
.text-low   { color: var(--score-low); }
.bg-high    { background: var(--score-high-bg); }
.bg-mid     { background: var(--score-mid-bg); }
.bg-low     { background: var(--score-low-bg); }
```

---

## 3. `src/styles/landing.css` — Full Replacement

Replace entirely. The neon aesthetic is gone. The new landing is bright, structured, editorial.

```css
/* ============================================================
   SLOPIFY LANDING — CLARITY INTELLIGENCE THEME
   landing.css
   ============================================================ */

/* ============================================================
   LANDING LAYOUT BASE
   ============================================================ */
.landing-root {
  background: var(--beige-100);
  color: var(--text-primary);
  font-family: var(--font-sans);
  min-height: 100vh;
}

/* ============================================================
   HERO SECTION
   The hero uses a TWO-ROW structure:
   - Top: Eyebrow + headline + input
   - Bottom: Proof signals + demo pills
   No terminal mock. Instead: an animated stat panel on right.
   ============================================================ */
.hero-section {
  background: var(--navy-900);
  position: relative;
  overflow: hidden;
  padding: 80px 0 0;
}

/* Subtle grid overlay on dark hero */
.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(13,148,136,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(13,148,136,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
/* Radial glow blobs */
.hero-blob-1 {
  position: absolute;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%);
  top: -200px; left: -100px;
  pointer-events: none;
}
.hero-blob-2 {
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
  bottom: 0; right: 200px;
  pointer-events: none;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 0;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 60px;
  align-items: start;
}
@media (max-width: 1000px) {
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
}

/* LEFT: Headlines + CTA */
.hero-left { padding-bottom: 60px; }

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(13,148,136,0.15);
  border: 1px solid rgba(13,148,136,0.3);
  border-radius: 99px;
  padding: 6px 14px 6px 10px;
  margin-bottom: 28px;
}
.hero-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--teal-400);
  animation: pulse-dot 1.8s ease-in-out infinite;
}
.hero-eyebrow-text {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--teal-400);
}

.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 5vw, 3.8rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--white);
  margin-bottom: 20px;
}
.hero-headline em {
  font-style: italic;
  color: var(--teal-400);
}

.hero-sub {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.65;
  max-width: 520px;
  margin-bottom: 40px;
}

/* INPUT FORM */
.hero-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 540px;
}
.hero-input-row {
  display: flex;
  gap: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  transition: border-color 0.2s;
}
.hero-input-row:focus-within {
  border-color: var(--teal-500);
  box-shadow: 0 0 0 3px rgba(13,148,136,0.2);
}
.hero-input-icon {
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: var(--text-muted-dark);
  flex-shrink: 0;
}
.hero-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--white);
  font-size: 0.9rem;
  font-family: var(--font-mono);
  padding: 14px 0;
  min-width: 0;
}
.hero-input::placeholder { color: rgba(255,255,255,0.25); }

.hero-input-controls {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  border-left: 1px solid rgba(255,255,255,0.08);
}
.hero-depth-select {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-muted-dark);
  font-size: 0.78rem;
  font-family: var(--font-mono);
  padding: 0 12px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}
.hero-depth-select option { background: var(--navy-800); color: white; }

.hero-scan-btn {
  background: var(--teal-500);
  border: none;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: var(--font-sans);
  letter-spacing: 0.03em;
  padding: 14px 24px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.hero-scan-btn:hover { background: var(--teal-400); }
.hero-scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.hero-input-hint {
  font-size: 0.73rem;
  color: rgba(255,255,255,0.3);
  font-family: var(--font-mono);
}

/* Demo pills */
.hero-demo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.hero-demo-label {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hero-demo-pill {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 99px;
  color: rgba(255,255,255,0.55);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  padding: 5px 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.hero-demo-pill:hover {
  background: rgba(13,148,136,0.15);
  border-color: rgba(13,148,136,0.4);
  color: var(--teal-200);
}

/* RIGHT: Stats panel (replacing terminal mock) */
.hero-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 28px 24px 0;
  align-self: end;
  position: relative;
  overflow: hidden;
}
.hero-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--teal-500), var(--sky-400));
}
.hero-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}
.hero-panel-dots {
  display: flex; gap: 5px;
}
.hero-panel-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
}
.hero-panel-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.hero-panel-metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
}
.hero-panel-metric {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}
.hero-panel-metric-val {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--white);
  letter-spacing: -0.03em;
  line-height: 1;
}
.hero-panel-metric-label {
  font-size: 0.67rem;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 5px;
}
.hero-panel-chart-stub {
  height: 100px;
  background: rgba(13,148,136,0.04);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border: 1px solid rgba(13,148,136,0.1);
  border-bottom: none;
  display: flex;
  align-items: flex-end;
  padding: 0 8px;
  gap: 4px;
  overflow: hidden;
}
/* Animated bar chart stubs */
.hero-panel-bar {
  flex: 1;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(to top, var(--teal-600), var(--teal-400));
  opacity: 0.7;
  animation: bar-breath 2.5s ease-in-out infinite;
}
.hero-panel-bar:nth-child(odd) { animation-delay: 0.3s; }
.hero-panel-bar:nth-child(3n) { animation-delay: 0.6s; }
@keyframes bar-breath {
  0%, 100% { opacity: 0.5; transform: scaleY(1); }
  50% { opacity: 0.85; transform: scaleY(1.04); }
}

/* ============================================================
   STATS TICKER STRIP (below hero, now on light bg)
   ============================================================ */
.stats-strip {
  background: var(--white);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0;
  overflow: hidden;
  position: relative;
}
.stats-strip-inner {
  display: flex;
  align-items: center;
  height: 56px;
}
.stats-strip-divider {
  width: 1px;
  height: 28px;
  background: var(--border-subtle);
  flex-shrink: 0;
}
.stats-strip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 28px;
  flex-shrink: 0;
}
.stats-strip-value {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--navy-900);
  letter-spacing: -0.02em;
  line-height: 1;
}
.stats-strip-label {
  font-size: 0.73rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}
.stats-strip-icon {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  background: var(--teal-100);
  color: var(--teal-600);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ============================================================
   HOW IT WORKS — REPLACES "PROBLEM SECTION"
   Three-step horizontal process (light background section)
   ============================================================ */
.how-section {
  padding: 96px 0;
  background: var(--beige-100);
}
.how-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
}
.section-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--teal-600);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-eyebrow::before {
  content: '';
  display: block;
  width: 24px; height: 2px;
  background: var(--teal-500);
  border-radius: 99px;
}
.section-headline {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  letter-spacing: -0.03em;
  color: var(--navy-900);
  margin-bottom: 14px;
  line-height: 1.15;
}
.section-sub {
  font-size: 0.95rem;
  color: var(--text-muted);
  max-width: 520px;
  line-height: 1.65;
  margin-bottom: 56px;
}
.how-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: var(--border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
@media (max-width: 760px) { .how-steps { grid-template-columns: 1fr; } }
.how-step {
  background: var(--white);
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: background 0.15s;
  position: relative;
}
.how-step:hover { background: #FEFCFB; }
.how-step-number {
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--beige-300);
  position: absolute;
  top: 20px; right: 24px;
}
.how-step-icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  background: var(--teal-100);
  color: var(--teal-600);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.how-step-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--navy-900);
  line-height: 1.3;
}
.how-step-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
}
.how-connector {
  display: none; /* visible on desktop via :not(:last-child) pseudo */
}

/* ============================================================
   SIGNALS GRID — REPLACES NEON signal cards
   Six analytical signals in a 2×3 clean card grid
   ============================================================ */
.signals-section {
  padding: 96px 0;
  background: var(--white);
}
.signals-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
}
.signals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 48px;
}
@media (max-width: 820px) { .signals-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .signals-grid { grid-template-columns: 1fr; } }

.signal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.signal-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.signal-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--signal-color, var(--teal-500));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}
.signal-card:hover::after { transform: scaleX(1); }

.signal-card-icon {
  width: 42px; height: 42px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  background: var(--signal-bg, rgba(13,148,136,0.1));
  color: var(--signal-color, var(--teal-500));
  flex-shrink: 0;
}
.signal-card-id {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.signal-card-name {
  font-size: 0.97rem;
  font-weight: 700;
  color: var(--navy-900);
  line-height: 1.25;
}
.signal-card-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.55;
}
/* In-view animation: add .in-view class via IntersectionObserver */
.signal-card {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s;
}
.signal-card.in-view {
  opacity: 1;
  transform: translateY(0);
}
.signal-card:hover { transform: translateY(-3px) !important; }

/* ============================================================
   FLAGS GRID — REPLACES neon flag cards
   Six flag types in a dark navy section
   ============================================================ */
.flags-section {
  padding: 96px 0;
  background: var(--navy-900);
  position: relative;
  overflow: hidden;
}
.flags-section-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(13,148,136,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(13,148,136,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}
.flags-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;
}
.flags-inner .section-eyebrow { color: var(--teal-400); }
.flags-inner .section-headline { color: var(--white); }
.flags-inner .section-sub { color: rgba(255,255,255,0.45); }

.flags-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 48px;
}
@media (max-width: 820px) { .flags-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .flags-grid { grid-template-columns: 1fr; } }

.flag-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: var(--radius-lg);
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.2s, border-color 0.2s;
}
.flag-card:hover {
  background: rgba(13,148,136,0.06);
  border-color: rgba(13,148,136,0.25);
}
.flag-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flag-card-icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
}
.flag-card-severity {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 99px;
}
.severity-danger  { background: rgba(220,38,38,0.2); color: #FCA5A5; }
.severity-warning { background: rgba(217,119,6,0.2); color: #FCD34D; }
.severity-info    { background: rgba(13,148,136,0.2); color: var(--teal-200); }
.flag-card-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-on-dark);
}
.flag-card-desc {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.55;
}

/* ============================================================
   CTA SECTION
   ============================================================ */
.cta-section {
  padding: 96px 40px;
  background: var(--beige-100);
  text-align: center;
}
.cta-inner {
  max-width: 640px;
  margin: 0 auto;
}
.cta-headline {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--navy-900);
  letter-spacing: -0.03em;
  margin-bottom: 16px;
  line-height: 1.15;
}
.cta-sub {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 36px;
  line-height: 1.65;
}
.cta-input-group {
  display: flex;
  gap: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--white);
  box-shadow: var(--shadow-md);
  max-width: 520px;
  margin: 0 auto 16px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.cta-input-group:focus-within {
  box-shadow: var(--shadow-teal);
  border-color: var(--teal-500);
}
.cta-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 18px;
  font-size: 0.88rem;
  color: var(--text-primary);
  background: transparent;
  font-family: var(--font-mono);
  min-width: 0;
}
.cta-input::placeholder { color: var(--text-muted); }
.cta-scan-btn {
  background: var(--navy-900);
  border: none;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: var(--font-sans);
  padding: 14px 24px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cta-scan-btn:hover { background: var(--navy-700); }
.cta-disclaimer {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ============================================================
   FOOTER
   ============================================================ */
.landing-footer {
  background: var(--navy-900);
  padding: 40px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.landing-footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.footer-brand {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
}
.footer-brand-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--white);
}
.footer-brand-sub {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
  font-family: var(--font-mono);
}
.footer-links {
  display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
}
.footer-link {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: color 0.15s;
}
.footer-link:hover { color: var(--teal-400); }
.footer-copy {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.2);
  font-family: var(--font-mono);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 640px) {
  .hero-inner { padding: 0 20px; }
  .how-inner, .signals-inner, .flags-inner { padding: 0 20px; }
  .how-section, .signals-section, .flags-section { padding: 64px 0; }
  .hero-section { padding: 56px 0 0; }
  .landing-footer { padding: 32px 20px; }
  .landing-footer-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
  .footer-copy { order: 3; }
}
```

---

## 4. `src/components/NavBar.jsx` — Full Rewrite

```jsx
// NavBar.jsx
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function NavBar({ scanning }) {
  const { pathname } = useLocation();
  const onResults = pathname === '/results';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Logo size={26} />
        <span className="nav-brand-name">Slopify</span>
        <span className="nav-brand-badge">Intelligence</span>
      </Link>
      
      <div className="nav-links">
        {scanning && (
          <span className="nav-pulse">
            <span className="nav-pulse-dot" />
            Analyzing…
          </span>
        )}
        {onResults && (
          <Link to="/" className="nav-link">
            {/* Left arrow icon */}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
            New Scan
          </Link>
        )}
        <Link to="/eval" className="nav-link nav-link-primary">
          {/* chart icon */}
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          Accuracy
        </Link>
        <a
          href="https://github.com/shallyvarshney239-ai/slopify"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
        >
          {/* github icon */}
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
          </svg>
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}
```

---

## 5. `src/components/Logo.jsx` — Update

Update the SVG to use teal/sky tones. Keep the same SVG structure but replace gradient colors:

```jsx
// In Logo.jsx, change gradient stop colors:
// stopColor from neon cyan → var(--teal-500) / #0D9488
// stopColor from neon purple → var(--sky-400) / #38BDF8
// Remove any filter/glow effects using neon colors
// The pulse filter can stay but change feFlood color to #0D9488
```

---

## 6. `src/pages/LandingPage.jsx` — Full Rewrite

The entire landing page structure changes. Below is the new JSX structure with all sections.

### Key structural changes:
- **NO** `NeonBackground` component (delete it)
- **NO** `.landing-neon` class; use `.landing-root` instead
- Replace `TerminalLine` with `StatPanel` (hero right side panel with animated bars)
- Replace `NeonStat` ticker with `StatsStrip` items
- Replace old 8-section layout with: Hero → Stats Strip → How It Works → Signals Grid → Flags Grid → CTA → Footer

### New `LandingPage.jsx` structure:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SignalCard from '../components/SignalCard';
import Logo from '../components/Logo';

/* ── Icon components (inline SVGs, replace old ones) ─── */
// Use a consistent thin-line 20×20 icon style

const IconScan = () => (/* SVG: magnifying glass with circuit lines */);
const IconBrain = () => (/* SVG: brain/neural network */);
const IconGitMerge = () => (/* SVG: git merge arrows */);
const IconShield = () => (/* SVG: shield with checkmark */);
const IconZap = () => (/* SVG: lightning bolt */);
const IconEye = () => (/* SVG: eye/visibility */);
const IconPaste = () => (/* SVG: clipboard */);
const IconStamp = () => (/* SVG: stamp/approval */);
const IconAlert = () => (/* SVG: alert triangle */);
const IconClock = () => (/* SVG: clock */);
const IconCode = () => (/* SVG: code brackets */);
const IconCheck = () => (/* SVG: checkmark circle */);

/* Use lucide-react icons if available instead of inline SVG:
   import { Brain, GitMerge, Shield, Zap, Eye, ScanSearch,
            Clipboard, Stamp, AlertTriangle, Clock, Code, CheckCircle,
            Github, BarChart3, ArrowLeft, TrendingUp, Users, FileCode }
   from 'lucide-react'; */

/* ── Data constants ─────────────────────────────────── */
const SIGNALS = [
  {
    id: 'SIG-01', name: 'Cognitive Entropy',
    icon: 'Brain', color: '#0D9488', bg: 'rgba(13,148,136,0.1)',
    desc: 'Measures the information-theoretic complexity of changes. High entropy signals genuine problem-solving; near-zero entropy reveals copy-paste patterns.'
  },
  {
    id: 'SIG-02', name: 'Semantic Novelty',
    icon: 'Zap', color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',
    desc: 'Compares vocabulary and structure of incoming code against the existing codebase. Sudden style breaks correlate with AI-generated insertions.'
  },
  {
    id: 'SIG-03', name: 'Commit Velocity Decay',
    icon: 'TrendingUp', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',
    desc: 'Tracks how commit cadence changes around merges. Genuine understanding produces steady, iterative commits; rubber-stamping shows sudden bulk merges.'
  },
  {
    id: 'SIG-04', name: 'Message Quality Score',
    icon: 'FileCode', color: '#D97706', bg: 'rgba(217,119,6,0.1)',
    desc: 'Analyzes commit message specificity and alignment with diff content. Vague messages on large diffs are a strong slop signal.'
  },
  {
    id: 'SIG-05', name: 'Test Surface Coverage',
    icon: 'Shield', color: '#059669', bg: 'rgba(5,150,105,0.1)',
    desc: 'Measures whether test files accompany functional changes. Code merged without test coverage often indicates passive acceptance, not active authorship.'
  },
  {
    id: 'SIG-06', name: 'Diff Coherence Index',
    icon: 'Eye', color: '#DC2626', bg: 'rgba(220,38,38,0.1)',
    desc: 'Evaluates logical cohesion between files changed in a single commit. Incoherent multi-file sprawl is a marker of automated code insertion.'
  },
];

const FLAGS = [
  {
    key: 'paste_and_pray', name: 'Paste & Pray',
    icon: '📋', severity: 'danger',
    desc: 'Large code block inserted with zero cognitive trail — no exploratory commits, vague message, no test pair.'
  },
  {
    key: 'rubber_stamp', name: 'Rubber Stamp',
    icon: '🪪', severity: 'danger',
    desc: 'PR merged with no review activity and minimal diff engagement. Code accepted without scrutiny.'
  },
  {
    key: 'test_desert', name: 'Test Desert',
    icon: '🏜️', severity: 'warning',
    desc: 'Functional changes in files that have never had associated test coverage in the analyzed window.'
  },
  {
    key: 'silent_commit', name: 'Silent Commit',
    icon: '🔇', severity: 'warning',
    desc: 'Commit message length below threshold for the diff size. Author did not describe what changed or why.'
  },
  {
    key: 'deep_refactor', name: 'Deep Refactor',
    icon: '🔬', severity: 'info',
    desc: 'High structural change with consistent cognitive trail. This is a positive signal: genuine codebase investment.'
  },
  {
    key: 'test_driven', name: 'Test-Driven',
    icon: '✅', severity: 'info',
    desc: 'Tests precede or accompany every functional commit. Strong indicator of deliberate, understood authorship.'
  },
];

const DEMO_REPOS = [
  { label: 'expressjs/morgan', url: 'https://github.com/expressjs/morgan' },
  { label: 'expressjs/cors',   url: 'https://github.com/expressjs/cors' },
  { label: 'sindresorhus/ora', url: 'https://github.com/sindresorhus/ora' },
];

const STATS = [
  { value: '6',    label: 'Behavioral signals', icon: '📊' },
  { value: '200',  label: 'Commits per scan',   icon: '🔍' },
  { value: '< 2m', label: 'Avg scan time',       icon: '⚡' },
  { value: '6',    label: 'Flag categories',     icon: '🚩' },
  { value: '100%', label: 'Open source',         icon: '🔓' },
];

/* ── Animation Variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }
  }),
};

/* ── Sub-components ─────────────────────────────────── */

// Panel on right side of hero showing sample metrics
function HeroPanel() {
  // Animate bar heights: static representation of a cognitive score timeline
  const bars = [45, 62, 71, 55, 38, 80, 66, 59, 73, 41, 78, 85, 60, 44, 90].map(h => h);
  return (
    <div className="hero-panel">
      <div className="hero-panel-header">
        <div className="hero-panel-dots">
          <div className="hero-panel-dot" style={{background:'#FF5F57'}}/>
          <div className="hero-panel-dot" style={{background:'#FFBD2E'}}/>
          <div className="hero-panel-dot" style={{background:'#28C840'}}/>
        </div>
        <span className="hero-panel-label">Cognitive Analysis · expressjs/morgan</span>
      </div>
      <div className="hero-panel-metric-grid">
        <div className="hero-panel-metric">
          <div className="hero-panel-metric-val" style={{color:'#14B8A6'}}>B+</div>
          <div className="hero-panel-metric-label">Health Grade</div>
        </div>
        <div className="hero-panel-metric">
          <div className="hero-panel-metric-val">0.61</div>
          <div className="hero-panel-metric-label">Mean Score</div>
        </div>
        <div className="hero-panel-metric">
          <div className="hero-panel-metric-val" style={{color:'#DC2626'}}>7</div>
          <div className="hero-panel-metric-label">P&P Flags</div>
        </div>
        <div className="hero-panel-metric">
          <div className="hero-panel-metric-val" style={{color:'#059669'}}>68%</div>
          <div className="hero-panel-metric-label">High Engage.</div>
        </div>
      </div>
      <div className="hero-panel-chart-stub">
        {bars.map((h, i) => (
          <div
            key={i}
            className="hero-panel-bar"
            style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export default function LandingPage({ analysis }) {
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState('200');

  const handleScan = (repoUrl) => {
    const target = repoUrl || url;
    if (!target.trim()) return;
    analysis.analyze(target.trim(), { maxCommits: Number(depth) });
  };

  return (
    <div className="landing-root">

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />
        <div className="hero-inner">
          <motion.div
            className="hero-left"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div className="hero-eyebrow" variants={fadeUp}>
              <span className="hero-eyebrow-dot"/>
              <span className="hero-eyebrow-text">Code Comprehension Intelligence</span>
            </motion.div>

            <motion.h1 className="hero-headline" variants={fadeUp}>
              Was your code <em>actually</em> understood before it merged?
            </motion.h1>

            <motion.p className="hero-sub" variants={fadeUp}>
              Slopify analyzes behavioral git signals to measure cognitive engagement —
              not AI detection, but true authorship understanding. Paste-and-pray
              commits leave forensic traces. We find them.
            </motion.p>

            <motion.div className="hero-input-group" variants={fadeUp}>
              <div className="hero-input-row">
                <span className="hero-input-icon">
                  {/* github icon 18px */}
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>
                </span>
                <input
                  className="hero-input"
                  type="text"
                  placeholder="github.com/owner/repository"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  disabled={analysis.loading}
                />
                <div className="hero-input-controls">
                  <select
                    className="hero-depth-select"
                    value={depth}
                    onChange={e => setDepth(e.target.value)}
                    disabled={analysis.loading}
                  >
                    <option value="50">50 commits</option>
                    <option value="100">100 commits</option>
                    <option value="200">200 commits</option>
                  </select>
                  <button
                    className="hero-scan-btn"
                    onClick={() => handleScan()}
                    disabled={analysis.loading || !url.trim()}
                  >
                    {/* scan icon */}
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Analyze
                  </button>
                </div>
              </div>
              {analysis.error && (
                <p style={{ fontSize: '0.78rem', color: 'var(--score-low)', fontFamily: 'var(--font-mono)' }}>
                  ⚠ {analysis.error}
                </p>
              )}
              <p className="hero-input-hint">Supports public GitHub repositories only</p>
              <div className="hero-demo-row">
                <span className="hero-demo-label">Try:</span>
                {DEMO_REPOS.map(r => (
                  <button key={r.label} className="hero-demo-pill" onClick={() => { setUrl(r.url); handleScan(r.url); }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <HeroPanel />
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────── */}
      <div className="stats-strip">
        <div className="stats-strip-inner">
          {STATS.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <div className="stats-strip-divider" />}
              <div className="stats-strip-item">
                <div className="stats-strip-icon">{s.icon}</div>
                <div>
                  <div className="stats-strip-value">{s.value}</div>
                  <div className="stats-strip-label">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="how-section">
        <div className="how-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="section-eyebrow">Process</div>
            <h2 className="section-headline">Forensics in three steps</h2>
            <p className="section-sub">
              Slopify doesn't look at what your code does — it looks at how developers
              behaved while writing it. Every commit tells a story.
            </p>
          </motion.div>
          <div className="how-steps">
            {[
              {
                n: '01', icon: '🔗', title: 'Connect your repository',
                desc: 'Paste any public GitHub URL. Slopify fetches commit history, diffs, author metadata, and timestamps — no installation or tokens required.'
              },
              {
                n: '02', icon: '🧠', title: 'Behavioral signal extraction',
                desc: 'Six independent signals are extracted per commit: entropy, novelty, velocity, message quality, test surface, and coherence. Each runs asynchronously in under two minutes.'
              },
              {
                n: '03', icon: '📊', title: 'Intelligence report delivered',
                desc: 'A scored timeline, contributor leaderboard, flagged commit list, file heatmap, and era-split analysis give you a complete picture of codebase comprehension health.'
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="how-step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <span className="how-step-number">{step.n}</span>
                <div className="how-step-icon" style={{ fontSize: '1.3rem' }}>{step.icon}</div>
                <div className="how-step-title">{step.title}</div>
                <div className="how-step-desc">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNALS GRID ────────────────────────────────── */}
      <section className="signals-section">
        <div className="signals-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-eyebrow">Detection Engine</div>
            <h2 className="section-headline">Six behavioral signals</h2>
            <p className="section-sub">
              Each signal targets a different forensic dimension of code comprehension.
              Together they form a composite cognitive score.
            </p>
          </motion.div>
          <div className="signals-grid">
            {SIGNALS.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAGS GRID ──────────────────────────────────── */}
      <section className="flags-section">
        <div className="flags-section-bg" />
        <div className="flags-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-eyebrow">Flag Taxonomy</div>
            <h2 className="section-headline">Six forensic markers</h2>
            <p className="section-sub">
              Commits are tagged when signal combinations exceed behavioral thresholds.
              Two risk flags, two warning flags, two positive markers.
            </p>
          </motion.div>
          <div className="flags-grid">
            {FLAGS.map((flag, i) => (
              <motion.div
                key={flag.key}
                className="flag-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <div className="flag-card-top">
                  <div className="flag-card-icon">{flag.icon}</div>
                  <span className={`flag-card-severity severity-${flag.severity}`}>
                    {flag.severity}
                  </span>
                </div>
                <div className="flag-card-name">{flag.name}</div>
                <div className="flag-card-desc">{flag.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="cta-headline">Run your first analysis in 90 seconds</h2>
            <p className="cta-sub">
              Paste any public GitHub repository and get a full cognitive
              engagement report. No sign-up. No tokens. Free.
            </p>
            <div className="cta-input-group">
              <input
                className="cta-input"
                type="text"
                placeholder="github.com/owner/repository"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
              <button className="cta-scan-btn" onClick={() => handleScan()}>
                Analyze →
              </button>
            </div>
            <p className="cta-disclaimer">Public GitHub repos only · Powered by behavioral git metrics</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <Logo size={22} />
            <div>
              <div className="footer-brand-name">Slopify</div>
              <div className="footer-brand-sub">Team Avenger · Slop Scan Hackathon</div>
            </div>
          </div>
          <div className="footer-links">
            <a href="/eval" className="footer-link">Accuracy Report</a>
            <a href="https://github.com/shallyvarshney239-ai/slopify" className="footer-link" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
          <div className="footer-copy">© 2024 Team Avenger</div>
        </div>
      </footer>

    </div>
  );
}
```

---

## 7. `src/components/SignalCard.jsx` — Rewrite

```jsx
// SignalCard.jsx — updated for Clarity Intelligence theme
import { useInView } from 'react-intersection-observer';

// Icon map: map signal.icon string → lucide icon or inline SVG
// If using lucide-react: import { Brain, Zap, TrendingUp, FileCode, Shield, Eye } from 'lucide-react';

const ICON_MAP = {
  Brain: () => (/* brain SVG or lucide <Brain /> */),
  Zap: () => (/* zap SVG or lucide <Zap /> */),
  TrendingUp: () => (/* trending SVG or lucide <TrendingUp /> */),
  FileCode: () => (/* file SVG or lucide <FileCode /> */),
  Shield: () => (/* shield SVG or lucide <Shield /> */),
  Eye: () => (/* eye SVG or lucide <Eye /> */),
};

export default function SignalCard({ signal, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const IconComponent = ICON_MAP[signal.icon];

  return (
    <div
      ref={ref}
      className={`signal-card ${inView ? 'in-view' : ''}`}
      style={{
        '--signal-color': signal.color,
        '--signal-bg': signal.bg,
        transitionDelay: `${index * 0.07}s`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="signal-card-icon">
          {IconComponent ? <IconComponent /> : <span style={{ fontSize: '1.1rem' }}>📡</span>}
        </div>
        <span className="signal-card-id">{signal.id}</span>
      </div>
      <div className="signal-card-name">{signal.name}</div>
      <div className="signal-card-desc">{signal.desc}</div>
    </div>
  );
}
```

---

## 8. `src/components/LoadingScreen.jsx` — Rewrite

Replace the dark matrix-rain canvas with the new clean loading screen:

```jsx
// LoadingScreen.jsx — Clarity Intelligence theme
// - Remove matrix rain canvas useEffect entirely
// - Remove .fullscreen-loader dark background (now uses navy from CSS)
// - Keep progress, stage, updatedAt props (same interface)
// - New: animated grid background (.fl-grid-bg)
// - New: circular progress ring (CSS-only, no canvas)
// - New: step list with animated dots

export default function LoadingScreen({ progress, stage, updatedAt }) {
  const [displayPct, setDisplayPct] = useState(0);
  // Keep existing simulated-progress useEffect logic

  const STAGE_LABELS = { /* keep existing mapping */ };

  const steps = [
    { key: 'init',     label: 'Connecting to repository' },
    { key: 'fetch',    label: 'Fetching commit history' },
    { key: 'analyze',  label: 'Extracting behavioral signals' },
    { key: 'score',    label: 'Computing cognitive scores' },
    { key: 'complete', label: 'Building report' },
  ];

  // Determine which steps are done/active based on `stage`
  // (reuse existing STAGE_LABELS logic to map stage key → step index)

  return (
    <div className="fullscreen-loader">
      <div className="fl-grid-bg" />
      <div className="fl-center">
        <div className="fl-ring-outer">
          <span className="fl-progress-pct">{displayPct}%</span>
        </div>
        <div>
          <div className="fl-title">Analyzing repository…</div>
          <div className="fl-stage">{STAGE_LABELS[stage] || stage || 'Initializing'}</div>
        </div>
        <div className="fl-progress-bar">
          <div className="fl-progress-fill" style={{ width: `${displayPct}%` }} />
        </div>
        <div className="fl-steps">
          {steps.map((s, i) => (
            <div key={s.key} className={`fl-step ${/* active/done logic */''}`}>
              <div className="fl-step-dot" />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 9. `src/pages/ResultsPage.jsx` — Structural Changes Only

**No logic changes.** Only class name and wrapper changes:

- Wrap the main dashboard content in `<div className="results-shell">` (already exists, keep it)
- The case header section: replace inline styles with new class names `.case-header`, `.case-id`, `.case-repo`, `.case-meta`
- The section wrappers: use `<div className="section">` with `<div className="section-header">` + `<div className="section-title">` + `<div className="section-body">`
- `LoadingScreen` and error state: use new CSS classes listed in globals.css
- Error panel classes: `.results-error`, `.results-error-icon`, `.results-error-title`, `.results-error-msg`, `.results-error-actions`, `.btn-outline`, `.btn-primary`
- Score color function: update hex values to new semantic colors:

```js
// Replace in ResultsPage and any component using score colors:
const scoreColor = (s) =>
  s >= 0.60 ? 'var(--score-high)' :
  s >= 0.35 ? 'var(--score-mid)' :
              'var(--score-low)';
const scoreBg = (s) =>
  s >= 0.60 ? 'var(--score-high-bg)' :
  s >= 0.35 ? 'var(--score-mid-bg)' :
              'var(--score-low-bg)';
```

---

## 10. `src/components/SummaryStats.jsx` — CSS Class Remap Only

| Old class | New class |
|-----------|-----------|
| `.stat-grid` | `.stat-grid` (unchanged) |
| `.stat-card` | `.stat-card` |
| Inline neon colors | Use `var(--score-high)` / `var(--score-mid)` / `var(--score-low)` |
| Grade letter with old neon color | `.grade-a`, `.grade-b`, `.grade-c`, `.grade-d`, `.grade-f` |
| Verdict strip with neon bg | `.verdict-bar` |

`StatCard` animation: replace `siren-pulse` keyframe with a subtle border-top color flash using `--teal-500`.

---

## 11. `src/components/TimelineView.jsx` — D3 Color Updates

No structural changes. Update only these D3 color values:

| Old value | New value |
|-----------|-----------|
| `#39ff14` (green dots) | `#059669` |
| `#ffd700` (amber dots) | `#D97706` |
| `#ff2a6d` (red dots) | `#DC2626` |
| `#a5a3e8` (GPT-4 line) | `#7C3AED` |
| Collapse rects `rgba(255,42,109,0.12)` | `rgba(220,38,38,0.08)` |
| Axis color `#7a7a9d` | `#94A3B8` |
| Trend line color | `#0D9488` (teal) |
| SVG background (if set) | `transparent` (card provides bg) |
| Tooltip background | `var(--navy-900)` with `#0D9488` border |

---

## 12. `src/components/ScoreHistogram.jsx` — D3 Color Updates

| Old value | New value |
|-----------|-----------|
| Red→green D3 color scale endpoints | `#DC2626` → `#059669` |
| Mean line color `#e8e8f0` | `#0F2D4A` |
| Axis text color | `#64748B` |
| Bar fill opacity | 0.85 → 0.9 |

---

## 13. `src/components/EvalPage.jsx` — Class Remap + Structure

Wrap the page in `<div className="eval-page">`. Update header to use `.eval-header`, `.eval-eyebrow`, `.eval-title`, `.eval-sub`. Each section uses `.eval-section` + `.eval-section-title`. The flag metrics table uses `.flag-metrics-table`. The confusion matrix uses `.confusion-grid` + `.confusion-cell` with type classes.

---

## 14. D3 Chart Visual Guide

Both D3 charts (`TimelineView` and `ScoreHistogram`) should inherit the card's white/beige background. The axis lines should be `#E2E8F0`. Grid lines (if any) should be `rgba(0,0,0,0.04)`. Tooltips: dark navy background (`#0B1929`), `1px solid rgba(13,148,136,0.3)`, rounded `8px`, white text, teal score color.

---

## 15. `public/favicon.svg` — Suggested Update

Replace the current favicon with a simplified version using teal `#0D9488` as primary color on a navy `#0B1929` background circle, keeping the git-branch metaphor.

---

## 16. Summary of Files to Touch

| File | Action |
|------|--------|
| `index.html` | Update `<head>`: new title, fonts, meta |
| `src/styles/globals.css` | **Full replacement** |
| `src/styles/landing.css` | **Full replacement** |
| `src/components/NavBar.jsx` | **Full rewrite** |
| `src/components/Logo.jsx` | Color token update only |
| `src/components/SignalCard.jsx` | **Full rewrite** |
| `src/components/LoadingScreen.jsx` | **Full rewrite** (remove canvas, new layout) |
| `src/components/SummaryStats.jsx` | Class remap + color updates |
| `src/components/TimelineView.jsx` | D3 color palette swap only |
| `src/components/ScoreHistogram.jsx` | D3 color palette swap only |
| `src/components/CommitInspector.jsx` | Class remap (use new inspector-* classes) |
| `src/components/FlagList.jsx` | Class remap (flag-table, flag-chip-*) |
| `src/components/ContributorMatrix.jsx` | Class remap (contributor-table) |
| `src/components/FileHeatMap.jsx` | Class remap (fhm-*) |
| `src/components/EraPanel.jsx` | Class remap (era-panel, era-columns, era-verdict-*) |
| `src/components/CollapseEventBanner.jsx` | Class remap (collapse-banner) |
| `src/pages/LandingPage.jsx` | **Full rewrite** |
| `src/pages/ResultsPage.jsx` | Class remap + error panel update |
| `src/pages/EvalPage.jsx` | Class remap + structure |
| `src/components/ConfusionMatrix.jsx` | Class remap (confusion-grid, confusion-cell-*) |
| `src/components/FailureGallery.jsx` | Class remap (failure-card, failure-fp, failure-fn) |
| `public/favicon.svg` | Color update |

**Files NOT to touch (logic unchanged):**
- `src/hooks/useRepoAnalysis.js`
- `src/utils/repoUrl.js`
- `src/App.jsx`
- `vite.config.js`
- `vercel.json`
- `.env.*`

---

## 17. Implementation Order (Recommended)

1. Update `index.html` — fonts load immediately
2. Replace `globals.css` — dashboard tokens and classes in place
3. Replace `landing.css` — landing tokens in place
4. Rewrite `NavBar.jsx` — visible on all routes
5. Rewrite `LandingPage.jsx` — test the hero and new layout
6. Update `LoadingScreen.jsx` — test by triggering a scan
7. Update `SummaryStats.jsx`, `TimelineView.jsx`, `ScoreHistogram.jsx`
8. Update remaining dashboard components (`CommitInspector`, `FlagList`, `ContributorMatrix`, `FileHeatMap`, `EraPanel`, `CollapseEventBanner`)
9. Update `ResultsPage.jsx` wrappers and error state
10. Update `EvalPage.jsx`, `ConfusionMatrix.jsx`, `FailureGallery.jsx`
11. Update `SignalCard.jsx`
12. Spot-check `Logo.jsx`, `favicon.svg`

---

*Slopify — Clarity Intelligence Theme · Team Avenger*
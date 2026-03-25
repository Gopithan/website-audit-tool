# PagePulse — AI Website Audit Tool

> Built for the EIGHT25MEDIA AI-Native Software Engineer Assignment

A single-file web app that accepts a URL, extracts factual page metrics, and uses Google Gemini AI to generate structured SEO, messaging, CTA, content, and UX insights — grounded in real scraped data.

---

## 🚀 Quick Start

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure API Key**:
    Open `.env` and add your Google Gemini API Key:
    ```
    GEMINI_API_KEY=your_key_here
    ```
3.  **Start the server**:
    ```bash
    npm start
    ```
4.  **Visit the app**:
    Open `http://localhost:3000` in your browser.

---

## Architecture Overview

``` mermaid
graph TD
    User([User]) -->|Input URL| UI[Frontend: index.html]
    UI -->|Fetch HTML| Proxy[corsproxy.io]
    Proxy -->|HTML Content| UI
    UI -->|Extract Metrics| Scraper[DOMParser Scraper]
    Scraper -->|Structured Data| UI
    UI -->|POST /api/audit| Server[Backend: server.js]
    Server -->|Secure SDK Call| AI[Google Gemini API]
    AI -->|JSON Analysis| Server
    Server -->|Final Report| UI
    UI -->|Render| Report[Audit Insights]
```

**Key Improvements:**
- **Secure API Context**: API keys are now stored in `.env` and never exposed to the client.
- **CORS Resolution**: Backend-to-backend communication with Google Gemini avoids browser CORS restrictions.
- **Production Ready**: Uses Express to serve static files and handle API orchestration.


**Key separation:** Scraping (`extractMetrics`) and AI analysis are completely decoupled. The scraper returns a plain object; the AI layer only sees that object and a content sample.

---

## What Gets Extracted (Factual Metrics)

| Metric | Method |
|--------|--------|
| Word count | `body.textContent` split on whitespace |
| H1 / H2 / H3 counts | `querySelectorAll('h1,h2,h3')` |
| Images + alt text coverage | `querySelectorAll('img')` → check `alt` attribute |
| Internal vs external links | `querySelectorAll('a[href]')` → compare hostname |
| CTA elements | Buttons + links with CTA-class names or CTA-keyword text |
| Meta title + description | `<title>`, `<meta name="description">`, `<meta property="og:title">` |

---

## AI Design Decisions

### 1. Structured Input Over Free-Form
The scraper extracts a **metrics object** before any AI call. The model receives structured key-value data, not a raw HTML dump. This prevents hallucination and keeps insights grounded.

### 2. JSON-Only Output Enforcement
The system prompt explicitly instructs the model to respond **only with valid JSON** — no markdown, no preamble. The user prompt defines the exact output schema. This makes parsing deterministic and reliable.

### 3. Content Sample as Context, Not Primary Input
The page's body text (first 4000 chars) is included as supporting context, but the **metrics drive the analysis**. Insights must reference specific numbers. This separates factual data from AI reasoning.

### 4. Single-Turn Architecture
One API call per audit. The prompt is self-contained. No memory, no tool use, no multi-turn overhead. Fast and observable.

### 5. Prompt Transparency Built In
All prompts (system, user, structured input, raw output) are stored in state and exposed via a 4-tab log viewer in the UI. Nothing is hidden.

---

## Prompt Design

**System prompt philosophy:**
- Establishes persona: senior web strategist at a digital marketing agency
- Enforces JSON-only response (no markdown escape)
- Defines exact output schema upfront
- Explicit instruction: "directly reference the provided factual metrics"
- Anti-generic instruction: "Avoid generic advice. Be direct."

**User prompt structure:**
```
URL: [target]

FACTUAL METRICS:
- Word count: X
- H1/H2/H3: X/X/X
- H1 text(s): ...
- Top H2 headings: ...
- Images: X | Missing alt: X (X%)
- Links: internal X | external X
- CTA elements: X
- Meta title: [value or MISSING]
- Meta description: [value or MISSING]

PAGE CONTENT SAMPLE (first 4000 chars):
[body text]
```

This structure forces the model to treat metrics as authoritative data and content as supporting evidence.

---

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Single HTML file | Easy to ship and demo, not scalable for a real product |
| Client-side DOMParser scraping | Fast, no backend needed — but JS-rendered content (SPAs) won't be fully scraped |
| CORS proxy | Makes any public URL auditable in browser, but proxy rate limits can apply |
| No streaming | Simpler UX state management, slightly slower perceived response |
| 4000-char content sample | Balances context quality vs token cost vs prompt size |

---

## What I'd Improve With More Time

1. **Headless browser scraping** — Playwright or Puppeteer to handle JS-rendered SPAs (React, Next.js sites)
2. **Score / grade system** — Aggregate metrics into an overall page health score (0–100) with letter grade
3. **Export to PDF/Notion** — One-click report export for client deliverables
4. **Competitor comparison** — Audit two URLs side-by-side
5. **Historical tracking** — Re-audit the same URL over time to track improvements
6. **Backend API layer** — Move scraping server-side to avoid CORS proxy dependency and add rate limiting
7. **Streaming AI response** — Use SSE streaming to show insights as they generate
8. **Lighthouse integration** — Pull Core Web Vitals (LCP, CLS, FID) alongside the content metrics

---

## Prompt Logs

All prompt logs are visible in the app UI under **"View AI Orchestration Logs"** — including:
- System prompt
- User prompt (with injected metrics)
- Structured API input (JSON)
- Raw model output (before parsing)

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — no build step, no dependencies
- **Scraping:** Browser DOMParser API
- **AI:** Google Gemini API (`gemini-1.5-flash`)
- **CORS:** corsproxy.io

---

*EIGHT25MEDIA AI-Native Software Engineer — 24-Hour Assignment*

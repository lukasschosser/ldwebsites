# LD Websites — Projekt-Kontext für Claude Code

One-Page-Website für ein Webdesign-Business (Lukas & Dominik, Österreich). Statisches
HTML/CSS/JS ohne Build-Schritt, gehostet auf Vercel, automatisches Deployment bei jedem
Push nach GitHub.

## Wichtig: Deployment-Verhalten

**Jeder Push auf `main` deployed sofort automatisch auf die Live-Website (Vercel).**
Es gibt keine Staging-Umgebung — die Produktions-URL läuft direkt von `main`.

→ Deshalb: Änderungen nicht direkt auf `main` pushen, sondern auf einem Feature-Branch
arbeiten und erst nach Freigabe mergen. Details siehe „Workflow" in [README.md](./README.md).

## Struktur

| Datei/Ordner | Zweck |
|---|---|
| `index.html` | Haupt-Landingpage (Hero, Leistungen, Portfolio, Team, Kontaktformular) |
| `preise.html` | Preisseite |
| `beispiele/*.html` | Statische Demo-/Beispielseiten für Branchen (Coaching, Fotostudio, etc.) — eigenständige HTML-Dateien, nicht Teil der Hauptseite |
| `api/website-check.js` | Serverless Function: Live-Website-Check (PageSpeed + Claude Haiku) |
| `api/contact.js` | Serverless Function: Kontaktformular → Supabase (+ optional Resend-Mail) |
| `supabase-schema.sql` | DB-Schema für `website_checks` und `contact_submissions` |
| `.env.example` | Vorlage für benötigte Umgebungsvariablen (echte Werte nur in Vercel) |

## Tech-Stack

- Reines HTML/CSS/JS, Tailwind **über CDN** (kein Build-Schritt, kein `npm run build`)
- Icons: Lucide (`lucide.createIcons()` nach DOM-Änderungen erneut aufrufen, sonst fehlen neue Icons)
- Serverless Functions in `/api` (Vercel Node.js Runtime, ESM-Syntax mit `import`)
- Supabase (Postgres) als DB
- Deployment: Vercel, automatisch bei Push

## Konventionen

- Sprache im Code-Kommentar und in der UI: **Deutsch** (Zielgruppe Österreich)
- Farbschema: Dark-Purple-Branding — Tailwind-Farben `violet.*` sind in `tailwind.config` in jeder
  HTML-Datei einzeln definiert (kein zentrales Config-File, da CDN-Tailwind). Bei Farbänderungen
  **alle** HTML-Dateien mit demselben Config-Block prüfen (`index.html`, `preise.html`, `beispiele/*.html`).
- Abschnitte in `index.html`/`preise.html` sind mit `<!-- ===== NAME ===== -->`-Kommentaren markiert
  — beim Hinzufügen neuer Sections diesem Muster folgen.
- Secrets (API-Keys) **niemals** in HTML/JS im Klartext — die landen im Browser. Alles Sensible läuft
  über `/api/*`-Functions, die serverseitig auf `process.env.*` zugreifen.
- Keine Build-Pipeline vorhanden — Änderungen an HTML/JS sind direkt live wirksam, sobald deployed.

## Lokal testen

Da es keinen Build-Schritt gibt, reicht für reines HTML/CSS/JS ein einfacher lokaler Server.
`.claude/launch.json` ist dafür bereits eingerichtet (`npx serve .` auf Port 5500) — im Claude-Code-
Browser-Tool einfach `preview_start` mit dem Namen `static` aufrufen. Für die `/api`-Functions
(Supabase, PageSpeed, Anthropic) wird zusätzlich `vercel dev` mit einer lokalen `.env`-Datei
(siehe `.env.example`) benötigt, da der einfache Static-Server keine Serverless Functions ausführt.

## Rollback

Siehe README-Abschnitt „Workflow: Branches, Deploys & Rollback" — Vercel behält alle Deployments,
Instant-Rollback ist im Vercel-Dashboard ohne Git-Eingriff möglich.

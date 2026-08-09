# LD Websites

One-Page-Website für Lukas & Dominik (Webdesign-Business, Österreich). Dark-Purple-Branding,
persönliche Ansprache für Zielgruppe 30–60, mit einem interaktiven Live-Website-Check
als Signature-Feature und einem an Supabase angebundenen Kontaktformular.

## Projektstruktur

```
ld-websites/
├── index.html               Die Haupt-Landingpage (HTML + Tailwind CDN + Vanilla JS)
├── preise.html              Preisseite
├── beispiele/               Statische Demo-Seiten pro Branche (Coaching, Fotostudio, ...)
├── api/
│   ├── website-check.js     Serverless Function: echter Website-Check
│   └── contact.js           Serverless Function: Kontaktformular → Supabase
├── supabase-schema.sql      Tabellen für website_checks & contact_submissions
├── vercel.json               Function-Konfiguration (Timeouts)
├── SETUP.md                 Ausführliche Schritt-für-Schritt-Anleitung
├── CLAUDE.md                Projekt-Kontext für Claude Code (Konventionen, Workflow)
├── .env.example              Vorlage für benötigte Umgebungsvariablen
├── package.json
└── .gitignore
```

## Tech-Stack

- **Frontend:** Reines HTML/CSS/JS, Tailwind CSS über CDN, Lucide Icons — kein Build-Schritt nötig
- **Hosting:** Vercel (Serverless Functions im `/api`-Ordner werden automatisch erkannt)
- **Datenbank:** Supabase (Postgres)
- **Echte Performance-/SEO-Daten:** Google PageSpeed Insights API (kostenlos, keine KI-Tokens)
- **KI:** Claude Haiku — nur für Design-Score + Kurztext, mit gecapptem Prompt
- **E-Mail (optional):** Resend

## Wie der Website-Check funktioniert

1. Besucher gibt eine Domain ein → Request an `/api/website-check`
2. Rate-Limit-Check in Supabase (max. 3 Checks pro IP/Tag)
3. Cache-Check: gleiche Domain in den letzten 7 Tagen bereits geprüft? → gecachtes Ergebnis zurückgeben
4. Performance- & SEO-Score kommen direkt von Google PageSpeed Insights (kostet keine KI-Tokens)
5. Nur der Design-Score + ein kurzer Satz kommen von Claude Haiku, mit minimalem Prompt (nur Kennzahlen, nicht die ganze Seite)
6. Ergebnis wird in Supabase gespeichert (dient als Cache + Rate-Limit-Nachweis) und zurückgegeben

## Schnellstart

1. Repo klonen, `npm install`
2. Supabase-Projekt anlegen, `supabase-schema.sql` im SQL Editor ausführen
3. `.env.example` als Vorlage nehmen, echte Keys **nur in Vercel** eintragen (nicht lokal committen)
4. Bei Vercel importieren, Environment Variables setzen, deployen

Ausführliche Anleitung inkl. aller Keys und Kostenübersicht: siehe [`SETUP.md`](./SETUP.md).

## Workflow: Branches, Deploys & Rollback

**Wichtig:** Vercel deployed automatisch bei jedem Push. Ein Push auf `main` geht sofort live —
es gibt keine separate Staging-Umgebung.

### Änderungen machen

1. Feature-Branch erstellen statt direkt auf `main` zu arbeiten:
   ```bash
   git checkout -b feature/kurze-beschreibung
   ```
2. Änderungen committen und pushen:
   ```bash
   git push -u origin feature/kurze-beschreibung
   ```
   → Vercel erstellt automatisch eine **Preview-Deployment-URL** für diesen Branch (im Vercel-Dashboard
   unter „Deployments" sichtbar, oder als Kommentar im zugehörigen Pull Request). Damit lässt sich die
   Änderung vor dem Go-live in Ruhe anschauen, ohne dass die Live-Website betroffen ist.
3. Auf GitHub einen Pull Request gegen `main` öffnen, Preview prüfen, dann mergen.
4. Erst der Merge nach `main` löst das Produktions-Deployment aus.

### Falls nach einem Deploy etwas kaputt ist (Rollback)

**Schnellster Weg — Vercel Instant Rollback (kein Git nötig):**
Im Vercel-Dashboard unter „Deployments" auf eine vorherige, funktionierende Deployment gehen und
„Promote to Production" klicken. Das ist sofort wirksam (wenige Sekunden), unabhängig vom Git-Stand.

**Über Git — für einen sauberen Commit-Verlauf:**
```bash
# den fehlerhaften Commit rückgängig machen (erzeugt neuen Commit, überschreibt nichts)
git revert <commit-hash>
git push
```
Das triggert automatisch ein neues, korrektes Deployment auf Vercel.

### Empfehlung

Vor größeren Änderungen (z. B. Redesign, neue Section) einen Git-Tag auf dem letzten stabilen Stand
setzen, damit es einen klaren Referenzpunkt gibt:
```bash
git tag stabil-2026-08-09
git push origin stabil-2026-08-09
```

## GitHub Push

```bash
cd ld-websites
git init
git add .
git commit -m "Initial commit: LD Websites"
git branch -M main
git remote add origin <eure-repo-url>
git push -u origin main
```

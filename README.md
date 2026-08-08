# LD Websites

One-Page-Website für Lukas & Dominik (Webdesign-Business, Österreich). Dark-Purple-Branding,
persönliche Ansprache für Zielgruppe 30–60, mit einem interaktiven Live-Website-Check
als Signature-Feature und einem an Supabase angebundenen Kontaktformular.

## Projektstruktur

```
ld-websites/
├── index.html               Die komplette Website (HTML + Tailwind CDN + Vanilla JS)
├── api/
│   ├── website-check.js     Serverless Function: echter Website-Check
│   └── contact.js           Serverless Function: Kontaktformular → Supabase
├── supabase-schema.sql      Tabellen für website_checks & contact_submissions
├── SETUP.md                 Ausführliche Schritt-für-Schritt-Anleitung
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

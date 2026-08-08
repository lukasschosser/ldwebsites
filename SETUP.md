# Setup-Anleitung: LD Websites live schalten

## 1. Supabase-Projekt anlegen (kostenlos)
1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt erstellen.
2. Unter **SQL Editor** den Inhalt von `supabase-schema.sql` einfügen und ausführen.
3. Unter **Project Settings → API** zwei Werte kopieren:
   - `Project URL` → wird zu `SUPABASE_URL`
   - `service_role` Key (NICHT der `anon` Key!) → wird zu `SUPABASE_SERVICE_ROLE_KEY`

## 2. Google PageSpeed Insights API-Key (kostenlos)
1. In der [Google Cloud Console](https://console.cloud.google.com) ein Projekt anlegen.
2. "PageSpeed Insights API" aktivieren.
3. Einen API-Key erstellen → wird zu `PAGESPEED_API_KEY`.
4. Kostenloses Kontingent: 25.000 Anfragen/Tag — für eine kleine Business-Website extrem großzügig.

## 3. Anthropic API-Key
1. Auf [console.anthropic.com](https://console.anthropic.com) einen API-Key erstellen → wird zu `ANTHROPIC_API_KEY`.
2. Model im Code ist bereits auf das günstigste Modell (Haiku) gesetzt.

## 4. (Optional) Resend für E-Mail-Benachrichtigungen
1. Auf [resend.com](https://resend.com) kostenlos registrieren (3.000 E-Mails/Monat gratis).
2. API-Key erstellen → wird zu `RESEND_API_KEY`.
3. Ohne diesen Key funktioniert das Kontaktformular trotzdem — die Anfrage landet nur in Supabase, ihr müsst dort nachschauen.

## 5. Projektstruktur für Vercel
```
projekt/
├── index.html          (die studio-form.html, umbenannt)
├── api/
│   ├── website-check.js
│   └── contact.js
└── package.json
```

`package.json` braucht mindestens:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0"
  }
}
```

## 6. Deployment auf Vercel
1. Projekt auf GitHub pushen (oder Ordner direkt bei vercel.com hochladen).
2. Bei [vercel.com](https://vercel.com) → "Add New Project" → Repo auswählen.
3. Unter **Environment Variables** alle vier/fünf Keys von oben eintragen.
4. Deploy klicken — fertig, Vercel erkennt den `/api`-Ordner automatisch als Serverless Functions.

## 7. Eigene Domain verbinden
1. `.at`-Domain über nic.at-Registrar (z. B. easyname, checkdomain) registrieren.
2. In Vercel unter **Domains** die Domain hinzufügen, DNS-Einträge beim Registrar setzen.
3. HTTPS wird automatisch von Vercel eingerichtet.

## Kostenübersicht (Stand: realistisch für eine kleine Business-Website)
| Dienst | Kostenloses Kontingent | Reicht für |
|---|---|---|
| Vercel | 100 GB-Std. Functions/Monat | Tausende Aufrufe |
| Supabase | 500 MB DB, 2 GB Traffic | Weit mehr als ihr am Anfang braucht |
| PageSpeed Insights | 25.000 Anfragen/Tag | Praktisch unbegrenzt für euch |
| Anthropic (Haiku) | Kein Free-Tier, aber sehr günstig | Durch Caching + Rate-Limit nur wenige Cent/Monat |
| Resend | 3.000 E-Mails/Monat | Mehr als genug |

Der einzige Posten, der tatsächlich Geld kostet, ist Anthropic — durch Caching (7 Tage pro Domain)
und Rate-Limit (3 Checks/IP/Tag) bleibt das aber im Cent-Bereich, selbst bei einigen Hundert
Besuchern im Monat.

// /api/website-check.js
// Vercel Serverless Function — läuft automatisch, wenn diese Datei im /api-Ordner liegt.
// Benötigte Umgebungsvariablen (in Vercel unter Project Settings → Environment Variables):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (NICHT der "anon" Key — dieser Key bleibt nur serverseitig!)
//   PAGESPEED_API_KEY           (kostenlos über Google Cloud Console, "PageSpeed Insights API" aktivieren)
//   ANTHROPIC_API_KEY

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const RATE_LIMIT_PER_DAY = 3;      // max. Checks pro IP und Tag
const CACHE_DAYS = 7;              // wie lange ein Ergebnis pro Domain wiederverwendet wird

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body || {};
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Bitte eine Domain angeben.' });
  }

  const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const targetUrl = `https://${cleanDomain}`;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // IP wird nur gehasht gespeichert (Datenschutz), dient ausschließlich dem Rate-Limit
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

  // 1) Rate-Limit prüfen
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentByIp, error: rateLimitError } = await supabase
    .from('website_checks')
    .select('id')
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  if (!rateLimitError && recentByIp && recentByIp.length >= RATE_LIMIT_PER_DAY) {
    return res.status(429).json({ error: 'Tageslimit erreicht — bitte morgen erneut versuchen.' });
  }

  // 2) Cache prüfen — gleiche Domain innerhalb der letzten CACHE_DAYS Tage?
  const cacheSince = new Date(Date.now() - CACHE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: cached } = await supabase
    .from('website_checks')
    .select('result')
    .eq('domain', cleanDomain)
    .gte('created_at', cacheSince)
    .order('created_at', { ascending: false })
    .limit(1);

  if (cached && cached.length > 0) {
    return res.status(200).json({ ...cached[0].result, cached: true });
  }

  // 3) Echte Performance-/SEO-Daten von Google PageSpeed Insights — kostet keine KI-Tokens
  let performanceScore = 50;
  let mobileScore = 50;
  let signals = {};

  try {
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&key=${process.env.PAGESPEED_API_KEY}&category=performance&category=seo&strategy=mobile`;
    const psiRes = await fetch(psiUrl);
    const psi = await psiRes.json();

    if (!psiRes.ok || psi.error) {
      console.error('PageSpeed API Fehler:', psi.error?.message || psiRes.status);
    } else {
      performanceScore = Math.round((psi.lighthouseResult?.categories?.performance?.score ?? 0.5) * 100);
      mobileScore = Math.round((psi.lighthouseResult?.categories?.seo?.score ?? 0.5) * 100);
      signals = {
        hasViewportMeta: psi.lighthouseResult?.audits?.viewport?.score === 1,
        pageSizeKb: Math.round((psi.lighthouseResult?.audits?.['total-byte-weight']?.numericValue ?? 0) / 1024),
      };
    }
  } catch (err) {
    // PageSpeed nicht erreichbar (z. B. Seite offline, oder Function-Timeout) — mit Fallback-Werten weitermachen
    console.error('PageSpeed Request fehlgeschlagen:', err.message);
  }

  // 4) Kurzer, gedeckelter KI-Call NUR für Design-Score + einen Satz Einschätzung
  let designScore = 55;
  let summary = 'Es gibt noch Potenzial bei Ladezeit und mobiler Darstellung.';

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{
          role: 'user',
          content:
            `Domain: ${cleanDomain}. Performance-Score: ${performanceScore}/100. ` +
            `Viewport-Tag vorhanden: ${signals.hasViewportMeta}. Seitengröße: ${signals.pageSizeKb}KB. ` +
            `Antworte NUR mit JSON: {"designScore": <Zahl 0-100>, "summary": "<max. 20 Wörter, Deutsch, sachlich, leicht kritisch aber konstruktiv>"}`
        }],
      }),
    });
    const aiData = await aiRes.json();
    const rawText = aiData.content?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    designScore = parsed.designScore ?? designScore;
    summary = parsed.summary ?? summary;
  } catch (err) {
    // KI nicht erreichbar oder Antwort nicht parsebar — Fallback-Werte bleiben stehen
    console.error('Anthropic Request fehlgeschlagen:', err.message);
  }

  const result = { domain: cleanDomain, performanceScore, designScore, mobileScore, summary };

  // 5) Ergebnis speichern (dient gleichzeitig als Cache-Eintrag und Rate-Limit-Nachweis)
  await supabase.from('website_checks').insert({ domain: cleanDomain, ip_hash: ipHash, result });

  return res.status(200).json(result);
}

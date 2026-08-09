// /api/contact.js
// Vercel Serverless Function für das Kontaktformular.
// Benötigte Umgebungsvariablen:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY   (optional — für E-Mail-Benachrichtigung, kostenlos bis 3.000 Mails/Monat auf resend.com)

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase.from('contact_submissions').insert({ name, email, message });
  if (error) {
    return res.status(500).json({ error: 'Anfrage konnte nicht gespeichert werden.' });
  }

  // E-Mail-Benachrichtigung, damit ihr die Anfrage nicht erst in Supabase nachschauen müsst
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Absender-Domain muss bei Resend verifiziert sein (resend.com/domains),
          // sonst schlägt der Versand fehl.
          from: 'LD Websites <office@ldwebsites.at>',
          to: 'office@ldwebsites.at',
          subject: `Neue Anfrage von ${name}`,
          text: `${message}\n\nVon: ${name} (${email})`,
        }),
      });
    } catch (err) {
      // E-Mail-Versand fehlgeschlagen — Anfrage ist trotzdem in Supabase gespeichert
    }
  }

  return res.status(200).json({ success: true });
}

// /api/check-in.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ ok:false, message:'Method not allowed' });
    return;
  }

  try {
    const { scannedText, target, action, sheetId } = req.body || {};
    if (!scannedText) { res.status(400).json({ ok:false, message:'Missing scannedText' }); return; }
    if (!target && !action) { res.status(400).json({ ok:false, message:'Missing target or action' }); return; }
    if (!sheetId) { res.status(400).json({ ok:false, message:'Missing sheetId' }); return; }

    // NEW default GAS URL, you can still override via env
    const GAS_URL = (process.env.GAS_WEBAPP_URL
      || 'https://script.google.com/macros/s/AKfycbyTJZ8ooCGLzWrNCHTfGh4MAwOFe278Ax0O61GM7MiNkSNDgVgI9CWI9B2IMN6xorVi9Q/exec').trim();
    const SECRET  = (process.env.CHECKIN_SECRET || 'GMSKL20300').trim();

    const ac = new AbortController();
    const kill = setTimeout(() => ac.abort(), 30000);

    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ scannedText, target, action, sheetId, secret: SECRET }),
      signal: ac.signal,
      cache: 'no-store'
    }).catch(err => { throw new Error('Fetch to GAS failed, ' + err.message); });

    clearTimeout(kill);

    const txt = await r.text();
    let json; try { json = JSON.parse(txt); } catch { json = { ok:false, message: txt || 'Invalid JSON from backend' }; }
    res.status(r.ok ? 200 : r.status).json(json);
  } catch (err) {
    res.status(500).json({ ok:false, message:'Proxy error, ' + err.message });
  }
}
export const config = { runtime: 'nodejs' };

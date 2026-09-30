import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';
import { getDbStatus, supabase } from './config/db.js';

// Force IPv4 — fixes "fetch failed" on Vercel when Supabase DNS doesn't respond to IPv6
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'CCNDM backend is running.',
    db: getDbStatus(),
  });
});

// ─── DEBUG ENDPOINT — remove after fixing ─────────────────────────────
app.get('/api/debug-supabase', async (req, res) => {
  const info = {
    url: process.env.SUPABASE_URL,
    urlLength: process.env.SUPABASE_URL?.length,
    urlHasTrailingSlash: process.env.SUPABASE_URL?.endsWith('/'),
    urlHasWhitespace: /\s/.test(process.env.SUPABASE_URL || ''),
    urlHasRestPath: process.env.SUPABASE_URL?.includes('/rest/'),
    keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    keyStartsWith: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 12),
    hasSupabaseClient: !!supabase,
    nodeVersion: process.version,
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
  };

  // Raw fetch to isolate networking issues
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '' },
    });
    info.rawFetchStatus = r.status;
    info.rawFetchOk = r.ok;
  } catch (err) {
    info.rawFetchError = err.message;
    info.rawFetchCause = err.cause?.message || err.cause?.code || String(err.cause);
    if (err.cause) {
      info.rawFetchCauseFull = JSON.stringify(
        err.cause,
        Object.getOwnPropertyNames(err.cause)
      );
    }
  }

  // Supabase client query
  try {
    const { data, error } = await supabase.from('students').select('*').limit(1);
    if (error) {
      info.queryError = error.message;
      info.queryErrorCause = error.cause?.message || String(error.cause);
      info.queryErrorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
    } else {
      info.querySuccess = true;
      info.queryRowCount = data?.length ?? 0;
    }
  } catch (err) {
    info.queryThrew = err.message;
    info.queryThrewCause = err.cause?.message || String(err.cause);
  }

  res.json(info);
});
// ──────────────────────────────────────────────────────────────────────

app.get('/api/students', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  const { data, error } = await supabase.from('students').select('*').order('name', { ascending: true });

  if (error) {
    return res.status(400).json({
      message: error.message,
      cause: error.cause?.message,
    });
  }

  return res.json(data || []);
});

app.get('/api/penalties', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  const { data, error } = await supabase
    .from('penalties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({
      message: error.message,
      cause: error.cause?.message,
    });
  }

  return res.json(data || []);
});

app.get('/api/appeals', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  const { data, error } = await supabase
    .from('appeals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({
      message: error.message,
      cause: error.cause?.message,
    });
  }

  return res.json(data || []);
});

app.get('/api/notifications', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({
      message: error.message,
      cause: error.cause?.message,
    });
  }

  return res.json(data || []);
});

app.get('/', (req, res) => {
  res.json({
    app: 'CCNDM backend',
    endpoints: ['/api/health', '/api/students', '/api/penalties', '/api/appeals', '/api/notifications'],
  });
});

// Vercel serverless export
export default app;

// Local dev only
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CCNDM backend running at http://localhost:${PORT}`);
  });
}
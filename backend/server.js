import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDbStatus, supabase } from './config/db.js';

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

app.get('/api/students', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  const { data, error } = await supabase.from('students').select('*').order('name', { ascending: true });

  if (error) {
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
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

// Local dev only — Vercel runs the app directly, no listen needed
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CCNDM backend running at http://localhost:${PORT}`);
  });
}
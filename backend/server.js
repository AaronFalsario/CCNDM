import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDbStatus, supabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { applyStudentReadState } from './lib/notifications.js';
import { requireAuth, requireRole } from './middleware/authMiddleware.js';

// Force IPv4 — fixes "fetch failed" on Vercel when Supabase DNS doesn't respond to IPv6
dns.setDefaultResultOrder('ipv4first');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5050;

// FIXED: Changed AUTH_JWT_SECRET to JWT_SECRET
if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 bytes.');
}

if (!supabase) {
  throw new Error('Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before starting the backend.');
}

const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
    .map((origin) => origin?.trim())
    .filter(Boolean)
);
const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.has(origin)) return true;
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'http:'
      && ['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://127.0.0.1:5173');
  allowedOrigins.add('http://localhost:5050');
  allowedOrigins.add('http://127.0.0.1:5050');
} else if (allowedOrigins.size === 0) {
  throw new Error('Configure FRONTEND_URL or CORS_ORIGINS before starting the production backend.');
}

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ message: 'Request origin is not allowed.' });
  }
  return next();
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'CCNDM backend is running.',
    db: getDbStatus(),
  });
});

app.get('/api/students', requireAuth, requireRole('admin'), async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  const { data, error } = await supabase
    .from('students')
    .select('id, student_id_number, name, email, course, year_level, status, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    return next(error);
  }

  return res.json(data || []);
});

app.get('/api/penalties', requireAuth, async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  let query = supabase
    .from('penalties')
    .select('*')
    .order('created_at', { ascending: false });
  if (req.user.role === 'student') {
    query = query.eq('student_id', req.user.student_id_number);
  }
  const { data, error } = await query;

  if (error) {
    return next(error);
  }

  return res.json(data || []);
});

app.get('/api/appeals', requireAuth, async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  let query = supabase
    .from('appeals')
    .select('*')
    .order('created_at', { ascending: false });
  if (req.user.role === 'student') {
    query = query.eq('student_id', req.user.student_id_number);
  }
  const { data, error } = await query;

  if (error) {
    return next(error);
  }

  return res.json(data || []);
});

app.get('/api/notifications', requireAuth, async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured.' });
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (req.user.role === 'student') {
    const studentId = String(req.user.student_id_number || '');
    if (!/^\d{8}$/.test(studentId)) {
      return res.status(403).json({ message: 'The student profile is not valid.' });
    }
    query = query.or(`student_id.is.null,student_id.eq.${studentId}`);
  }
  const { data, error } = await query;

  if (error) {
    return next(error);
  }

  if (req.user.role === 'student') {
    try {
      const notifications = await applyStudentReadState(supabase, data || [], req.user.id);
      return res.json(notifications);
    } catch (readError) {
      return next(readError);
    }
  }
  return res.json(data || []);
});

app.get('/', (req, res) => {
  res.json({
    app: 'CCNDM backend',
    endpoints: ['/api/health', '/api/students', '/api/penalties', '/api/appeals', '/api/notifications'],
  });
});

app.use((error, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

// Vercel serverless export
export default app;

// Local dev only
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CCNDM backend running at http://localhost:${PORT}`);
  });
}
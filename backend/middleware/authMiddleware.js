import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

const COOKIE_NAME = 'ccndm_session';

function getSessionToken(req) {
  const cookie = (req.headers.cookie || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1));
  } catch {
    return null;
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes.');
  }
  return secret;
}

export function requireAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ message: 'Authentication service is not configured.' });
  }

  const token = getSessionToken(req);
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });

  let claims;
  try {
    claims = jwt.verify(token, getJwtSecret(), { issuer: 'ccndm-backend' });
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }

  if (!['student', 'admin'].includes(claims.role) || typeof claims.sub !== 'string') {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }

  const table = claims.role === 'student' ? 'students' : 'admins';
  const select = claims.role === 'student'
    ? 'id, student_id_number, name, email, course, year_level, status, session_version'
    : 'id, admin_id, full_name, email, role, status, session_version';

  supabase
    .from(table)
    .select(select)
    .eq('id', claims.sub)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) return next(error);
      const inactive = claims.role === 'admin'
        ? String(data?.status || '').toLowerCase() !== 'active'
        : ['inactive', 'suspended'].includes(String(data?.status || '').toLowerCase());
      if (!data || inactive || claims.sv !== data.session_version) {
        return res.status(401).json({ message: 'Your account is inactive or no longer available.' });
      }

      req.user = {
        ...data,
        id: String(data.id),
        role: claims.role,
      };
      return next();
    })
    .catch(next);
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

export { COOKIE_NAME, getJwtSecret };
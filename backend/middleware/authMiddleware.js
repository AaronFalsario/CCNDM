import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

const COOKIE_NAME = 'ccndm_session';
const ROLE_COOKIE_NAMES = {
  student: 'ccndm_student_session',
  admin: 'ccndm_admin_session',
};

function getCookieValue(req, name) {
  const cookie = (req.headers.cookie || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(name.length + 1));
  } catch {
    return null;
  }
}

function getSessionToken(req, expectedRole) {
  if (expectedRole && ROLE_COOKIE_NAMES[expectedRole]) {
    const roleToken = getCookieValue(req, ROLE_COOKIE_NAMES[expectedRole]);
    if (roleToken) return roleToken;

    const legacyToken = getCookieValue(req, COOKIE_NAME);
    if (!legacyToken) return null;
    try {
      return jwt.decode(legacyToken)?.role === expectedRole ? legacyToken : null;
    } catch {
      return null;
    }
  }

  return getCookieValue(req, ROLE_COOKIE_NAMES.admin)
    || getCookieValue(req, ROLE_COOKIE_NAMES.student)
    || getCookieValue(req, COOKIE_NAME);
}

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('AUTH_JWT_SECRET must be configured with at least 32 bytes.');
  }
  return secret;
}

export function requireAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ message: 'Authentication service is not configured.' });
  }

  const expectedRole = req.get('x-ccndm-session-role');
  if (expectedRole && !ROLE_COOKIE_NAMES[expectedRole]) {
    return res.status(400).json({ message: 'Invalid session role.' });
  }

  const token = getSessionToken(req, expectedRole);
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });

  let claims;
  try {
    claims = jwt.verify(token, getJwtSecret(), { issuer: 'ccndm-backend' });
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }

  if (
    !['student', 'admin'].includes(claims.role)
    || typeof claims.sub !== 'string'
    || (expectedRole && claims.role !== expectedRole)
  ) {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }

  const table = claims.role === 'student' ? 'students' : 'admins';
  const select = claims.role === 'student'
    ? 'id, student_id_number, name, email, course, year_level, status, session_version, must_change_password'
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
      const allowedDuringPasswordChange = [
        '/api/auth/me',
        '/api/auth/change-password',
        '/api/auth/logout',
      ];
      if (
        claims.role === 'student'
        && data.must_change_password
        && !allowedDuringPasswordChange.includes(req.originalUrl.split('?')[0])
      ) {
        return res.status(403).json({
          code: 'PASSWORD_CHANGE_REQUIRED',
          message: 'Change your temporary password before accessing the portal.',
        });
      }
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

export { COOKIE_NAME, ROLE_COOKIE_NAMES, getJwtSecret };
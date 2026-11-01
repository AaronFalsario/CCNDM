import { Router } from 'express';
import { supabase } from '../config/db.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { unlockEligibleAchievements } from '../lib/achievements.js';
import { applyStudentReadState } from '../lib/notifications.js';

const router = Router();

const resourceRules = {
  students: {
    fields: [
      'id', 'student_id_number', 'name', 'email', 'course', 'year_level',
      'status', 'created_at', 'updated_at', 'last_login',
    ],
    admin: ['read', 'create', 'update', 'delete'],
    student: ['read', 'update'],
    studentFilter: ['student_id_number'],
    studentUpdate: ['name'],
  },
  admins: {
    fields: ['id', 'admin_id', 'full_name', 'email', 'role', 'status', 'last_login'],
    admin: ['read', 'update'],
    student: [],
    adminUpdate: ['full_name', 'email'],
  },
  penalties: {
    fields: [
      'id', 'student_id', 'student_name', 'student_email', 'violation',
      'violation_type', 'category', 'hours', 'status', 'offense_level',
      'is_warning', 'description', 'created_at', 'updated_at', 'started_at',
      'completed_at', 'service_type', 'deadline', 'image_url',
    ],
    admin: ['read', 'create', 'update', 'delete'],
    student: ['read'],
    studentFilter: ['student_profile_id'],
  },
  appeals: {
    fields: [
      'id', 'student_id', 'student_name', 'student_email', 'penalty_id',
      'penalty_violation', 'penalty_hours', 'penalty_deadline', 'appeal_reason',
      'supporting_statement', 'status', 'created_at', 'reviewed_at',
      'reviewed_by', 'reviewed_by_name', 'admin_comment', 'admin_remarks',
    ],
    admin: ['read', 'update', 'delete'],
    student: ['read', 'create'],
    studentFilter: ['student_profile_id'],
    studentCreate: [
      'penalty_id', 'penalty_violation', 'penalty_hours', 'penalty_deadline',
      'appeal_reason', 'supporting_statement', 'created_at',
    ],
  },
  notifications: {
    fields: [
      'id', 'student_id', 'title', 'message', 'type', 'is_read', 'read_at',
      'created_at', 'image_url', 'priority',
    ],
    admin: ['read', 'create', 'update', 'delete'],
    student: ['read', 'update', 'delete'],
    studentFilter: ['student_profile_id'],
    studentUpdate: ['is_read', 'read_at'],
  },
  activity_log: {
    fields: [
      'id', 'admin_id', 'admin_name', 'type', 'description', 'target_id',
      'created_at',
    ],
    admin: ['read', 'create'],
    student: [],
  },
  service_sessions: {
    fields: [
      'id', 'student_id', 'scheduled_date', 'start_time', 'end_time',
      'hours', 'status', 'location', 'notes', 'created_at', 'updated_at',
    ],
    admin: ['read', 'create', 'update', 'delete'],
    student: ['read'],
    studentFilter: ['student_profile_id'],
  },
  achievements: {
    fields: [
      'id', 'student_id', 'badge_key', 'badge_name', 'badge_desc',
      'unlocked_at', 'created_at',
    ],
    admin: ['read', 'create', 'update', 'delete'],
    student: ['read'],
    studentFilter: ['student_profile_id'],
  },
};

const privateFields = new Set(['password', 'password_hash']);
const maxRows = 500;
const studentLinkedTables = new Set([
  'penalties',
  'appeals',
  'service_sessions',
  'achievements',
  'notifications',
]);

function getRules(table) {
  return resourceRules[table] || null;
}

function getFilters(value, rules) {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw Object.assign(new Error('Filters must be an object.'), { status: 400 });
  }

  const filters = {};
  for (const [field, filterValue] of Object.entries(value)) {
    if (!rules.fields.includes(field)) {
      throw Object.assign(new Error(`Filtering by "${field}" is not allowed.`), { status: 400 });
    }
    if (Array.isArray(filterValue)) {
      if (!filterValue.length || filterValue.length > maxRows) {
        throw Object.assign(new Error('Array filters must contain between 1 and 500 values.'), { status: 400 });
      }
      filters[field] = filterValue;
    } else if (
      filterValue === null ||
      ['string', 'number', 'boolean'].includes(typeof filterValue)
    ) {
      filters[field] = filterValue;
    } else {
      throw Object.assign(new Error(`Invalid filter value for "${field}".`), { status: 400 });
    }
  }
  return filters;
}

function getRows(value, rules, role, action) {
  const rows = Array.isArray(value) ? value : [value];
  if (!rows.length || rows.length > maxRows) {
    throw Object.assign(new Error('Provide between 1 and 500 records.'), { status: 400 });
  }

  return rows.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw Object.assign(new Error('Each record must be an object.'), { status: 400 });
    }

    const allowedFields = role === 'student' && action === 'update'
      ? rules.studentUpdate || []
      : role === 'student' && action === 'create'
        ? rules.studentCreate || []
        : role === 'admin' && action === 'update' && rules.adminUpdate
          ? rules.adminUpdate
          : rules.fields.filter((field) => !privateFields.has(field));
    const sanitized = {};
    for (const [field, fieldValue] of Object.entries(row)) {
      if (!allowedFields.includes(field)) {
        throw Object.assign(new Error(`Writing "${field}" is not allowed.`), { status: 400 });
      }
      sanitized[field] = fieldValue;
    }

    return sanitized;
  });
}

function applyFilters(query, filters) {
  for (const [field, value] of Object.entries(filters)) {
    query = Array.isArray(value) ? query.in(field, value) : query.eq(field, value);
  }
  return query;
}

function projectFields(value, fields) {
  if (Array.isArray(value)) return value.map((row) => projectFields(row, fields));
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const field of fields) {
    if (Object.hasOwn(value, field)) result[field] = value[field];
  }
  return result;
}

router.post('/notifications/read', requireAuth, async (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }
  if (!supabase) return res.status(503).json({ message: 'Database service is not configured.' });

  const requestedIds = Array.isArray(req.body?.ids) ? req.body.ids : [req.body?.id];
  if (!requestedIds.length || requestedIds.length > maxRows) {
    return res.status(400).json({ message: 'Provide between 1 and 500 notification IDs.' });
  }
  const ids = [...new Set(requestedIds.map(Number))];
  if (ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
    return res.status(400).json({ message: 'Notification IDs must be positive integers.' });
  }

  try {
    const { data: notifications, error: lookupError } = await supabase
      .from('notifications')
      .select('id, student_id')
      .in('id', ids);
    if (lookupError) return next(lookupError);

    const rows = (notifications || [])
      .filter((notification) => notification.student_id === null || notification.student_id === undefined)
      .map((notification) => ({
        student_id: req.user.id,
        student_profile_id: req.user.id,
        notification_id: notification.id,
        read_at: new Date().toISOString(),
      }));
    if (!rows.length) return res.json({ updated: 0 });

    const { error } = await supabase
      .from('notification_reads')
      .upsert(rows, { onConflict: 'student_profile_id,notification_id' });
    if (error) return next(error);
    return res.json({ updated: rows.length });
  } catch (error) {
    return next(error);
  }
});

router.post('/achievements/unlock', requireAuth, async (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }
  if (!supabase) return res.status(503).json({ message: 'Database service is not configured.' });

  const keys = req.body?.keys;
  if (
    !Array.isArray(keys) ||
    keys.length < 1 ||
    keys.length > 14 ||
    keys.some((key) => typeof key !== 'string')
  ) {
    return res.status(400).json({ message: 'Provide one or more valid achievement keys.' });
  }

  try {
    const { badges, eligible, previousAchievements, windowStart } =
      await unlockEligibleAchievements(supabase, req.user);
    const activeKeys = new Set(
      previousAchievements
        .filter((achievement) => new Date(achievement.unlocked_at) >= windowStart)
        .map((achievement) => achievement.badge_key)
    );
    const rows = [...new Set(keys)]
      .filter((key) => Object.hasOwn(badges, key) && eligible[key] && !activeKeys.has(key))
      .map((key) => ({
        student_id: req.user.student_id_number,
        student_profile_id: req.user.id,
        badge_key: key,
        badge_name: badges[key].name,
        badge_desc: badges[key].description,
        unlocked_at: new Date().toISOString(),
      }));
    if (!rows.length) return res.json({ unlocked: [] });

    const { data, error } = await supabase.from('achievements').insert(rows).select(
      'id, student_id, badge_key, badge_name, badge_desc, unlocked_at, created_at'
    );
    if (error) return next(error);
    return res.json({ unlocked: data || [] });
  } catch (error) {
    return next(error);
  }
});

router.all('/:table', requireAuth, async (req, res, next) => {
  const table = req.params.table;
  const rules = getRules(table);
  if (!rules || !supabase) {
    return res.status(rules ? 503 : 404).json({
      message: rules ? 'Database service is not configured.' : 'Resource not found.',
    });
  }

  const role = req.user.role;
  const action = {
    GET: 'read',
    POST: 'create',
    PATCH: 'update',
    DELETE: 'delete',
  }[req.method];
  const permittedActions = rules[role] || [];
  if (!action || !permittedActions.includes(action)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  try {
    const filters = getFilters(
      req.method === 'GET' ? req.query.filters && JSON.parse(req.query.filters) : req.body?.filters,
      rules
    );
    let query;
    let data;
    let error;

    if (role === 'student') {
      if (rules.studentFilter?.includes('student_profile_id')) {
        filters.student_profile_id = req.user.id;
      } else if (rules.studentFilter?.includes('student_id_number')) {
        filters.student_id_number = req.user.student_id_number;
      }

      if (table === 'notifications') {
        const ownId = String(req.user.student_id_number || '');
        if (!/^\d{8}$/.test(ownId)) {
          return res.status(403).json({ message: 'The student profile is not valid.' });
        }
        query = supabase
          .from(table)
          .select('*')
          .or(`student_id.is.null,student_profile_id.eq.${req.user.id}`);
      }
    }

    if (req.method === 'GET') {
      if (!query) query = supabase.from(table).select('*');
      const queryFilters = role === 'student' && table === 'notifications'
        ? Object.fromEntries(
          Object.entries(filters).filter(([field]) => !['student_id', 'student_profile_id'].includes(field))
        )
        : filters;
      query = applyFilters(query, queryFilters);

      if (req.query.order) {
        if (!rules.fields.includes(req.query.order)) {
          return res.status(400).json({ message: 'The requested sort field is not allowed.' });
        }
        query = query.order(req.query.order, {
          ascending: req.query.ascending !== 'false',
        });
      }
      if (req.query.limit) {
        const limit = Number(req.query.limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > maxRows) {
          return res.status(400).json({ message: 'Limit must be between 1 and 500.' });
        }
        query = query.limit(limit);
      }
      ({ data, error } = await query);
      if (!error && role === 'student' && table === 'notifications') {
        data = await applyStudentReadState(supabase, data || [], req.user.id);
      }
    } else if (req.method === 'POST') {
      const rows = getRows(req.body?.rows ?? req.body?.data, rules, role, 'create');
      if (role === 'student' && table === 'appeals') {
        for (const row of rows) {
          if (!row.penalty_id) {
            return res.status(400).json({ message: 'Select a valid penalty before submitting an appeal.' });
          }
          const { data: penalty, error: penaltyError } = await supabase
            .from('penalties')
            .select('id, student_id, violation, hours, deadline')
            .eq('id', row.penalty_id)
            .eq('student_profile_id', req.user.id)
            .maybeSingle();
          if (penaltyError) return next(penaltyError);
          if (!penalty) {
            return res.status(403).json({ message: 'You can only appeal a penalty assigned to your account.' });
          }
          const { data: existingAppeal, error: appealError } = await supabase
            .from('appeals')
            .select('id')
            .eq('student_profile_id', req.user.id)
            .eq('penalty_id', penalty.id)
            .limit(1)
            .maybeSingle();
          if (appealError) return next(appealError);
          if (existingAppeal) {
            return res.status(409).json({ message: 'An appeal has already been submitted for this penalty.' });
          }

          row.student_id = req.user.student_id_number;
          row.student_profile_id = req.user.id;
          row.student_name = req.user.name;
          row.student_email = req.user.email || '';
          row.penalty_violation = penalty.violation;
          row.penalty_hours = penalty.hours;
          row.penalty_deadline = penalty.deadline;
          row.status = 'pending';
          row.reviewed_at = null;
        }
      }
      if (role === 'student' && table === 'achievements') {
        rows.forEach((row) => {
          row.student_id = req.user.student_id_number;
          row.student_profile_id = req.user.id;
        });
      }
      if (role === 'admin' && table === 'activity_log') {
        rows.forEach((row) => {
          row.admin_id = req.user.id;
          row.admin_profile_id = req.user.id;
          row.admin_name = req.user.full_name || req.user.admin_id || 'Admin';
        });
      }
      if (studentLinkedTables.has(table)) {
        const studentIds = [...new Set(rows
          .map((row) => String(row.student_id ?? '').trim())
          .filter(Boolean))];
        const profilesResult = studentIds.length
          ? await supabase
            .from('students')
            .select('id, student_id_number')
            .in('student_id_number', studentIds)
          : { data: [], error: null };
        if (profilesResult.error) return next(profilesResult.error);

        const profilesByStudentId = new Map(
          (profilesResult.data || []).map((profile) => [
            profile.student_id_number,
            String(profile.id),
          ])
        );
        for (const row of rows) {
          const studentId = String(row.student_id ?? '').trim();
          if (!studentId && table === 'notifications') {
            row.student_id = null;
            row.student_profile_id = null;
            continue;
          }
          const profileId = profilesByStudentId.get(studentId);
          if (!profileId) {
            return res.status(400).json({
              message: 'Every student-linked record must reference an existing student profile.',
            });
          }
          row.student_id = studentId;
          row.student_profile_id = profileId;
        }
      }
      ({ data, error } = await supabase.from(table).insert(rows).select('*'));
    } else if (req.method === 'PATCH') {
      const values = getRows(req.body?.values, rules, role, 'update')[0];
      if (!Object.keys(filters).length) {
        return res.status(400).json({ message: 'Updates require at least one filter.' });
      }
      if (!Object.keys(values).length) {
        return res.status(400).json({ message: 'Provide at least one field to update.' });
      }
      query = supabase.from(table).update(values);
      if (role === 'student' && table === 'notifications') {
        const ownId = String(req.user.student_id_number || '');
        filters.student_id = ownId;
        filters.student_profile_id = req.user.id;
      }
      query = applyFilters(query, filters);
      ({ data, error } = await query.select('*'));
    } else if (req.method === 'DELETE') {
      if (!Object.keys(filters).length) {
        return res.status(400).json({ message: 'Deletes require at least one filter.' });
      }
      query = supabase.from(table).delete();
      if (role === 'student' && table === 'notifications') {
        const ownId = String(req.user.student_id_number || '');
        filters.student_id = ownId;
        filters.student_profile_id = req.user.id;
      }
      query = applyFilters(query, filters);
      ({ data, error } = await query.select('*'));
    } else {
      return res.status(405).json({ message: 'Method not allowed.' });
    }

    if (error) return next(error);
    return res.json(projectFields(data || [], rules.fields));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    return next(error);
  }
});

export default router;

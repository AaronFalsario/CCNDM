const badges = {
  first_step: { name: 'First Step', description: 'Complete your first hour' },
  getting_started: { name: 'Getting Started', description: 'Complete 5 hours' },
  on_fire: { name: 'On Fire', description: 'Complete 10 hours' },
  marathon: { name: 'Marathon', description: 'Complete 20 hours' },
  halfway_hero: { name: 'Halfway Hero', description: 'Reach 50% compliance' },
  compliance_pro: { name: 'Compliance Pro', description: 'Reach 75% compliance' },
  perfect_record: { name: 'Perfect Record', description: 'Reach 100% compliance' },
  zero_pending: { name: 'Zero Pending', description: 'Clear all pending penalties' },
  speed_demon: { name: 'Speed Demon', description: 'Finish a 5+ hr penalty in under 24h' },
  perfect_week: { name: 'Perfect Week', description: 'Log a service session 7 days in a row' },
  comeback_kid: { name: 'Comeback Kid', description: 'Go from 3+ pending to 0 pending' },
  early_bird: { name: 'Early Bird', description: 'Complete every penalty before its deadline' },
  appeal_master: { name: 'Appeal Master', description: 'Win an appeal' },
  century: { name: 'Century', description: 'Complete 100 total hours' },
};

const asDate = (value) => {
  if (!value) return null;
  const text = String(value);
  const date = new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(text) ? text : `${text}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const hours = (value) => Number.parseInt(value, 10) || 0;

export async function unlockEligibleAchievements(supabase, student) {
  const [penaltiesResult, sessionsResult, appealsResult, achievementsResult] = await Promise.all([
    supabase
      .from('penalties')
      .select('status, hours, started_at, created_at, completed_at, updated_at, deadline')
      .eq('student_profile_id', student.id),
    supabase
      .from('service_sessions')
      .select('status, scheduled_date')
      .eq('student_profile_id', student.id),
    supabase
      .from('appeals')
      .select('status, created_at')
      .eq('student_profile_id', student.id),
    supabase
      .from('achievements')
      .select('badge_key, unlocked_at')
      .eq('student_profile_id', student.id),
  ]);
  const failedQuery = [penaltiesResult, sessionsResult, appealsResult, achievementsResult]
    .find((result) => result.error);
  if (failedQuery) throw failedQuery.error;

  const penalties = penaltiesResult.data || [];
  const sessions = sessionsResult.data || [];
  const appeals = appealsResult.data || [];
  const previousAchievements = achievementsResult.data || [];
  const completedStatuses = new Set(['completed', 'resolved']);
  const pendingStatuses = new Set(['pending', 'in-progress', 'active']);
  const completedHours = penalties
    .filter((penalty) => completedStatuses.has(String(penalty.status || '').toLowerCase()))
    .reduce((sum, penalty) => sum + hours(penalty.hours), 0);
  const totalHours = penalties.reduce((sum, penalty) => sum + hours(penalty.hours), 0);
  const pendingCount = penalties
    .filter((penalty) => pendingStatuses.has(String(penalty.status || '').toLowerCase()))
    .length;
  const complianceRate = totalHours ? Math.round((completedHours / totalHours) * 100) : 100;

  const hasSpeedDemon = penalties.some((penalty) => {
    if (!completedStatuses.has(String(penalty.status || '').toLowerCase())) return false;
    const start = asDate(penalty.started_at || penalty.created_at);
    const end = asDate(penalty.completed_at || penalty.updated_at);
    if (!start || !end) return false;
    const elapsedHours = (end - start) / (1000 * 60 * 60);
    return elapsedHours > 0 && elapsedHours < 24 && hours(penalty.hours) >= 5;
  });

  const completedDays = new Set(
    sessions
      .filter((session) => String(session.status || '').toLowerCase() === 'completed')
      .map((session) => asDate(session.scheduled_date)?.toISOString().slice(0, 10))
      .filter(Boolean)
  );
  let hasPerfectWeek = false;
  const sortedDays = [...completedDays].sort();
  let streak = 1;
  for (let index = 1; index < sortedDays.length; index += 1) {
    const previous = new Date(`${sortedDays[index - 1]}T00:00:00Z`);
    const current = new Date(`${sortedDays[index]}T00:00:00Z`);
    streak = (current - previous) / (1000 * 60 * 60 * 24) === 1 ? streak + 1 : 1;
    if (streak >= 7) {
      hasPerfectWeek = true;
      break;
    }
  }

  const hasComebackKid = penalties.length >= 3
    && penalties.some((penalty) => completedStatuses.has(String(penalty.status || '').toLowerCase()))
    && pendingCount === 0;
  const hasEarlyBird = penalties.length > 0 && penalties.every((penalty) => {
    if (!completedStatuses.has(String(penalty.status || '').toLowerCase())) return false;
    const deadline = asDate(penalty.deadline);
    const completedAt = asDate(penalty.completed_at);
    return Boolean(deadline && completedAt && completedAt < deadline);
  });
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - 4);
  const hasAppealMaster = appeals.some((appeal) => {
    const createdAt = asDate(appeal.created_at);
    return ['approved', 'accepted', 'granted'].includes(String(appeal.status || '').toLowerCase())
      && createdAt
      && createdAt >= windowStart;
  });

  const eligible = {
    first_step: completedHours >= 1,
    getting_started: completedHours >= 5,
    on_fire: completedHours >= 10,
    marathon: completedHours >= 20,
    halfway_hero: complianceRate >= 50,
    compliance_pro: complianceRate >= 75,
    perfect_record: complianceRate >= 100 && totalHours > 0,
    zero_pending: pendingCount === 0 && penalties.length > 0,
    speed_demon: hasSpeedDemon,
    perfect_week: hasPerfectWeek,
    comeback_kid: hasComebackKid,
    early_bird: hasEarlyBird,
    appeal_master: hasAppealMaster,
    century: completedHours >= 100,
  };

  return { badges, eligible, previousAchievements, windowStart };
}

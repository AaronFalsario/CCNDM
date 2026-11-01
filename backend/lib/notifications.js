export async function applyStudentReadState(supabase, notifications, studentId) {
  const broadcastIds = notifications
    .filter((notification) => notification.student_id === null || notification.student_id === undefined)
    .map((notification) => notification.id);
  if (!broadcastIds.length) return notifications;

  const { data: reads, error } = await supabase
    .from('notification_reads')
    .select('notification_id, read_at')
    .eq('student_profile_id', studentId)
    .in('notification_id', broadcastIds);
  if (error) throw error;

  const readByNotification = new Map(
    (reads || []).map((read) => [String(read.notification_id), read.read_at])
  );
  return notifications.map((notification) => {
    if (notification.student_id !== null && notification.student_id !== undefined) {
      return notification;
    }

    const readAt = readByNotification.get(String(notification.id));
    return {
      ...notification,
      is_read: Boolean(readAt),
      read_at: readAt || null,
    };
  });
}

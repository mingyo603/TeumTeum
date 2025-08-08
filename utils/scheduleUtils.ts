import { getDB, setDB, TaskDB } from '@/storage/scheduleStorage';

export function removeOldCompletedSchedules(schedules: TaskDB['DailyTasks']) {
  const now = new Date();

  return schedules.filter(schedule => {
    if (!schedule.isCompleted) return true;
    if (!schedule.completedDate) return true;

    const completedAt = new Date(schedule.completedDate);
    if (isNaN(completedAt.getTime())) return true;

    const diffTime = now.getTime() - completedAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays < 30;
  });
}

export async function cleanUpOldSchedules() {
  try {
    const db = await getDB();
    if (!db) return;

    const filteredSchedules = removeOldCompletedSchedules(db.DailyTasks);

    if (filteredSchedules.length !== db.DailyTasks.length) {
      db.DailyTasks = filteredSchedules;
      await setDB(db);
    } else {
    }
  } catch (e) {
    console.error('Failed to clean up old schedules:', e);
  }
}

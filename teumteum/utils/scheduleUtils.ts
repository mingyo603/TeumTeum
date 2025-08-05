import { getDB, setDB, TaskDB } from '@/storage/scheduleStorage';

export function removeOldCompletedSchedules(schedules: TaskDB['dailySchedules']) {
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

    const filteredSchedules = removeOldCompletedSchedules(db.dailySchedules);

    if (filteredSchedules.length !== db.dailySchedules.length) {
      db.dailySchedules = filteredSchedules;
      await setDB(db);
    } else {
    }
  } catch (e) {
    console.error('Failed to clean up old schedules:', e);
  }
}

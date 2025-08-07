import { getDB, setDB, DailySchedule, RecommendedTask, addDailySchedule } from '@/storage/scheduleStorage';

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function isSameDate(date1: Date, date2: string): boolean {
  const d1 = date1.toISOString().split('T')[0];
  return d1 === date2;
}

interface TimeSlot {
  start: number;
  end: number;
}

export async function autoInsertRecommendedTasks(date: string) {
  const db = await getDB();
  if (!db) return;

  // 1. 해당 날짜의 일일 일정만 추출
  const tasksForDay = db.dailySchedules.filter(task => isSameDate(task.date, date));

  // 2. 시간순으로 정렬
  const sortedTasks = tasksForDay.sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // 3. 하루 기준 시간 범위
  const dayStart = 8 * 60;
  const dayEnd = 22 * 60;

  // 4. 비는 시간 구간 계산
  const emptySlots: TimeSlot[] = [];
  let lastEnd = dayStart;

  for (const task of sortedTasks) {
    const taskStart = timeToMinutes(task.startTime);
    if (taskStart > lastEnd) {
      emptySlots.push({ start: lastEnd, end: taskStart });
    }
    lastEnd = Math.max(lastEnd, timeToMinutes(task.endTime));
  }

  if (lastEnd < dayEnd) {
    emptySlots.push({ start: lastEnd, end: dayEnd });
  }

  // 5. 추천 일정 중 완료되지 않은 것만
  const recommended = db.recommendedTasks.filter(task => !task.isCompleted);

  // 6. 비는 구간에 추천 일정 삽입
  for (const slot of emptySlots) {
    const slotDuration = slot.end - slot.start;

    const fit = recommended
      .filter(r => r.duration <= slotDuration)
      .sort((a, b) => b.duration - a.duration)[0];

    if (fit) {
      const startTime = minutesToTime(slot.start);
      const endTime = minutesToTime(slot.start + fit.duration);

      await addDailySchedule(fit.title, new Date(date), startTime, endTime);

      // 추천 목록에서 제거
      const index = recommended.findIndex(t => t.id === fit.id);
      if (index !== -1) {
        recommended.splice(index, 1);
      }
    }
  }

  console.log(`✅ ${date} 자동 추천 일정 배치 완료`);
}

// utils/autoInsertRecommended.ts
import { getDB, setDB, addTask, DailyTask, RecommendedTask } from '@/storage/scheduleStorage'; // 경로는 실제 구조에 맞게 수정

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

interface TimeSlot {
  start: number;
  end: number;
}

export async function autoInsertRecommendedTasks(date: string) {
  const db = await getDB();
  if (!db) return;

  // 1. 해당 날짜의 일정만 추출
  const tasksForDay = db.DailyTasks.filter(task => task.date === date);

  // 2. 시간순으로 정렬
  const sortedTasks = tasksForDay.sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // 3. 하루 기준 시작/끝 설정 (기본값: 08:00 ~ 22:00)
  const dayStart = 8 * 60;
  const dayEnd = 22 * 60;

  // 4. 비는 구간 계산
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

  // 5. 사용 가능한 추천 일정 추출 (완료되지 않은 것만)
  const recommended = db.recommendedTasks.filter(task => !task.isCompleted);

  // 6. 비는 시간마다 추천 일정 중 가장 길게 들어맞는 걸 선택
  for (const slot of emptySlots) {
    const slotDuration = slot.end - slot.start;

    // 추천 일정 중 slot에 맞는 가장 긴 일정
    const fit = recommended
      .filter(r => r.duration <= slotDuration)
      .sort((a, b) => b.duration - a.duration)[0];

    if (fit) {
      // 추천 일정을 DailyTask에 추가
      const startTime = minutesToTime(slot.start);
      const endTime = minutesToTime(slot.start + fit.duration);

      await addTask('일정', fit.title, {
        date,
        startTime,
        endTime,
      });

      // 추천 목록에서 제거
      recommended.splice(recommended.findIndex(t => t.id === fit.id), 1);
    }
  }

  console.log(`✅ ${date} 자동 추천 일정 배치 완료`);
}

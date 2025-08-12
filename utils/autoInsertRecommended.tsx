import { DailyTask, RecommendedTask, getDB } from '@/storage/scheduleStorage'; // 경로 수정 필요

export interface DisplayTask extends Partial<DailyTask>, Partial<RecommendedTask> {
  type: '일정' | '추천';
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  text: string;
  checked: boolean;
  isRecommended: boolean;
  duration?: number;
}

// 시간 문자열을 Date 객체로 변환
function parseTimeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// 시간 차이 (분) 계산
function getTimeGapInMinutes(start: string, end: string): number {
  const startDate = parseTimeToDate(start);
  const endDate = parseTimeToDate(end);
  return (endDate.getTime() - startDate.getTime()) / 60000;
}

// 추천 일정 끼워넣기 함수
export async function generateDisplayTasksForDate(date: string): Promise<DisplayTask[]> {
  const db = await getDB();
  if (!db) return [];

  const dailyTasks = db.DailyTasks
    .filter(task => task.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const recommendedTasks = db.recommendedTasks
  .filter(task => !task.isCompleted)
  .slice() // 복사본을 만들어 원본을 보호
  .reverse(); // 순서를 뒤집음


  const displayList: DisplayTask[] = [];

  for (let i = 0; i < dailyTasks.length; i++) {
    const current = dailyTasks[i];
    displayList.push({
      id: current.id,
      date: current.date,
      text: current.title,
      checked: current.isCompleted,
      timeStart: current.startTime,
      timeEnd: current.endTime,
      type: '일정',
      isRecommended: false,
    });

    const next = dailyTasks[i + 1];
    if (!next) break;

    const gap = getTimeGapInMinutes(current.endTime, next.startTime);

    if (recommendedTasks.length > 0) {
      // 1. gap 이하인 추천 일정 필터링
      const candidates = recommendedTasks.filter(task => task.duration <= gap);

      if (candidates.length > 0) {
        // 2. 최대 duration 찾기
        const maxDuration = Math.max(...candidates.map(t => t.duration));

        // 3. 최대 duration인 일정들만 다시 필터링
        const maxDurationTasks = candidates.filter(t => t.duration === maxDuration);

        // 4. maxDurationTasks 중에서 랜덤 선택
        const randomIndex = Math.floor(Math.random() * maxDurationTasks.length);
        const recommended = maxDurationTasks[randomIndex];

        // 5. 선택된 일정 displayList에 추가
        displayList.push({
          id: recommended.id,
          date: current.date,
          text: recommended.title,
          checked: recommended.isCompleted,
          duration: recommended.duration,
          timeStart: current.endTime,
          timeEnd: next.startTime,
          type: '추천',
          isRecommended: true,
        });
      }
    }

  }
  return displayList;
}

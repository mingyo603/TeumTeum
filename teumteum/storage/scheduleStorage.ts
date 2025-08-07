import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEY = '@teumteum_schedule_db';

// 🔸 인터페이스 정의
export interface LongTermTask {
  id: string;
  title: string;
  dueDate: Date;
  isCompleted: boolean;
}

export interface RecommendedTask {
  id: string;
  title: string;
  duration: number; // in minutes
  isCompleted: boolean;
}

export interface DailySchedule {
  id: string;
  title: string;
  date: Date;
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  isCompleted: boolean;
  completedDate?: Date;      // 일정 완료한 날짜 (optional)
}

export interface TaskDB {
  longTermTasks: LongTermTask[];
  recommendedTasks: RecommendedTask[];
  dailySchedules: DailySchedule[];
}

// 🔸 DB 저장 함수
export async function setDB(db: TaskDB) {
  // Date 객체 → 문자열로 변환 후 저장
  const serialized: any = {
    ...db,
    longTermTasks: db.longTermTasks.map(t => ({
      ...t,
      dueDate: t.dueDate.toISOString(),
    })),
    dailySchedules: db.dailySchedules.map(s => ({
      ...s,
      date: s.date.toISOString(),
      completedDate: s.completedDate ? s.completedDate.toISOString() : undefined,
    })),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
}

// 🔸 DB 불러오기 + 날짜 복원
export async function getDB(): Promise<TaskDB> {
  const dbString = await AsyncStorage.getItem(STORAGE_KEY);
  if (!dbString) {
    return { longTermTasks: [], recommendedTasks: [], dailySchedules: [] };
  }

  const parsed = JSON.parse(dbString);

  // 날짜 문자열 → Date 객체 복원
  parsed.longTermTasks = parsed.longTermTasks.map((t: any) => ({
    ...t,
    dueDate: new Date(t.dueDate),
  }));

  parsed.dailySchedules = parsed.dailySchedules.map((s: any) => ({
    ...s,
    date: new Date(s.date),
    completedDate: s.completedDate ? new Date(s.completedDate) : undefined,
  }));

  return parsed;
}

// 🔸 DB 초기화
export async function initializeDB() {
  const dbString = await AsyncStorage.getItem(STORAGE_KEY);
  if (!dbString) {
    const initialDB: TaskDB = {
      longTermTasks: [],
      recommendedTasks: [],
      dailySchedules: [],
    };
    await setDB(initialDB);
  }
}

// 🔸 장기 일정 추가
export async function addLongTermTask(title: string, dueDate: Date) {
  const db = await getDB();
  const newTask: LongTermTask = {
    id: uuidv4(),
    title,
    dueDate,
    isCompleted: false,
  };
  db.longTermTasks.push(newTask);
  await setDB(db);
  return newTask;
}

// 🔸 추천 일정 추가
export async function addRecommendedTask(title: string, duration: number) {
  const db = await getDB();
  const newTask: RecommendedTask = {
    id: uuidv4(),
    title,
    duration,
    isCompleted: false,
  };
  db.recommendedTasks.push(newTask);
  await setDB(db);
  return newTask;
}

// 🔸 일일 일정 추가
export async function addDailySchedule(title: string, date: Date, startTime: string, endTime: string) {
  const db = await getDB();
  const newSchedule: DailySchedule = {
    id: uuidv4(),
    title,
    date,
    startTime,
    endTime,
    isCompleted: false,
    completedDate: undefined,
  };
  db.dailySchedules.push(newSchedule);
  await setDB(db);
  return newSchedule;
}

// 🔸 일정 완료 상태 토글 + 저장
export async function toggleDailyScheduleComplete(scheduleId: string) {
  const db = await getDB();
  const schedule = db.dailySchedules.find(s => s.id === scheduleId);
  if (schedule) {
    schedule.isCompleted = !schedule.isCompleted;
    schedule.completedDate = schedule.isCompleted ? new Date() : undefined;
    await setDB(db);
  }
}

// 🔸 DB 완전 초기화 (개발용)
export async function resetDB() {
  const emptyDB: TaskDB = {
    longTermTasks: [],
    recommendedTasks: [],
    dailySchedules: [],
  };
  await setDB(emptyDB);
  console.log('✅ DB 초기화 완료');
}

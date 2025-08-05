import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEY = '@teumteum_schedule_db';

export interface LongTermTask {
  id: string;
  title: string;
  dueDate: Date;
  isCompleted: boolean;
}

export interface RecommendedTask {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
}

export interface DailySchedule {
  id: string;
  title: string;
  date: Date;
  startTime: string;         // HH:mm
  endTime: string;         // HH:mm
  isCompleted: boolean;
  completedDate?: Date; // ISO 문자열로 완료 날짜 저장, 완료 시점에 기록
}

export interface TaskDB {
  longTermTasks: LongTermTask[];
  recommendedTasks: RecommendedTask[];
  dailySchedules: DailySchedule[];
}

// DB 초기화
export async function initializeDB() {
  const dbString = await AsyncStorage.getItem(STORAGE_KEY);
  if (!dbString) {
    const initialDB: TaskDB = {
      longTermTasks: [],
      recommendedTasks: [],
      dailySchedules: [],
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
  }
}

// DB 읽기
export async function getDB(): Promise<TaskDB | null> {
  const dbString = await AsyncStorage.getItem(STORAGE_KEY);
  if (!dbString) return null;
  return JSON.parse(dbString);
}

// DB 저장
export async function setDB(db: TaskDB) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// 장기 일정 추가 함수
export async function addLongTermTask(title: string, dueDate: Date) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], dailySchedules: [] };
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

// 추천 일정 추가 함수
export async function addRecommendedTask(title: string, duration: number) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], dailySchedules: [] };
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

// 일일 일정 추가 함수
export async function addDailySchedule(title: string, date: Date, startTime: string, endTime: string) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], dailySchedules: [] };
  const completedDate = new Date("2025-06-02");
  const newSchedule: DailySchedule = {
    id: uuidv4(),
    title,
    date,
    startTime,
    endTime,
    isCompleted: false,
    completedDate: undefined, // 완료 날짜는 아직 없으니 undefined로 설정
  };
  db.dailySchedules.push(newSchedule);
  await setDB(db);
  return newSchedule;
}

export async function resetDB() {
  const initialDB: TaskDB = {
    longTermTasks: [],
    recommendedTasks: [],
    dailySchedules: [],
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
  console.log('⚡ DB 완전 초기화 완료');
}

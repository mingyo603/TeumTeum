import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEY = '@teumteum_schedule_db';

type TaskType = '장기' | '추천' | '일정';
export interface LongTermTask {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface RecommendedTask {
  id: string;
  title: string;
  duration: number; // in minutes
  isCompleted: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  date: string;
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  isCompleted: boolean;
  completedDate?: string; // ISO 문자열로 완료 날짜 저장, 완료 시점에 기록
}

export interface TaskDB {
  longTermTasks: LongTermTask[];
  recommendedTasks: RecommendedTask[];
  DailyTasks: DailyTask[];
}

// DB 만들기
export async function initializeDB() {
  const dbString = await AsyncStorage.getItem(STORAGE_KEY);
  if (!dbString) {
    const initialDB: TaskDB = {
      longTermTasks: [],
      recommendedTasks: [],
      DailyTasks: [],
    };
    await setDB(initialDB);
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

// DB 초기화
export async function resetDB() {
  const emptyDB: TaskDB = {
    longTermTasks: [],
    recommendedTasks: [],
    DailyTasks: [],
  };
  await setDB(emptyDB);
  console.log('✅ DB 초기화 완료');
}

// 일정 추가
export async function addTask(
  type: TaskType,
  title: string, 
  params: {
    dueDate?: string;
    duration?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
  }
) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], DailyTasks: [] };
  const { dueDate, duration, date, startTime, endTime } = params;

  switch (type) {
    case '장기': {
      if (!dueDate) throw new Error('장기 일정에는 dueDate가 필요합니다.');
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

    case '추천': {
      if (duration === undefined) throw new Error('추천 일정에는 duration이 필요합니다.');
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

    case '일정': {
      if (!date || !startTime || !endTime) throw new Error('일일 일정에는 date, startTime, endTime이 필요합니다.');
      const newSchedule: DailyTask = {
        id: uuidv4(),
        title,
        date,
        startTime,
        endTime,
        isCompleted: false,
        completedDate: undefined,
      };
      db.DailyTasks.push(newSchedule);
      await setDB(db);
      return newSchedule;
    }

    default:
      throw new Error(`알 수 없는 일정 타입입니다: ${type}`);
  }
}

// 일정 변경
export async function updateTask(
  id: string,
  oldType: TaskType,
  newType: TaskType,
  title: string, 
  params: {
    dueDate?: string;
    duration?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
  }
) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], DailyTasks: [] };

  if (oldType === newType) {
    switch (newType) {
      case '장기': {
        db.longTermTasks = db.longTermTasks.map(task =>
          task.id === id ? { ...task, ...params } : task
        );
        break;
      }
      case '추천': {
        db.recommendedTasks = db.recommendedTasks.map(task =>
          task.id === id ? { ...task, ...params } : task
        );
        break;
      }
      case '일정': {
        db.DailyTasks = db.DailyTasks.map(task =>
          task.id === id ? { ...task, ...params } : task
        );
        break;
      }
      default:
        throw new Error(`알 수 없는 타입입니다: ${newType}`);
    }

    await setDB(db);
  } else {
    await deleteTask(oldType, id);
    await addTask(newType, title, params);
  }
}

// 완료 상태 토글
export async function toggleCompleted(type: TaskType, id: string) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], DailyTasks: [] };
  if (type === '장기') {
    db.longTermTasks = db.longTermTasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    await setDB(db);
    return db.longTermTasks.find(task => task.id === id);
  }
  else if (type === '추천') {
    db.recommendedTasks = db.recommendedTasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    await setDB(db);
    return db.recommendedTasks.find(task => task.id === id);
  }
  else {
    db.DailyTasks = db.DailyTasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    await setDB(db);
    return db.DailyTasks.find(task => task.id === id);
  }
}

// 일정 삭제
export async function deleteTask(type: TaskType, id: string) {
  const db = (await getDB()) || { longTermTasks: [], recommendedTasks: [], DailyTasks: [] };

  switch (type) {
    case '장기':
      db.longTermTasks = db.longTermTasks.filter(task => task.id !== id);
      break;
    case '추천':
      db.recommendedTasks = db.recommendedTasks.filter(task => task.id !== id);
      break;
    case '일정':
      db.DailyTasks = db.DailyTasks.filter(schedule => schedule.id !== id);
      break;
    default:
      throw new Error(`Unknown task type: ${type}`);
  }

  await setDB(db);
  const newDB = await getDB();
}

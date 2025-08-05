export const STORAGE_KEY = '@teumteum_schedule_db';

export interface LongTermTask {
  id: string;
  title: string;
  dueDate: Date;      // ISO 문자열
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
  date: Date;         // YYYY-MM-DD
  startTime: string;         // HH:mm
  endTime: string;         // HH:mm
  isCompleted: boolean;
}

export interface TaskDB {
  longTermTasks: LongTermTask[];
  recommendedTasks: RecommendedTask[];
  dailySchedules: DailySchedule[];
}

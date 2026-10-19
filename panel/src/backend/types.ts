import type { Timestamp } from 'firebase/firestore';

// Shapes of the documents shared with the client app (mirrors app/src/backend/types.ts; keep the two in step).

export type Survey = { goal: string; days: string[]; exp: string; age: string; height: string; weight: string; limits: string };

export type ClientDoc = {
  name: string;
  email: string;
  createdAt: Timestamp;
  consentAt: Timestamp;
  survey: Survey;
  startWeight: number;
  hasPlan?: boolean;
  lastWeight?: number;
  lastReportAt?: Timestamp;
  lastReportReviewed?: boolean;
  lastMsgAt?: Timestamp;
  lastMsgText?: string;
  lastMsgFrom?: 'client' | 'trainer';
  trainerReadAt?: Timestamp;
  clientReadAt?: Timestamp;
};

export type WorkoutKey = 'A' | 'B' | 'C' | 'K';
export type PlanRow = { name: string; sets: string; reps: string; load: string; note: string };
export type PlanDay = { title: string; weekday: string; rows: PlanRow[] };
export type TrainingPlan = { days: Record<WorkoutKey, PlanDay>; updatedAt?: Timestamp };

export type DietDay = 'A' | 'B' | 'C';
export type Meal = { time: string; label: string; name: string; kcal: string; p: string; f: string; c: string; ing: string };
export type DietPlan = { p: string; f: string; c: string; note: string; days: Record<DietDay, Meal[]>; updatedAt?: Timestamp };

export type PhotoView = 'Przód' | 'Bok' | 'Tył';
export type ScaleKey = 'mood' | 'sleep' | 'stress';

export type Report = {
  id: string;
  week: number;
  createdAt: Timestamp;
  weight: number;
  circ: Record<string, number>;
  scales: Partial<Record<ScaleKey, number>>;
  diet: number;
  q: string;
  photos: Partial<Record<PhotoView, string>>; // photo document ids
  workouts: number;
  feedback?: string;
  reviewedAt?: Timestamp;
};

export type WorkoutSet = { kg: string; reps: string };
export type Workout = {
  id: string;
  key: WorkoutKey;
  title: string;
  createdAt: Timestamp;
  seconds: number;
  volume: number;
  exercises: { name: string; sets: WorkoutSet[] }[];
};

export type Message = { id: string; from: 'client' | 'trainer'; text: string; createdAt: Timestamp | null };

export const CIRC = [
  { k: 'talia', label: 'Talia' },
  { k: 'biodra', label: 'Biodra' },
  { k: 'klatka', label: 'Klatka' },
  { k: 'ramie', label: 'Ramię' },
  { k: 'udo', label: 'Udo' },
];

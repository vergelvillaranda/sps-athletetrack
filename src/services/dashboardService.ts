import { getTrainingLogs, getGoals, getAssessmentRecords, getRecordedTestKeys } from "../db/database";
import { ASSESSMENT_TESTS } from "../constants/assessmentTests";

export interface DashboardStats {
  totalSessions: number;
  totalMinutes: number;
  sessionsThisWeek: number;
  minutesThisWeek: number;
  dayStreak: number;
  goalsCompleted: number;
  activeGoals: number;
}

export interface WeeklyVolumePoint {
  label: string; // M T W T F S S
  value: number; // minutes
}

export interface RecentLog {
  id: number;
  activity: string;
  date: string;
  durationMinutes: number;
  intensity: string;
}

export interface TrendPoint {
  value: number;
  label: string;
}

export interface TrendOption {
  key: string;
  name: string;
  unit?: string;
}

export interface FitnessProgressSummary {
  testKey: string;
  testName: string;
  previousValue: number | null;
  latestValue: number | null;
  change: number | null;
  unit?: string;
  assessmentDate: string | null;
  improved: boolean | null;
}

export interface GoalProgressItem {
  id: number;
  goal: string;
  target: string;
  status: string;
  progress: number;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Monday-based week start, matching the DAY_LABELS order
function getWeekStart(reference: Date = new Date()): Date {
  const d = new Date(reference);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Consecutive-day training streak, counted backward from today.
 * If nothing was logged today, we still count backward from yesterday —
 * a missed "today" (which may just not be over yet) shouldn't zero out
 * a real streak the student is still mid-way through.
 */
function computeDayStreak(trainingDates: string[]): number {
  const uniqueDates = new Set(trainingDates);
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!uniqueDates.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (uniqueDates.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [logs, goals] = await Promise.all([getTrainingLogs(), getGoals()]);
  const typedLogs = logs as any[];
  const typedGoals = goals as any[];

  const weekStartISO = toISODate(getWeekStart());
  const logsThisWeek = typedLogs.filter((l) => l.date >= weekStartISO);

  return {
    totalSessions: typedLogs.length,
    totalMinutes: typedLogs.reduce((sum, log) => sum + (log.duration_minutes ?? 0), 0),
    sessionsThisWeek: logsThisWeek.length,
    minutesThisWeek: logsThisWeek.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0),
    dayStreak: computeDayStreak(typedLogs.map((l) => l.date)),
    goalsCompleted: typedGoals.filter((g) => g.status === "completed").length,
    activeGoals: typedGoals.filter((g) => g.status === "active").length,
  };
}

export async function getGoalProgress(limit?: number): Promise<GoalProgressItem[]> {
  const goals = (await getGoals()) as any[];
  const sortedGoals = [...goals]
    .sort((a, b) => {
      if (a.status === b.status) return b.id - a.id;
      return a.status === "active" ? -1 : 1;
    });
  const visibleGoals = typeof limit === "number" ? sortedGoals.slice(0, limit) : sortedGoals;

  return visibleGoals
    .map((goal) => ({
      id: goal.id,
      goal: goal.category || goal.goal_type || "Training Goal",
      target: goal.target || "—",
      status: goal.status === "completed" ? "Completed" : "In Progress",
      progress: Math.max(0, Math.min(100, Number(goal.progress) || (goal.status === "completed" ? 100 : 0))),
    }));
}

export async function getWeeklyTrainingVolume(): Promise<WeeklyVolumePoint[]> {
  const logs = (await getTrainingLogs()) as any[];
  const weekStart = getWeekStart();

  const minutesByDay = new Array(7).fill(0);
  for (const log of logs) {
    const logDate = new Date(log.date);
    const diffDays = Math.floor((logDate.getTime() - weekStart.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      minutesByDay[diffDays] += log.duration_minutes ?? 0;
    }
  }

  return DAY_LABELS.map((label, i) => ({ label, value: minutesByDay[i] }));
}

export async function getRecentTrainingLogs(limit = 3): Promise<RecentLog[]> {
  const logs = (await getTrainingLogs()) as any[];
  return logs.slice(0, limit).map((l) => ({
    id: l.id,
    activity: l.activity,
    date: l.date,
    durationMinutes: l.duration_minutes,
    intensity: l.intensity,
  }));
}

export async function getAvailableTrendTests(): Promise<TrendOption[]> {
  const recordedKeys = await getRecordedTestKeys();
  return ASSESSMENT_TESTS.filter((t) => recordedKeys.includes(t.key)).map((t) => ({
    key: t.key,
    name: t.testName ? `${t.name} — ${t.testName}` : t.name,
    unit: t.primaryUnit,
  }));
}

export async function getTestTrend(testKey: string, limit = 6): Promise<TrendPoint[]> {
  const test = ASSESSMENT_TESTS.find((t) => t.key === testKey);
  if (!test) return [];

  const records = await getAssessmentRecords(testKey); // DESC order (newest first)
  const chronological = [...records].reverse().slice(-limit);

  return chronological.map((r) => {
    const raw = parseFloat(r.data[test.primaryField]);
    const d = new Date(r.test_date);
    const label = isNaN(d.getTime()) ? r.test_date : d.toLocaleDateString("en-US", { month: "short" });
    return { value: isNaN(raw) ? 0 : raw, label };
  });
}

export async function getFitnessProgress(testKey: string): Promise<FitnessProgressSummary | null> {
  const test = ASSESSMENT_TESTS.find((item) => item.key === testKey);
  if (!test) return null;

  const records = await getAssessmentRecords(testKey);
  if (records.length === 0) return null;

  const newestPreTest = records.find((record) => (record.assessment_phase ?? "pre-test") === "pre-test");
  const matchingPostTest = records.find(
    (record) => record.assessment_phase === "post-test" && (!newestPreTest || record.test_date >= newestPreTest.test_date)
  );
  const latestRecord = matchingPostTest ?? records[0];
  const previousRecord = matchingPostTest && newestPreTest ? newestPreTest : records[1];
  const latestValue = Number(latestRecord.data[test.primaryField]);
  const previousValue = previousRecord ? Number(previousRecord.data[test.primaryField]) : null;
  const hasLatest = Number.isFinite(latestValue);
  const hasPrevious = previousValue !== null && Number.isFinite(previousValue);
  const change = hasLatest && hasPrevious ? latestValue - previousValue : null;
  const improved = change === null || change === 0 || test.key === "bmi"
    ? null
    : test.lowerIsBetter
      ? change < 0
      : change > 0;

  return {
    testKey,
    testName: test.testName ?? test.name,
    previousValue: hasPrevious ? previousValue : null,
    latestValue: hasLatest ? latestValue : null,
    change,
    unit: test.primaryUnit,
    assessmentDate: latestRecord.test_date,
    improved,
  };
}

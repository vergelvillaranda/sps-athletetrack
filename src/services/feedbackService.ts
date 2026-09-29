import { getAssessmentRecords, getGoals, getRecordedTestKeys, getTrainingLogs } from "../db/database";
import { getDashboardStats } from "./dashboardService";

export type PerformanceFeedbackType = "Improvement" | "Consistency" | "Milestone" | "Reminder";

export interface PerformanceFeedbackItem {
  id: string;
  emoji: string;
  bg: string;
  type: PerformanceFeedbackType;
  message: string;
  timestamp: string;
  unread: boolean;
  occurredAt: number;
}

type DatedRecord = {
  id: number;
  date?: string;
  test_date?: string;
  created_at?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function toTimestamp(value?: string): number {
  if (!value) return Date.now();
  const normalized = value.includes(" ") ? `${value.replace(" ", "T")}Z` : value;
  const timestamp = new Date(normalized).getTime();
  return Number.isNaN(timestamp) ? Date.now() : timestamp;
}

function recordTimestamp(record: DatedRecord): number {
  return toTimestamp(record.created_at ?? record.date ?? record.test_date);
}

function formatRelativeTime(timestamp: number): string {
  const elapsed = Math.max(0, Date.now() - timestamp);
  const days = Math.floor(elapsed / DAY_MS);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: new Date(timestamp).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function createItem(
  id: string,
  emoji: string,
  bg: string,
  type: PerformanceFeedbackType,
  message: string,
  occurredAt: number
): PerformanceFeedbackItem {
  return {
    id,
    emoji,
    bg,
    type,
    message,
    timestamp: formatRelativeTime(occurredAt),
    unread: Date.now() - occurredAt <= 2 * DAY_MS,
    occurredAt,
  };
}

export async function getPerformanceFeedback(): Promise<PerformanceFeedbackItem[]> {
  const [logsResult, goalsResult, testKeys, stats] = await Promise.all([
    getTrainingLogs(),
    getGoals(),
    getRecordedTestKeys(),
    getDashboardStats(),
  ]);
  const assessmentGroups = await Promise.all(testKeys.map((key) => getAssessmentRecords(key)));
  const logs = [...(logsResult as DatedRecord[])].sort((a, b) => recordTimestamp(a) - recordTimestamp(b));
  const completedGoals = [...(goalsResult as Array<DatedRecord & { status: string; category?: string }>)]
    .filter((goal) => goal.status === "completed")
    .sort((a, b) => a.id - b.id);
  const assessments = assessmentGroups
    .flat()
    .sort((a, b) => recordTimestamp(a) - recordTimestamp(b));
  const feedback: PerformanceFeedbackItem[] = [];

  const addCountMilestone = (
    records: DatedRecord[],
    count: number,
    id: string,
    emoji: string,
    bg: string,
    message: string
  ) => {
    if (records.length >= count) {
      feedback.push(createItem(id, emoji, bg, "Milestone", message, recordTimestamp(records[count - 1])));
    }
  };

  addCountMilestone(logs, 1, "training-1", "🏃", "#DBEAFE", "First training log added — a strong first step toward consistent progress!");
  addCountMilestone(logs, 5, "training-5", "🔥", "#FFEDD5", "Five training logs completed. Your routine is taking shape!");
  addCountMilestone(logs, 10, "training-10", "💪", "#DCFCE7", "Ten training logs completed — keep building that momentum!");
  addCountMilestone(logs, 25, "training-25", "⭐", "#FEF3C7", "Twenty-five training logs completed. That is outstanding commitment!");

  addCountMilestone(completedGoals, 1, "goal-1", "🏆", "#FEF3C7", "First goal completed — celebrate the work that got you here!");
  addCountMilestone(completedGoals, 5, "goal-5", "🎯", "#DCFCE7", "Five goals completed. You are turning your plans into results!");
  addCountMilestone(completedGoals, 10, "goal-10", "🥇", "#FEF3C7", "Ten goals completed — an impressive achievement!");

  addCountMilestone(assessments, 1, "assessment-1", "📊", "#F3E8FF", "First fitness assessment recorded. You now have a baseline to improve on!");
  addCountMilestone(assessments, 5, "assessment-5", "📈", "#DCFCE7", "Five fitness assessment results recorded — your progress is becoming clearer!");
  addCountMilestone(assessments, 10, "assessment-10", "✅", "#DBEAFE", "Ten fitness assessment results recorded. Great job tracking your development!");

  const latestLogTime = logs.length > 0 ? recordTimestamp(logs[logs.length - 1]) : Date.now();
  if (stats.totalMinutes >= 60) {
    feedback.push(createItem("minutes-60", "⏱️", "#DBEAFE", "Consistency", "You have logged your first full hour of training. Every minute counts!", latestLogTime));
  }
  if (stats.totalMinutes >= 300) {
    feedback.push(createItem("minutes-300", "🚀", "#F3E8FF", "Milestone", "Five total hours of training logged — excellent dedication!", latestLogTime));
  }
  if (stats.dayStreak >= 3) {
    feedback.push(createItem("streak-current", "🔥", "#FFEDD5", "Consistency", `You are on a ${stats.dayStreak}-day training streak. Keep it going!`, latestLogTime));
  }

  return feedback.sort((a, b) => b.occurredAt - a.occurredAt);
}

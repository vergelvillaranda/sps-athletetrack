import React, { useState, useCallback } from "react";
import { Modal, Pressable, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import SkeletonContent from "../components/Skeleton";
import Card from "../components/Card";
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import { COLORS, RADIUS, INTENSITY_COLORS, SPORT_EMOJI } from "../constants/theme";
import { ASSESSMENT_TESTS } from "../constants/assessmentTests";
import { getStudent } from "../db/database";
import { parseISODate } from "../utils/date";
import { CONTENT_MAX_WIDTH } from "../constants/layout";
import {
  getDashboardStats,
  getWeeklyTrainingVolume,
  getRecentTrainingLogs,
  getAvailableTrendTests,
  getTestTrend,
  getFitnessProgress,
  getGoalProgress,
  DashboardStats,
  WeeklyVolumePoint,
  RecentLog,
  TrendOption,
  TrendPoint,
  FitnessProgressSummary,
  GoalProgressItem,
} from "../services/dashboardService";

function formatTrainingTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
  return `${hours} hr ${minutes} min`;
}

function formatFitnessValue(value: number | null, unit?: string) {
  if (value === null) return "—";
  const formatted = unit === "sec" ? value.toFixed(2) : Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${formatted}${unit ? ` ${unit}` : ""}`;
}

function formatDashboardDate(isoDate: string | null) {
  if (!isoDate) return "—";
  const date = parseISODate(isoDate);
  return date ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : isoDate;
}

function GoalProgressEntry({ goal, showDivider = false }: { goal: GoalProgressItem; showDivider?: boolean }) {
  return (
    <View style={{ paddingTop: showDivider ? 14 : 0, borderTopWidth: showDivider ? 1 : 0, borderTopColor: COLORS.slate100 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, textTransform: "uppercase" }}>Goal</Text>
          <Text style={{ fontSize: 14, color: COLORS.navy, fontFamily: "BricolageGrotesque_700Bold", marginTop: 2 }}>{goal.goal}</Text>
        </View>
        <View style={{ borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start", backgroundColor: goal.status === "Completed" ? COLORS.green100 : COLORS.orange50 }}>
          <Text style={{ fontSize: 9, color: goal.status === "Completed" ? COLORS.green700 : COLORS.orange, fontFamily: "BricolageGrotesque_700Bold" }}>{goal.status}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate500, marginTop: 6 }}><Text style={{ fontFamily: "BricolageGrotesque_700Bold" }}>Target:</Text> {goal.target}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 9, marginBottom: 5 }}>
        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400 }}>Progress</Text>
        <Text style={{ fontSize: 10, color: COLORS.navy, fontFamily: "BricolageGrotesque_700Bold" }}>{goal.progress}%</Text>
      </View>
      <ProgressBar value={goal.progress} height={8} color={goal.status === "Completed" ? COLORS.green500 : COLORS.orange} />
    </View>
  );
}

function buildFeedbackMessage(stats: DashboardStats): string {
  // Simple, rule-based, supportive — per the PDF's Feature 6 spec (not an AI model).
  if (stats.sessionsThisWeek === 0) {
    return "No sessions logged yet this week — even a short session keeps your streak alive. You've got this!";
  }
  if (stats.dayStreak >= 3) {
    return `You're on a ${stats.dayStreak}-day streak! Consistency like this is exactly how progress compounds.`;
  }
  if (stats.sessionsThisWeek >= 3) {
    return `Great work — ${stats.sessionsThisWeek} sessions logged this week. Keep the momentum going!`;
  }
  return "You're making progress. Try to log at least one more session this week to build momentum.";
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("Athlete");
  const [sport, setSport] = useState("Basketball");
  const [section, setSection] = useState("");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyBars, setWeeklyBars] = useState<WeeklyVolumePoint[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [trendOptions, setTrendOptions] = useState<TrendOption[]>([]);
  const [activeTrendKey, setActiveTrendKey] = useState<string | null>(null);
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([]);
  const [fitnessProgress, setFitnessProgress] = useState<FitnessProgressSummary | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgressItem[]>([]);
  const [showAllGoals, setShowAllGoals] = useState(false);

  const loadDashboard = useCallback(async () => {
    const student = await getStudent();
    if (student) {
      setFirstName(student.first_name);
      setSport(student.sport);
      setSection(`Grade ${student.grade_level} - ${student.section}`);
    }

    const [statsResult, weekly, recent, trends, goals] = await Promise.all([
      getDashboardStats(),
      getWeeklyTrainingVolume(),
      getRecentTrainingLogs(3),
      getAvailableTrendTests(),
      getGoalProgress(),
    ]);

    setStats(statsResult);
    setWeeklyBars(weekly);
    setRecentLogs(recent);
    setTrendOptions(trends);
    setGoalProgress(goals);

    const defaultKey = trends[0]?.key ?? null;
    setActiveTrendKey(defaultKey);
    if (defaultKey) {
      const [points, progress] = await Promise.all([getTestTrend(defaultKey), getFitnessProgress(defaultKey)]);
      setTrendPoints(points);
      setFitnessProgress(progress);
    } else {
      setTrendPoints([]);
      setFitnessProgress(null);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleSelectTrend = async (key: string) => {
    setActiveTrendKey(key);
    const [points, progress] = await Promise.all([getTestTrend(key), getFitnessProgress(key)]);
    setTrendPoints(points);
    setFitnessProgress(progress);
  };

  if (loading || !stats) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="dashboard" />
        <SkeletonContent variant="dashboard" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="dashboard" />

      <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
        <View style={{ backgroundColor: COLORS.navy800, borderRadius: RADIUS.card, padding: 16, overflow: "hidden" }}>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "BricolageGrotesque_600SemiBold", textTransform: "uppercase", letterSpacing: 1 }}>
            Welcome back
          </Text>
          <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", marginTop: 2 }}>
            {firstName} {stats.dayStreak > 0 ? "🔥" : ""}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2, fontFamily: "BricolageGrotesque_500Medium" }}>
            {sport} · {section}
          </Text>

          {stats.dayStreak > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 24 }}>🔥</Text>
              <View>
                <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: "BricolageGrotesque_700Bold" }}>
                  {stats.dayStreak}-Day Training Streak
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "BricolageGrotesque_500Medium" }}>
                  Keep it going!
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "BricolageGrotesque_500Medium" }}>
                Log a session today to start your streak.
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={{ marginTop: -32, zIndex: 1 }}
        contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, gap: 16, paddingBottom: 24 }}
      >
        <Card>
          <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800 }}>
            Activity Progress
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.orange, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase", marginTop: 2, marginBottom: 12 }}>
            {sport} Training
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { emoji: "🏃", value: stats.totalSessions, label: "Training Sessions", onPress: () => navigation.navigate("Training") },
              { emoji: "⏱️", value: formatTrainingTime(stats.totalMinutes), label: "Total Training Time", onPress: () => navigation.navigate("Training") },
              { emoji: "✅", value: `${trendOptions.length}/${ASSESSMENT_TESTS.length}`, label: "Activities Completed", onPress: () => navigation.navigate("Assessment") },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                activeOpacity={0.72}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.value}`}
                style={{ flex: 1, minHeight: 104, borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.slate100, backgroundColor: COLORS.surface, paddingHorizontal: 6, paddingVertical: 10, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 20, marginBottom: 4 }}>{item.emoji}</Text>
                <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 18, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>
                  {item.value}
                </Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 9, lineHeight: 12, color: COLORS.slate400, textAlign: "center", marginTop: 3 }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.slate700, fontFamily: "BricolageGrotesque_700Bold" }}>Weekly Activity Record</Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400 }}>Training minutes per day</Text>
              </View>
              <Text style={{ fontSize: 10, color: COLORS.orange, fontFamily: "BricolageGrotesque_700Bold" }}>
                {stats.sessionsThisWeek} {stats.sessionsThisWeek === 1 ? "session" : "sessions"} · {stats.minutesThisWeek} min
              </Text>
            </View>
            {stats.sessionsThisWeek === 0 ? (
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, paddingVertical: 18, textAlign: "center" }}>No activity recorded this week.</Text>
            ) : (
              <BarChart bars={weeklyBars} />
            )}
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800 }}>
            Fitness Progress
          </Text>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400, marginTop: 2, marginBottom: 12 }}>Your results over time</Text>

          {trendOptions.length === 0 ? (
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, paddingVertical: 20, textAlign: "center" }}>
              Record a fitness assessment to see previous and latest results here.
            </Text>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
                {trendOptions.map((option) => {
                  const active = activeTrendKey === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      onPress={() => handleSelectTrend(option.key)}
                      activeOpacity={0.78}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{
                        minHeight: 42,
                        borderRadius: RADIUS.full,
                        paddingHorizontal: 17,
                        paddingVertical: 10,
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: active ? COLORS.navy : COLORS.slate200,
                        backgroundColor: active ? COLORS.navy : COLORS.white,
                        shadowColor: active ? COLORS.navy : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: active ? 0.2 : 0,
                        shadowRadius: 4,
                        elevation: active ? 3 : 0,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: active ? COLORS.white : COLORS.slate600 }}>{option.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {fitnessProgress ? (
                <View style={{ gap: 10 }}>
                  <Text style={{ fontSize: 15, color: COLORS.navy, fontFamily: "BricolageGrotesque_800ExtraBold" }}>{fitnessProgress.testName}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {[
                      { label: "Previous", value: formatFitnessValue(fitnessProgress.previousValue, fitnessProgress.unit), color: COLORS.slate700 },
                      { label: "Latest", value: formatFitnessValue(fitnessProgress.latestValue, fitnessProgress.unit), color: COLORS.navy },
                      { label: "Change", value: fitnessProgress.change === null ? "—" : formatFitnessValue(Math.abs(fitnessProgress.change), fitnessProgress.unit), color: fitnessProgress.improved === true ? COLORS.green700 : fitnessProgress.improved === false ? COLORS.red500 : COLORS.orange },
                    ].map((result) => (
                      <View key={result.label} style={{ flex: 1, minWidth: 0, backgroundColor: COLORS.surface, borderRadius: RADIUS.input, padding: 9 }}>
                        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 9, color: COLORS.slate400, textTransform: "uppercase" }}>{result.label}</Text>
                        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={{ fontSize: 14, color: result.color, fontFamily: "BricolageGrotesque_800ExtraBold", marginTop: 3 }}>{result.value}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 1, fontSize: 10, color: COLORS.slate500 }}>Assessment Date: {formatDashboardDate(fitnessProgress.assessmentDate)}</Text>
                    {fitnessProgress.improved !== null ? (
                      <Text style={{ fontSize: 10, color: fitnessProgress.improved ? COLORS.green700 : COLORS.red500, fontFamily: "BricolageGrotesque_700Bold" }}>
                        {fitnessProgress.improved ? "Improved" : "Needs attention"}
                      </Text>
                    ) : null}
                  </View>
                  {trendPoints.length >= 2 ? <LineChart points={trendPoints} /> : (
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400, paddingVertical: 12, textAlign: "center" }}>Add another result to build a progress line.</Text>
                  )}
                </View>
              ) : null}

              <TouchableOpacity onPress={() => navigation.navigate("Assessment")} style={{ marginTop: 8, alignSelf: "flex-end" }}>
                <Text style={{ fontSize: 11, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.orange }}>View Assessments →</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800 }}>Goal Progress</Text>
            <TouchableOpacity onPress={() => setShowAllGoals(true)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="View all goals">
              <Text style={{ color: COLORS.orange, fontSize: 11, fontFamily: "BricolageGrotesque_700Bold" }}>View Goals →</Text>
            </TouchableOpacity>
          </View>

          {goalProgress.length === 0 ? (
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, paddingVertical: 18, textAlign: "center" }}>No goals created yet.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {goalProgress.slice(0, 3).map((goal, index) => (
                <GoalProgressEntry key={goal.id} goal={goal} showDivider={index > 0} />
              ))}
              {goalProgress.length > 3 ? (
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, textAlign: "center" }}>
                  +{goalProgress.length - 3} more {goalProgress.length - 3 === 1 ? "goal" : "goals"} available in View Goals
                </Text>
              ) : null}
            </View>
          )}
        </Card>

        <View style={{ borderRadius: RADIUS.card, padding: 16, backgroundColor: COLORS.orange }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 18 }}>📊</Text>
            </View>
            <Text style={{ color: COLORS.white, fontSize: 12, fontFamily: "BricolageGrotesque_600SemiBold", textTransform: "uppercase", letterSpacing: 0.6 }}>
              Feedback
            </Text>
          </View>
          <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: "BricolageGrotesque_500Medium", lineHeight: 19 }}>
            {buildFeedbackMessage(stats)}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Feedback")}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "BricolageGrotesque_600SemiBold", marginTop: 8, textDecorationLine: "underline" }}>
              View all feedback →
            </Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800, marginBottom: 4 }}>
            Recent Training
          </Text>
          {recentLogs.length === 0 ? (
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, paddingVertical: 16, textAlign: "center" }}>
              No sessions logged yet. Head to Training to add your first one.
            </Text>
          ) : (
            recentLogs.map((log, i) => {
              const intensity = INTENSITY_COLORS[log.intensity] ?? { bg: COLORS.slate100, text: COLORS.slate500 };
              return (
                <View
                  key={log.id}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: COLORS.slate50 }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: RADIUS.input, backgroundColor: COLORS.orange50, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 14 }}>{SPORT_EMOJI[sport] ?? "🏅"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate700 }}>{log.activity}</Text>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400 }}>{log.date} · {log.durationMinutes} min</Text>
                  </View>
                  <Badge label={log.intensity} bg={intensity.bg} color={intensity.text} />
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>

      <Modal visible={showAllGoals} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setShowAllGoals(false)}>
        <Pressable
          onPress={() => setShowAllGoals(false)}
          accessibilityRole="button"
          accessibilityLabel="Close all goals"
          style={{ flex: 1, backgroundColor: "rgba(11,34,100,0.50)", justifyContent: "center", paddingHorizontal: 18, paddingVertical: 44 }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: 580, maxHeight: "82%", alignSelf: "center", backgroundColor: COLORS.white, borderRadius: RADIUS.cardLg, overflow: "hidden" }}
          >
            <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 42, height: 42, borderRadius: RADIUS.input, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 21 }}>🎯</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.white, fontSize: 17, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase" }}>All Goal Progress</Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: "rgba(255,255,255,0.60)", fontSize: 11, marginTop: 2 }}>{goalProgress.length} {goalProgress.length === 1 ? "goal" : "goals"}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAllGoals(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={{ width: 34, height: 34, borderRadius: RADIUS.full, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.white, fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, gap: 14 }}>
              {goalProgress.length === 0 ? (
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 13, paddingVertical: 24, textAlign: "center" }}>No goals created yet.</Text>
              ) : (
                goalProgress.map((goal, index) => <GoalProgressEntry key={goal.id} goal={goal} showDivider={index > 0} />)
              )}
            </ScrollView>

            <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: COLORS.slate100 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowAllGoals(false);
                  navigation.navigate("Goals");
                }}
                activeOpacity={0.75}
                style={{ minHeight: 44, borderRadius: RADIUS.input, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: "BricolageGrotesque_700Bold" }}>Manage Goals</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

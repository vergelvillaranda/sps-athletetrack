import React, { useState, useCallback } from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import SkeletonContent from "../components/Skeleton";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Field from "../components/Field";
import DateInput from "../components/DateInput";
import { FAB, PrimaryButton } from "../components/Button";
import { IconBack, IconCheck, IconEdit, IconTrash } from "../components/icons";
import { COLORS, RADIUS } from "../constants/theme";
import { FITNESS_GOAL_CATEGORIES, getSportsGoalCategories } from "../constants/goalCategories";
import { deleteGoal, insertGoal, getGoals, getStudent, markGoalComplete, moveGoalToProgress, updateGoal } from "../db/database";
import { parseISODate, toISODate } from "../utils/date";
import { CONTENT_MAX_WIDTH, FORM_MAX_WIDTH } from "../constants/layout";

const GOAL_TYPES = ["Fitness Goal", "Sports Goal"] as const;

function startOfWeekISO() {
  const date = new Date();
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysSinceMonday);
  date.setHours(0, 0, 0, 0);
  return toISODate(date);
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [sport, setSport] = useState("Basketball");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const [goalType, setGoalType] = useState<(typeof GOAL_TYPES)[number] | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [targetDateTouched, setTargetDateTouched] = useState(false);
  const [actionPlan, setActionPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      const [rows, student] = await Promise.all([getGoals(), getStudent()]);
      setGoals(rows);
      if (student?.sport) setSport(student.sport);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const goalsThisWeek = goals.filter((goal) => (goal.created_at ?? "").slice(0, 10) >= startOfWeekISO()).length;

  const baseCategoryOptions = goalType === "Fitness Goal" ? FITNESS_GOAL_CATEGORIES : goalType === "Sports Goal" ? getSportsGoalCategories(sport) : [];
  const categoryOptions = category && !baseCategoryOptions.includes(category) ? [...baseCategoryOptions, category] : baseCategoryOptions;
  const parsedStartDate = parseISODate(startDate);
  const parsedTargetDate = parseISODate(targetDate);
  const startDateError = startDate
    ? parsedStartDate
      ? null
      : "Enter a valid date in YYYY/MM/DD format."
    : startDateTouched
      ? "Start date is required."
      : null;
  const targetDateError = targetDate
    ? !parsedTargetDate
      ? "Enter a valid date in YYYY/MM/DD format."
      : parsedStartDate && parsedTargetDate < parsedStartDate
        ? "Target date cannot be before the start date."
        : null
    : targetDateTouched
      ? "Target date is required."
      : null;
  const canSubmit = Boolean(
    goalType && category && target.trim() && parsedStartDate && parsedTargetDate && !startDateError && !targetDateError
  );

  const resetForm = () => {
    setEditingGoalId(null);
    setGoalType(null);
    setCategory(null);
    setTarget("");
    setStartDate("");
    setTargetDate("");
    setStartDateTouched(false);
    setTargetDateTouched(false);
    setActionPlan("");
    setSaveError(null);
  };

  const openNewGoal = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditGoal = (goal: any) => {
    const savedType = GOAL_TYPES.includes(goal.goal_type) ? goal.goal_type : null;
    setEditingGoalId(goal.id);
    setGoalType(savedType);
    setCategory(goal.category ?? null);
    setTarget(goal.target ?? "");
    setStartDate((goal.start_date ?? "").replace(/-/g, "/"));
    setTargetDate((goal.target_date ?? "").replace(/-/g, "/"));
    setStartDateTouched(false);
    setTargetDateTouched(false);
    setActionPlan(goal.action_plan ?? "");
    setSaveError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!canSubmit || !goalType || !category) return;
    setSaving(true);
    setSaveError(null);
    try {
      const goalValues = {
        goalType,
        category,
        target,
        startDate: toISODate(parsedStartDate!),
        targetDate: toISODate(parsedTargetDate!),
        actionPlan: actionPlan || undefined,
      };
      if (editingGoalId !== null) {
        await updateGoal(editingGoalId, goalValues);
      } else {
        await insertGoal(goalValues);
      }
      await loadGoals();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save goal:", error);
      setSaveError("The goal could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await markGoalComplete(id);
      await loadGoals();
    } catch (error) {
      console.error("Failed to mark goal complete:", error);
    }
  };

  const handleMoveToProgress = async (id: number) => {
    try {
      await moveGoalToProgress(id);
      await loadGoals();
    } catch (error) {
      console.error("Failed to move goal back to progress:", error);
    }
  };

  const handleDeleteGoal = (goal: any) => {
    Alert.alert(
      "Delete Goal",
      `Delete your ${goal.category} goal? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              await loadGoals();
            } catch (error) {
              console.error("Failed to delete goal:", error);
              Alert.alert("Delete Failed", "The goal could not be deleted. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="dashboard" />
        <SkeletonContent />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="dashboard" />

      <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800 }}>
          My Goals
        </Text>
        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, marginTop: 2 }}>
          {completedGoals.length} completed · {activeGoals.length} in progress
        </Text>
      </View>

      <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", flexDirection: "row", paddingHorizontal: 16, gap: 12, marginTop: 16, marginBottom: 16 }}>
        {[
          { value: completedGoals.length, label: "Goals Completed" },
          { value: activeGoals.length, label: "Goals in Progress" },
          { value: goalsThisWeek, label: "This Week" },
        ].map((stat) => (
          <Card key={stat.label} style={{ flex: 1, alignItems: "center" }} padded={false}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>{stat.value}</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 9, lineHeight: 12, color: COLORS.slate400, textAlign: "center", marginTop: 2 }}>{stat.label}</Text>
            </View>
          </Card>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
          {activeGoals.map((goal) => (
            <Card key={goal.id}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <Badge label={goal.goal_type} bg={goal.goal_type === "Fitness Goal" ? COLORS.blue100 : COLORS.orange50} color={goal.goal_type === "Fitness Goal" ? COLORS.blue700 : "#C2410C"} />
                  <Badge label={goal.category} bg={COLORS.surface} color={COLORS.slate600} />
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteGoal(goal)}
                  activeOpacity={0.72}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${goal.category} goal`}
                  style={{ width: 34, height: 34, borderRadius: RADIUS.full, backgroundColor: COLORS.red100, alignItems: "center", justifyContent: "center" }}
                >
                  <IconTrash size={15} />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate800, marginBottom: 8 }}>
                I want to improve my {goal.category.toLowerCase()}.
              </Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate500, marginBottom: 2 }}>Target: {goal.target}</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400, marginBottom: 2 }}>
                {goal.start_date} → {goal.target_date}
              </Text>
              {goal.action_plan ? (
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate500, marginTop: 6, fontStyle: "italic" }}>{goal.action_plan}</Text>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  onPress={() => openEditGoal(goal)}
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${goal.category} goal`}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 16,
                    borderRadius: RADIUS.input,
                    borderWidth: 1,
                    borderColor: COLORS.orange100,
                    backgroundColor: COLORS.white,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                  }}
                >
                  <IconEdit size={15} />
                  <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.orange }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleComplete(goal.id)}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${goal.category} goal complete`}
                  style={{
                    minHeight: 44,
                    flex: 1,
                    borderRadius: RADIUS.input,
                    borderWidth: 1,
                    borderColor: COLORS.green700,
                    backgroundColor: COLORS.green500,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    shadowColor: COLORS.green700,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.24,
                    shadowRadius: 5,
                    elevation: 4,
                  }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.20)", alignItems: "center", justifyContent: "center" }}>
                    <IconCheck size={12} />
                  </View>
                  <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.white }}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {completedGoals.length > 0 ? (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate400, textTransform: "uppercase", letterSpacing: 1.2 }}>
              Completed
            </Text>
            {completedGoals.map((goal) => (
              <Card key={goal.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: COLORS.green500, alignItems: "center", justifyContent: "center" }}>
                    <IconCheck />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_500Medium", color: COLORS.slate500, textDecorationLine: "line-through" }}>
                      Improve {goal.category}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: "BricolageGrotesque_600SemiBold", color: "#16A34A", marginTop: 2 }}>
                      Target: {goal.target}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteGoal(goal)}
                    activeOpacity={0.72}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${goal.category} goal`}
                    style={{ width: 34, height: 34, borderRadius: RADIUS.full, backgroundColor: COLORS.red100, alignItems: "center", justifyContent: "center" }}
                  >
                    <IconTrash size={15} />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                  <TouchableOpacity
                    onPress={() => openEditGoal(goal)}
                    activeOpacity={0.78}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${goal.category} goal`}
                    style={{
                      minHeight: 44,
                      paddingHorizontal: 16,
                      borderRadius: RADIUS.input,
                      borderWidth: 1,
                      borderColor: COLORS.orange100,
                      backgroundColor: COLORS.white,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <IconEdit size={15} />
                    <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.orange }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleMoveToProgress(goal.id)}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${goal.category} goal back to in progress`}
                    style={{
                      minHeight: 44,
                      flex: 1,
                      borderRadius: RADIUS.input,
                      borderWidth: 1,
                      borderColor: "#E94E12",
                      backgroundColor: COLORS.orange,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      shadowColor: COLORS.orange,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 4,
                    }}
                  >
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", width: 20, height: 20, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.20)", color: COLORS.white, fontSize: 15, lineHeight: 20, textAlign: "center" }}>
                      ↺
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.white }}>
                      Move to In Progress
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <FAB label="Add New Goal" onPress={openNewGoal} />

      {showForm ? (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.surface }}>
          <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={closeForm} style={{ padding: 4 }}>
              <IconBack />
            </TouchableOpacity>
            <Text style={{ color: COLORS.white, fontSize: 20, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase" }}>
              {editingGoalId !== null ? "Edit Goal" : "New Goal"}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ width: "100%", maxWidth: FORM_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Goal Type
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {GOAL_TYPES.map((type) => {
                  const active = goalType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setGoalType(type);
                        setCategory(null);
                      }}
                      style={{ flex: 1, borderRadius: RADIUS.input, paddingVertical: 12, alignItems: "center", backgroundColor: active ? COLORS.navy : COLORS.white, borderWidth: 1, borderColor: active ? COLORS.navy : COLORS.slate200 }}
                    >
                      <Text style={{ fontSize: 13, fontFamily: "BricolageGrotesque_600SemiBold", color: active ? COLORS.white : COLORS.slate600 }}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {goalType ? (
              <View>
                <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  I want to improve my…
                </Text>
                {goalType === "Sports Goal" ? (
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, marginTop: -4, marginBottom: 8 }}>
                    Skills recommended for {sport}
                  </Text>
                ) : null}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {categoryOptions.map((cat) => {
                    const active = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.75}
                        style={{
                          minHeight: 36,
                          borderRadius: RADIUS.full,
                          borderWidth: 1,
                          borderColor: active ? COLORS.orange : COLORS.slate200,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: active ? COLORS.orange : COLORS.white,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: active ? COLORS.white : COLORS.slate500 }}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Field label="Target" required value={target} onChangeText={setTarget} placeholder="e.g. Improve shooting practice consistency" />
            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Start Date <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange }}>*</Text>
              </Text>
              <DateInput
                value={startDate}
                onChangeText={setStartDate}
                onBlur={() => setStartDateTouched(true)}
                onDateSelected={() => setStartDateTouched(true)}
                error={startDateError}
              />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Target Date <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange }}>*</Text>
              </Text>
              <DateInput
                value={targetDate}
                onChangeText={setTargetDate}
                onBlur={() => setTargetDateTouched(true)}
                onDateSelected={() => setTargetDateTouched(true)}
                error={targetDateError}
                minimumDate={parsedStartDate ?? undefined}
              />
            </View>
            <Field label="Action Plan" hint="optional" value={actionPlan} onChangeText={setActionPlan} placeholder="e.g. Practice shooting drills 3 times per week" />

            {saveError ? (
              <Text style={{ color: COLORS.red500, fontSize: 12, fontFamily: "BricolageGrotesque_500Medium" }}>
                {saveError}
              </Text>
            ) : null}
            <PrimaryButton label={editingGoalId !== null ? "Update Goal" : "Save Goal"} onPress={handleSubmit} disabled={!canSubmit} loading={saving} />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

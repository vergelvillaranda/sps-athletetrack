import React, { useState, useCallback } from "react";
import { Alert, View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import SkeletonContent from "../components/Skeleton";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Field from "../components/Field";
import DateInput from "../components/DateInput";
import { FAB, PrimaryButton } from "../components/Button";
import { IconBack, IconEdit, IconTrash } from "../components/icons";
import { COLORS, RADIUS, INTENSITY_COLORS, INTENSITIES, SPORT_EMOJI } from "../constants/theme";
import { deleteTrainingLog, getTrainingLogs, insertTrainingLog, getStudent, updateTrainingLog } from "../db/database";
import { parseISODate, toDateInput, toISODate } from "../utils/date";
import { CONTENT_MAX_WIDTH, FORM_MAX_WIDTH } from "../constants/layout";

// Sport-recommended activities. TODO: move to sportsData.ts alongside drills/exercises once that file's scope grows.
const ACTIVITY_OPTIONS_BY_SPORT: Record<string, string[]> = {
  Basketball: ["Dribbling Drill", "Passing Drill", "Shooting Drill", "Defensive Footwork Drill", "Scrimmage"],
  Swimming: ["Kicking Drill", "Breathing Drill", "Stroke Drill", "Endurance Swimming"],
  Athletics: ["Sprint Start Drill", "Relay Drill", "Jump Drill", "Endurance Run"],
  Badminton: ["Serving Drill", "Forehand Drill", "Footwork Drill"],
  Chess: ["Tactical Drill", "Opening Drill", "Game Analysis"],
  Arnis: ["Basic Striking Drill", "Blocking Drill", "Footwork Drill"],
  Football: ["Dribbling Drill", "Passing Drill", "Shooting Drill"],
  Taekwondo: ["Front-Kick Drill", "Blocking Drill", "Footwork Drill"],
  Volleyball: ["Serving Drill", "Passing Drill", "Spiking Drill"],
  "Sepak Takraw": ["Kicking Drill", "Serving Drill", "Receiving Drill"],
  "Wushu Sanda": ["Punching Drill", "Kicking Drill", "Pad Drill"],
  Wrestling: ["Stance and Movement Drill", "Takedown Drill", "Escape Drill"],
  Gymnastics: ["Balance Drill", "Roll Drill", "Landing Drill"],
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function LogDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
      <Text style={{ width: 66, flexShrink: 0, color: COLORS.slate400, fontSize: 11, lineHeight: 17, fontFamily: "BricolageGrotesque_600SemiBold" }}>
        {label}:
      </Text>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
    </View>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function TrainingScreen() {
  const [sport, setSport] = useState<string>("Basketball");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [logDate, setLogDate] = useState(toDateInput(new Date()));
  const [logDateTouched, setLogDateTouched] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const [student, trainingLogs] = await Promise.all([getStudent(), getTrainingLogs()]);
    if (student?.sport) setSport(student.sport);
    setLogs(trainingLogs as any[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalSessions = logs.length;
  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  const weekStart = startOfWeekISO();
  const thisWeek = logs.filter((l) => l.date >= weekStart).length;

  const activityOptions = ACTIVITY_OPTIONS_BY_SPORT[sport] ?? [];
  const parsedLogDate = parseISODate(logDate);
  const logDateError = logDate
    ? parsedLogDate
      ? null
      : "Enter a valid date in YYYY/MM/DD format."
    : logDateTouched
      ? "Training date is required."
      : null;
  const canSubmit = Boolean(activity && duration && intensity && parsedLogDate && !logDateError);

  const resetForm = () => {
    setEditingLogId(null);
    setLogDate(toDateInput(new Date()));
    setLogDateTouched(false);
    setActivity(null);
    setDuration("");
    setIntensity(null);
    setNotes("");
  };

  const openNewLog = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditLog = (log: any) => {
    setEditingLogId(log.id);
    setLogDate((log.date ?? todayISO()).replace(/-/g, "/"));
    setLogDateTouched(false);
    setActivity(log.activity ?? null);
    setDuration(String(log.duration_minutes ?? ""));
    setIntensity(log.intensity ?? null);
    setNotes(log.notes ?? "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!canSubmit || !activity || !intensity) return;
    setSaving(true);
    try {
      const logValues = {
        date: toISODate(parsedLogDate!),
        activity,
        durationMinutes: parseInt(duration, 10) || 0,
        intensity,
        notes: notes || undefined,
      };
      if (editingLogId !== null) {
        await updateTrainingLog(editingLogId, logValues);
      } else {
        await insertTrainingLog(logValues);
      }
      setShowForm(false);
      resetForm();
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = (log: any) => {
    Alert.alert(
      "Delete Training Log",
      `Delete the ${log.activity} training log? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrainingLog(log.id);
              await loadData();
            } catch (error) {
              console.error("Failed to delete training log:", error);
              Alert.alert("Delete Failed", "The training log could not be deleted. Please try again.");
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
          Training Logs
        </Text>
        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, marginTop: 2 }}>
          All {totalSessions} sessions stored on-device
        </Text>
      </View>

      <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", flexDirection: "row", paddingHorizontal: 16, gap: 12, marginTop: 16, marginBottom: 16 }}>
        {[
          { value: totalSessions, label: "Total Sessions" },
          { value: totalMinutes, label: "Total Minutes" },
          { value: thisWeek, label: "This Week" },
        ].map((stat, i) => (
          <Card key={i} style={{ flex: 1, alignItems: "center" }} padded={false}>
            <View style={{ padding: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>{stat.value}</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 9, color: COLORS.slate400, textAlign: "center", marginTop: 2 }}>{stat.label}</Text>
            </View>
          </Card>
        ))}
      </View>

      {logs.length === 0 ? (
        <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16 }}>
          <Card style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 32, marginBottom: 8 }}>📋</Text>
            <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate600, textAlign: "center" }}>
              No training logged yet
            </Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, textAlign: "center", marginTop: 4 }}>
              Tap "Add Training Log" below to record your first session.
            </Text>
          </Card>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, gap: 12, paddingBottom: 100 }}>
          {logs.map((log) => {
            const badge = INTENSITY_COLORS[log.intensity] ?? { bg: COLORS.slate100, text: COLORS.slate500 };
            return (
              <Card key={log.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.slate100 }}>
                  <View style={{ width: 44, height: 44, borderRadius: RADIUS.input, backgroundColor: COLORS.orange50, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 20 }}>{SPORT_EMOJI[sport] ?? "🏅"}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate800 }}>Training Log</Text>
                    <Text numberOfLines={1} style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400, marginTop: 2 }}>{log.activity}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => openEditLog(log)}
                      activeOpacity={0.72}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${log.activity} training log`}
                      style={{ minHeight: 34, paddingHorizontal: 11, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.orange100, backgroundColor: COLORS.orange50, flexDirection: "row", alignItems: "center", gap: 5 }}
                    >
                      <IconEdit size={13} />
                      <Text style={{ color: COLORS.orange, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold" }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteLog(log)}
                      activeOpacity={0.72}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${log.activity} training log`}
                      style={{ minHeight: 34, paddingHorizontal: 10, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.red100, backgroundColor: COLORS.red100, flexDirection: "row", alignItems: "center", gap: 5 }}
                    >
                      <IconTrash size={13} />
                      <Text style={{ color: COLORS.red500, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ gap: 8 }}>
                  <LogDetailRow label="Date">
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate700, fontSize: 12, lineHeight: 17 }}>{formatDate(log.date)}</Text>
                  </LogDetailRow>
                  <LogDetailRow label="Sport">
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate700, fontSize: 12, lineHeight: 17 }}>{sport}</Text>
                  </LogDetailRow>
                  <LogDetailRow label="Activity">
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate700, fontSize: 12, lineHeight: 17 }}>{log.activity}</Text>
                  </LogDetailRow>
                  <LogDetailRow label="Duration">
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate700, fontSize: 12, lineHeight: 17 }}>
                      {log.duration_minutes} {log.duration_minutes === 1 ? "minute" : "minutes"}
                    </Text>
                  </LogDetailRow>
                  <LogDetailRow label="Intensity">
                    <View style={{ alignSelf: "flex-start" }}>
                      <Badge label={log.intensity} bg={badge.bg} color={badge.text} />
                    </View>
                  </LogDetailRow>
                  <LogDetailRow label="Notes">
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: log.notes ? COLORS.slate600 : COLORS.slate400, fontSize: 12, lineHeight: 17, fontStyle: log.notes ? "normal" : "italic" }}>
                      {log.notes || "No notes added."}
                    </Text>
                  </LogDetailRow>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}

      <FAB label="Add Training Log" onPress={openNewLog} />

      {showForm ? (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.surface }}>
          <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={closeForm} style={{ padding: 4 }}>
              <IconBack />
            </TouchableOpacity>
            <Text style={{ color: COLORS.white, fontSize: 20, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase" }}>
              {editingLogId !== null ? "Edit Training Log" : "New Training Log"}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ width: "100%", maxWidth: FORM_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Training Date <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange }}>*</Text>
              </Text>
              <DateInput
                value={logDate}
                onChangeText={setLogDate}
                onBlur={() => setLogDateTouched(true)}
                onDateSelected={() => setLogDateTouched(true)}
                error={logDateError}
                maximumDate={new Date()}
              />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
                Activity
              </Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, marginBottom: 8 }}>Recommended for {sport}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {activityOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setActivity(opt)}
                    style={{
                      borderRadius: RADIUS.input,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: activity === opt ? COLORS.navy : COLORS.white,
                      borderWidth: 1,
                      borderColor: activity === opt ? COLORS.navy : COLORS.slate200,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: activity === opt ? COLORS.white : COLORS.slate700, fontFamily: "BricolageGrotesque_500Medium" }}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Field label="Duration" hint="minutes" keyboardType="numeric" value={duration} onChangeText={setDuration} placeholder="e.g. 45" />

            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Intensity
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {INTENSITIES.map((level) => {
                  const active = intensity === level;
                  const badgeColor = INTENSITY_COLORS[level];
                  return (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setIntensity(level)}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: RADIUS.input,
                        borderWidth: 2,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: active ? badgeColor.bg : COLORS.white,
                        borderColor: active ? badgeColor.text : COLORS.slate200,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontFamily: "BricolageGrotesque_600SemiBold", color: active ? badgeColor.text : COLORS.slate400 }}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Optional"
                placeholderTextColor={COLORS.slate400}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.slate200,
                  backgroundColor: COLORS.white,
                  borderRadius: RADIUS.input,
                  padding: 12,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: "top",
                  fontFamily: "BricolageGrotesque_500Medium",
                }}
              />
            </View>

            <View style={{ backgroundColor: COLORS.green100, borderRadius: RADIUS.input, padding: 12, flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular" }}>💾</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.green700, flex: 1 }}>Saved directly to this device — no internet needed</Text>
            </View>

            <PrimaryButton
              label={editingLogId !== null ? "Update Training Log" : "Save Training Log"}
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={saving}
            />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

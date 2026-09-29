import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Card from "../components/Card";
import Header from "../components/Header";
import SkeletonContent from "../components/Skeleton";
import DateInput from "../components/DateInput";
import { IconTrendUp, IconTrendDown } from "../components/icons";
import { COLORS, RADIUS } from "../constants/theme";
import { ASSESSMENT_TESTS, TestCategory, TestDefinition } from "../constants/assessmentTests";
import { deleteAssessmentRecord, getAssessmentRecords, insertAssessmentRecord, updateAssessmentRecord } from "../db/database";
import { getBMIInfo } from "../utils/bmi";
import { parseISODate, toDateInput, toISODate } from "../utils/date";
import { CONTENT_MAX_WIDTH } from "../constants/layout";

interface AssessmentRecord {
  id: number;
  test_date: string;
  assessment_phase: AssessmentPhase;
  data: Record<string, string>;
}

type RecordsByTest = Record<string, AssessmentRecord[]>;
type AssessmentPhase = "pre-test" | "post-test";
const CATEGORY_TABS: TestCategory[] = ["Health-Related", "Skill-Related"];

function formatAssessmentDate(isoDate: string) {
  const parsed = parseISODate(isoDate);
  return parsed
    ? parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : isoDate;
}

function formatCalculatedNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function addCalculatedValues(testKey: string, inputValues: Record<string, string>) {
  const nextValues = { ...inputValues };

  if (testKey === "bmi") {
    const height = Number(inputValues.height);
    const weight = Number(inputValues.weight);
    if (height > 0 && weight > 0) {
      const bmiInfo = getBMIInfo(weight, height);
      nextValues.bmi = String(bmiInfo.bmi);
      nextValues.classification = bmiInfo.classification;
    } else {
      delete nextValues.bmi;
      delete nextValues.classification;
    }
  }

  if (testKey === "hexagon") {
    const clockwise = Number(inputValues.clockwise);
    const counterclockwise = Number(inputValues.counter);
    if (clockwise > 0 && counterclockwise > 0) {
      nextValues.average = formatCalculatedNumber((clockwise + counterclockwise) / 2);
    } else {
      delete nextValues.average;
    }
  }

  return nextValues;
}

function TestCard({
  test,
  records,
  expanded,
  onToggle,
  onSaved,
}: {
  test: TestDefinition;
  records: AssessmentRecord[];
  expanded: boolean;
  onToggle: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [date, setDate] = useState(toDateInput(new Date()));
  const [assessmentPhase, setAssessmentPhase] = useState<AssessmentPhase>("pre-test");
  const parsedDate = parseISODate(date);
  const dateError = date ? (parsedDate ? null : "Enter a valid date in YYYY/MM/DD format.") : "Assessment date is required.";
  const formValues = addCalculatedValues(test.key, values);
  const canSave = Boolean(parsedDate && test.fields.every((field) => formValues[field.key]?.trim()));

  const latest = records[0];
  const latestPreTest = records.find((record) => (record.assessment_phase ?? "pre-test") === "pre-test");
  const latestPostTest = records.find(
    (record) => record.assessment_phase === "post-test" && (!latestPreTest || record.test_date >= latestPreTest.test_date)
  );
  const displayedTestName = test.testName ?? test.name;

  const preTestValue = latestPreTest ? parseFloat(latestPreTest.data[test.primaryField]) : null;
  const postTestValue = latestPostTest ? parseFloat(latestPostTest.data[test.primaryField]) : null;

  let trend: "up" | "down" | null = null;
  let change: number | null = null;
  if (test.key !== "bmi" && preTestValue !== null && postTestValue !== null && !isNaN(preTestValue) && !isNaN(postTestValue)) {
    change = postTestValue - preTestValue;
    const improved = test.lowerIsBetter ? change < 0 : change > 0;
    trend = improved ? "up" : change === 0 ? null : "down";
  }

  const fieldComparisons = latestPreTest && latestPostTest
    ? test.fields.flatMap((field) => {
        const pre = Number(latestPreTest.data[field.key]);
        const post = Number(latestPostTest.data[field.key]);
        if (!Number.isFinite(pre) || !Number.isFinite(post)) return [];
        const difference = post - pre;
        const percentage = pre === 0 ? null : (difference / Math.abs(pre)) * 100;
        return [{ field, pre, post, difference, percentage }];
      })
    : [];
  const primaryComparison = fieldComparisons.find(({ field }) => field.key === test.primaryField);
  const comparisonStatus = !primaryComparison || primaryComparison.difference === 0
    ? "No change"
    : test.key === "bmi"
      ? "Change recorded"
      : (test.lowerIsBetter ? primaryComparison.difference < 0 : primaryComparison.difference > 0)
        ? "Improved"
        : "Needs attention";

  const handleSave = async () => {
    if (!canSave || !parsedDate) return;
    if (editingRecordId !== null) {
      await updateAssessmentRecord(editingRecordId, toISODate(parsedDate), assessmentPhase, formValues);
    } else {
      await insertAssessmentRecord(test.key, toISODate(parsedDate), assessmentPhase, formValues);
    }
    setEditingRecordId(null);
    setValues({});
    setDate(toDateInput(new Date()));
    setAssessmentPhase("pre-test");
    setShowForm(false);
    await onSaved();
  };

  const openNewRecord = () => {
    setEditingRecordId(null);
    setValues({});
    setDate(toDateInput(new Date()));
    setAssessmentPhase("pre-test");
    setShowForm(true);
  };

  const openEditRecord = (record: AssessmentRecord) => {
    setEditingRecordId(record.id);
    setValues({ ...record.data });
    setDate(record.test_date.replace(/-/g, "/"));
    setAssessmentPhase(record.assessment_phase ?? "pre-test");
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingRecordId(null);
    setValues({});
    setDate(toDateInput(new Date()));
    setAssessmentPhase("pre-test");
    setShowForm(false);
  };

  const confirmDeleteRecord = (record: AssessmentRecord) => {
    Alert.alert(
      "Delete Assessment Record",
      `Delete the ${displayedTestName} result recorded on ${record.test_date}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteAssessmentRecord(record.id);
            if (editingRecordId === record.id) closeForm();
            await onSaved();
          },
        },
      ]
    );
  };

  return (
    <Card>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 24 }}>{test.emoji}</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={2}
              style={{ fontSize: 14, lineHeight: 18, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate800, flexShrink: 1 }}
            >
              {test.name}
            </Text>
            {test.testName ? (
              <Text style={{ fontSize: 11, color: COLORS.slate600, fontFamily: "BricolageGrotesque_600SemiBold", marginTop: 2 }}>
                Test: {test.testName}
              </Text>
            ) : null}
            {latest ? (
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400 }}>
                Last recorded: {(latest.assessment_phase ?? "pre-test") === "post-test" ? "Post-Test" : "Pre-Test"} · {formatAssessmentDate(latest.test_date)}
              </Text>
            ) : (
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400 }}>No results yet</Text>
            )}
          </View>
          {latest ? (
            <View style={{ alignItems: "flex-end", maxWidth: "38%", flexShrink: 1 }}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
                style={{ fontSize: 20, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}
              >
                {latest.data[test.primaryField]}
                {test.primaryUnit ? <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400 }}> {test.primaryUnit}</Text> : null}
              </Text>
              {trend ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  {trend === "up" ? <IconTrendUp size={14} /> : <IconTrendDown size={14} />}
                  <Text style={{ fontSize: 10, color: trend === "up" ? "#16A34A" : "#DC2626", fontFamily: "BricolageGrotesque_700Bold" }}>
                    {change !== null ? formatCalculatedNumber(Math.abs(change)) : ""}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.slate50, paddingTop: 12, gap: 10 }}>
          <View style={{ backgroundColor: COLORS.slate50, borderRadius: RADIUS.input, padding: 10 }}>
            <Text style={{ fontSize: 10, color: COLORS.slate400, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase", marginBottom: 3 }}>
              Test Description
            </Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate600, lineHeight: 18 }}>{test.description}</Text>
          </View>

          <View style={{ borderWidth: 1, borderColor: COLORS.slate200, backgroundColor: COLORS.white, borderRadius: RADIUS.input, padding: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: latestPreTest && latestPostTest ? 8 : 0 }}>
              <Text style={{ flex: 1, fontSize: 11, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.navy, textTransform: "uppercase" }}>
                Pre-Test vs Post-Test
              </Text>
              {latestPreTest && latestPostTest ? (
                <View style={{ borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: comparisonStatus === "Improved" ? COLORS.green100 : comparisonStatus === "Needs attention" ? COLORS.red100 : COLORS.orange50 }}>
                  <Text style={{ fontSize: 9, fontFamily: "BricolageGrotesque_700Bold", color: comparisonStatus === "Improved" ? COLORS.green700 : comparisonStatus === "Needs attention" ? COLORS.red500 : COLORS.orange }}>
                    {comparisonStatus}
                  </Text>
                </View>
              ) : null}
            </View>

            {latestPreTest && latestPostTest ? (
              <View style={{ gap: 7 }}>
                <View style={{ flexDirection: "row", paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: COLORS.slate100 }}>
                  <Text style={{ flex: 1.35, fontSize: 9, color: COLORS.slate400, fontFamily: "BricolageGrotesque_700Bold" }}>MEASURE</Text>
                  <Text style={{ flex: 0.8, textAlign: "right", fontSize: 9, color: COLORS.slate400, fontFamily: "BricolageGrotesque_700Bold" }}>PRE</Text>
                  <Text style={{ flex: 0.8, textAlign: "right", fontSize: 9, color: COLORS.slate400, fontFamily: "BricolageGrotesque_700Bold" }}>POST</Text>
                  <Text style={{ flex: 1, textAlign: "right", fontSize: 9, color: COLORS.slate400, fontFamily: "BricolageGrotesque_700Bold" }}>CHANGE</Text>
                </View>
                {fieldComparisons.map(({ field, pre, post, difference, percentage }) => (
                  <View key={field.key} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 1.35, fontSize: 10, lineHeight: 15, color: COLORS.slate600 }}>{field.label}</Text>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 0.8, textAlign: "right", fontSize: 10, color: COLORS.slate700 }}>{formatCalculatedNumber(pre)}</Text>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", flex: 0.8, textAlign: "right", fontSize: 10, color: COLORS.slate700 }}>{formatCalculatedNumber(post)}</Text>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 10, color: difference === 0 ? COLORS.slate500 : COLORS.navy, fontFamily: "BricolageGrotesque_700Bold" }}>
                        {difference > 0 ? "+" : ""}{formatCalculatedNumber(difference)}
                      </Text>
                      {percentage !== null ? (
                        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 8, color: COLORS.slate400 }}>
                          {percentage > 0 ? "+" : ""}{formatCalculatedNumber(percentage)}%
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 9, color: COLORS.slate400, marginTop: 2 }}>
                  Comparing {formatAssessmentDate(latestPreTest.test_date)} with {formatAssessmentDate(latestPostTest.test_date)}.
                </Text>
              </View>
            ) : (
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate400, lineHeight: 16 }}>
                Record both a Pre-Test and a Post-Test result to measure the change.
              </Text>
            )}
          </View>

          {records.length > 0 && !showForm ? (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate400, textTransform: "uppercase" }}>
                {test.key === "bmi" ? "BMI History" : "History"}
              </Text>
              {records.map((r, i) => (
                <View
                  key={r.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingVertical: 7,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: COLORS.slate100,
                  }}
                >
                  <View style={{ width: 94, flexShrink: 0 }}>
                    <View style={{ alignSelf: "flex-start", borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 3, marginBottom: 5, backgroundColor: (r.assessment_phase ?? "pre-test") === "post-test" ? COLORS.green100 : COLORS.orange50 }}>
                      <Text style={{ fontSize: 8, fontFamily: "BricolageGrotesque_700Bold", color: (r.assessment_phase ?? "pre-test") === "post-test" ? COLORS.green700 : COLORS.orange }}>
                        {(r.assessment_phase ?? "pre-test") === "post-test" ? "POST-TEST" : "PRE-TEST"}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: COLORS.slate400, fontFamily: "BricolageGrotesque_700Bold" }}>DATE</Text>
                    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, lineHeight: 15, color: COLORS.slate500 }}>{formatAssessmentDate(r.test_date)}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0, alignItems: "flex-end", gap: 2 }}>
                    {test.fields.map((field) => (
                      <Text
                        key={field.key}
                        style={{
                          maxWidth: "100%",
                          flexShrink: 1,
                          textAlign: "right",
                          fontSize: 11,
                          lineHeight: 16,
                          fontFamily: "BricolageGrotesque_600SemiBold",
                          color: COLORS.slate700,
                        }}
                      >
                        {field.label}: {r.data[field.key]}{field.unit ? ` ${field.unit}` : ""}
                      </Text>
                    ))}
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      <TouchableOpacity
                        onPress={() => openEditRecord(r)}
                        activeOpacity={0.72}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${displayedTestName} result from ${r.test_date}`}
                        style={{
                          minHeight: 30,
                          paddingHorizontal: 11,
                          borderRadius: RADIUS.full,
                          borderWidth: 1,
                          borderColor: COLORS.orange100,
                          backgroundColor: COLORS.orange50,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: COLORS.orange, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold" }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDeleteRecord(r)}
                        activeOpacity={0.72}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${displayedTestName} result from ${r.test_date}`}
                        style={{
                          minHeight: 30,
                          paddingHorizontal: 11,
                          borderRadius: RADIUS.full,
                          borderWidth: 1,
                          borderColor: COLORS.red100,
                          backgroundColor: COLORS.red100,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: COLORS.red500, fontSize: 10, fontFamily: "BricolageGrotesque_700Bold" }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {!showForm ? (
            <TouchableOpacity
              onPress={openNewRecord}
              style={{ backgroundColor: COLORS.orange50, borderRadius: RADIUS.input, paddingVertical: 10, alignItems: "center" }}
            >
              <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: "#C2410C" }}>
                {test.key === "bmi" ? "+ Record New BMI" : "+ Record New Result"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate500, marginBottom: 5 }}>Assessment Type</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["pre-test", "post-test"] as AssessmentPhase[]).map((phase) => {
                    const active = assessmentPhase === phase;
                    const label = phase === "pre-test" ? "Pre-Test" : "Post-Test";
                    return (
                      <TouchableOpacity
                        key={phase}
                        onPress={() => setAssessmentPhase(phase)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        style={{
                          flex: 1,
                          minHeight: 42,
                          borderRadius: RADIUS.input,
                          borderWidth: 1,
                          borderColor: active ? COLORS.orange : COLORS.slate200,
                          backgroundColor: active ? COLORS.orange50 : COLORS.white,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: active ? COLORS.orange : COLORS.slate500, fontFamily: active ? "BricolageGrotesque_700Bold" : "BricolageGrotesque_500Medium" }}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <View>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate500, marginBottom: 4 }}>Assessment Date</Text>
                <DateInput value={date} onChangeText={setDate} error={dateError} maximumDate={new Date()} />
              </View>
              {test.fields.map((f) => (
                <View key={f.key}>
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 11, color: COLORS.slate500, marginBottom: 4 }}>
                    {f.label} {f.unit ? `(${f.unit})` : ""}
                  </Text>
                  {f.calculated ? (
                    <View
                      style={{
                        minHeight: 42,
                        borderWidth: 1,
                        borderColor: COLORS.orange100,
                        backgroundColor: COLORS.orange50,
                        borderRadius: RADIUS.input,
                        paddingHorizontal: 10,
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13, color: formValues[f.key] ? COLORS.navy : COLORS.slate400, fontFamily: "BricolageGrotesque_600SemiBold" }}>
                        {formValues[f.key] || "Calculated automatically"}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      keyboardType="decimal-pad"
                      value={values[f.key] ?? ""}
                      onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                      style={{ fontFamily: "BricolageGrotesque_400Regular",
                        borderWidth: 1,
                        borderColor: COLORS.slate200,
                        backgroundColor: COLORS.slate50,
                        borderRadius: RADIUS.input,
                        padding: 10,
                        fontSize: 13,
                      }}
                    />
                  )}
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={closeForm}
                  style={{ flex: 1, borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.slate200, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate500 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!canSave}
                  style={{ flex: 1, borderRadius: RADIUS.input, backgroundColor: canSave ? COLORS.orange : COLORS.slate200, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.white }}>
                    {editingRecordId !== null ? "Update" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : null}
    </Card>
  );
}

export default function AssessmentScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const pageWidth = Math.min(screenWidth, CONTENT_MAX_WIDTH);
  const pagerRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<TestCategory>("Health-Related");
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [recordsByTest, setRecordsByTest] = useState<RecordsByTest>({});

  const loadAll = useCallback(async () => {
    try {
      const result: RecordsByTest = {};
      await Promise.all(
        ASSESSMENT_TESTS.map(async (test) => {
          result[test.key] = await getAssessmentRecords(test.key);
        })
      );
      setRecordsByTest(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  useEffect(() => {
    const pageIndex = CATEGORY_TABS.indexOf(category);
    pagerRef.current?.scrollTo({ x: pageIndex * pageWidth, animated: false });
  }, [category, pageWidth]);

  const recordedResults = Object.values(recordsByTest).reduce((total, records) => total + records.length, 0);

  const selectCategory = (nextCategory: TestCategory) => {
    const pageIndex = CATEGORY_TABS.indexOf(nextCategory);
    setCategory(nextCategory);
    setExpandedTest(null);
    pagerRef.current?.scrollTo({ x: pageIndex * pageWidth, animated: true });
  };

  const handleCategorySwipe = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageIndex = Math.max(0, Math.min(CATEGORY_TABS.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)));
    const nextCategory = CATEGORY_TABS[pageIndex];
    if (nextCategory !== category) {
      setCategory(nextCategory);
      setExpandedTest(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="back" title="Fitness Assessment Tracker" />
        <SkeletonContent />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="back" title="Fitness Assessment Tracker" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", backgroundColor: COLORS.navy, paddingHorizontal: 18, paddingBottom: 20 }}>
          <View
            style={{
              backgroundColor: COLORS.navy800,
              borderRadius: RADIUS.card,
              padding: 16,
              flexDirection: "row",
              gap: 14,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: RADIUS.card,
                backgroundColor: COLORS.orange,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 30 }}>📊</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 10,
                  fontFamily: "BricolageGrotesque_700Bold",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Fitness Assessment
              </Text>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 24,
                  fontFamily: "BricolageGrotesque_800ExtraBold",
                  textTransform: "uppercase",
                }}
              >
                Tracker
              </Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange100, fontSize: 10, marginTop: 3 }}>
                {ASSESSMENT_TESTS.length} tests available · {recordedResults} results recorded
              </Text>
            </View>
          </View>
        </View>

        <View style={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", flexDirection: "row", gap: 8, paddingHorizontal: 18, marginTop: 12, marginBottom: 16 }}>
          {CATEGORY_TABS.map((cat) => {
            const active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => selectCategory(cat)}
                style={{
                  flex: 1,
                  borderRadius: RADIUS.full,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: active ? COLORS.navy : COLORS.white,
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{ paddingHorizontal: 4, fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: active ? COLORS.white : COLORS.slate500 }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          ref={pagerRef}
          style={{ width: pageWidth, alignSelf: "center" }}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          directionalLockEnabled
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleCategorySwipe}
          keyboardShouldPersistTaps="handled"
          accessibilityLabel="Swipe between fitness assessment categories"
        >
          {CATEGORY_TABS.map((pageCategory) => (
            <View key={pageCategory} style={{ width: pageWidth, paddingHorizontal: 16, gap: 12 }}>
              {ASSESSMENT_TESTS.filter((test) => test.category === pageCategory).map((test) => (
                <TestCard
                  key={test.key}
                  test={test}
                  records={recordsByTest[test.key] ?? []}
                  expanded={expandedTest === test.key}
                  onToggle={() => setExpandedTest(expandedTest === test.key ? null : test.key)}
                  onSaved={loadAll}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

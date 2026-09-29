import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import Card from "../components/Card";
import SkeletonContent from "../components/Skeleton";
import { GhostButton } from "../components/Button";
import { IconChevronRight } from "../components/icons";
import { COLORS, RADIUS, BMI_COLORS, SPORT_EMOJI } from "../constants/theme";
import { ASSESSMENT_TESTS } from "../constants/assessmentTests";
import { getBMIInfo, computeAge } from "../utils/bmi";
import { getStudent, getLatestAssessmentRecords, updateStudentHero, clearAllData } from "../db/database";
import { parseISODate } from "../utils/date";
import { CONTENT_MAX_WIDTH } from "../constants/layout";

interface StudentRow {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthday: string;
  sex: string | null;
  school: string | null;
  school_year: string | null;
  grade_level: number;
  section: string;
  strand: string | null;
  height_cm: number;
  weight_kg: number;
  sport: string;
  sports_category: string | null;
  coach: string | null;
  student_id: string;
}

interface LatestAssessmentRecord {
  id: number;
  test_key: string;
  test_date: string;
  assessment_phase: "pre-test" | "post-test";
  data: Record<string, string>;
}

function formatAssessmentDate(isoDate: string) {
  const date = parseISODate(isoDate);
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : isoDate;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [latestAssessments, setLatestAssessments] = useState<LatestAssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingHero, setEditingHero] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");

  const loadStudent = useCallback(async () => {
    const [row, assessmentRows] = await Promise.all([getStudent(), getLatestAssessmentRecords(4)]);
    setStudent(row);
    setLatestAssessments(assessmentRows as LatestAssessmentRecord[]);
    if (row) {
      setFirstName(row.first_name);
      setLastName(row.last_name);
      setGradeLevel(String(row.grade_level));
      setSection(row.section);
    }
    setLoading(false);
  }, []);

  // Reload every time the screen comes into focus, so edits made elsewhere (or via Clear App Data) stay in sync
  useFocusEffect(
    useCallback(() => {
      loadStudent();
    }, [loadStudent])
  );

  const handleSaveHero = async () => {
    await updateStudentHero({
      firstName,
      lastName,
      gradeLevel: parseInt(gradeLevel, 10) || 0,
      section,
    });
    await loadStudent();
    setEditingHero(false);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear App Data",
      "This deletes your profile, training logs, goals, and assessments from this device. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            navigation.reset({ index: 0, routes: [{ name: "Splash" }] });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="dashboard" />
        <SkeletonContent variant="profile" />
      </View>
    );
  }

  if (!student) {
    // Shouldn't normally happen — Splash routes to onboarding when no student exists — but guard anyway
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <Header mode="dashboard" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", textAlign: "center", color: COLORS.slate500 }}>No profile found. Please complete onboarding.</Text>
        </View>
      </View>
    );
  }

  const age = computeAge(student.birthday);
  const bmiInfo = getBMIInfo(student.weight_kg, student.height_cm);
  const bmiStyle = BMI_COLORS[bmiInfo.classification];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <Header mode="dashboard" />
      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, alignSelf: "center", paddingBottom: 24 }}>
        <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: RADIUS.card,
                  backgroundColor: COLORS.orange,
                  borderWidth: 4,
                  borderColor: "rgba(255,255,255,0.20)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: COLORS.white, fontSize: 36, fontFamily: "BricolageGrotesque_800ExtraBold" }}>
                  {student.first_name[0]}
                </Text>
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: -4,
                  left: -4,
                  width: 24,
                  height: 24,
                  borderRadius: 9999,
                  backgroundColor: COLORS.navy,
                  borderWidth: 2,
                  borderColor: COLORS.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10 }}>{SPORT_EMOJI[student.sport]}</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              {!editingHero ? (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", flex: 1 }}>
                      {student.first_name} {student.last_name}
                    </Text>
                    <GhostButton label="Edit" onPress={() => setEditingHero(true)} />
                  </View>
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 2 }}>
                    Grade {student.grade_level} – {student.section}
                  </Text>
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{student.student_id}</Text>
                  <View style={{ backgroundColor: COLORS.orange, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginTop: 8 }}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontFamily: "BricolageGrotesque_700Bold", textTransform: "uppercase" }}>
                      {student.sport}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput value={firstName} onChangeText={setFirstName} style={[{ fontFamily: "BricolageGrotesque_400Regular" }, heroInputStyle]} placeholderTextColor="rgba(255,255,255,0.4)" />
                    <TextInput value={lastName} onChangeText={setLastName} style={[{ fontFamily: "BricolageGrotesque_400Regular" }, heroInputStyle]} placeholderTextColor="rgba(255,255,255,0.4)" />
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput value={gradeLevel} onChangeText={setGradeLevel} keyboardType="numeric" style={[{ fontFamily: "BricolageGrotesque_400Regular" }, heroInputStyle]} placeholderTextColor="rgba(255,255,255,0.4)" />
                    <TextInput value={section} onChangeText={setSection} style={[{ fontFamily: "BricolageGrotesque_400Regular" }, heroInputStyle]} placeholderTextColor="rgba(255,255,255,0.4)" />
                  </View>
                  <TouchableOpacity
                    onPress={handleSaveHero}
                    style={{
                      borderWidth: 1,
                      borderColor: "#FB923C",
                      backgroundColor: "rgba(255,95,31,0.20)",
                      borderRadius: 8,
                      paddingVertical: 6,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontSize: 12, fontFamily: "BricolageGrotesque_700Bold" }}>Save Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -12, gap: 16 }}>
          <Card>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800 }}>
                Physical Stats
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.input, padding: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>{age}</Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, textTransform: "uppercase" }}>yrs</Text>
                <Text style={{ fontSize: 10, color: COLORS.slate500, fontFamily: "BricolageGrotesque_600SemiBold" }}>Age</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.input, padding: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>{student.height_cm}</Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, textTransform: "uppercase" }}>cm</Text>
                <Text style={{ fontSize: 10, color: COLORS.slate500, fontFamily: "BricolageGrotesque_600SemiBold" }}>Height</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.input, padding: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>{student.weight_kg}</Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 10, color: COLORS.slate400, textTransform: "uppercase" }}>kg</Text>
                <Text style={{ fontSize: 10, color: COLORS.slate500, fontFamily: "BricolageGrotesque_600SemiBold" }}>Weight</Text>
              </View>
            </View>

            <View style={{ borderWidth: 1, borderColor: `${bmiStyle.color}44`, borderRadius: RADIUS.input, overflow: "hidden" }}>
              <View style={{ backgroundColor: bmiStyle.bg, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular" }}>{bmiStyle.emoji}</Text>
                  <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_800ExtraBold", color: bmiStyle.color }}>
                    {bmiInfo.classification}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontFamily: "BricolageGrotesque_800ExtraBold", color: bmiStyle.color }}>
                  BMI {bmiInfo.bmi}
                </Text>
              </View>
              <View style={{ backgroundColor: "#FAFAFA", paddingHorizontal: 16, paddingVertical: 10 }}>
                <Text style={{ fontSize: 12, color: COLORS.slate600, fontFamily: "BricolageGrotesque_500Medium" }}>
                  {bmiInfo.guidance}
                </Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, marginTop: 2 }}>
                  Normal range for your height: {bmiInfo.normalWeightRangeKg[0]}–{bmiInfo.normalWeightRangeKg[1]} kg
                </Text>
              </View>
            </View>
          </Card>
          <Card>
            <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800, marginBottom: 12 }}>
              User Profile
            </Text>
            <View style={{ gap: 10 }}>
              {[
                { label: "First Name", value: student.first_name },
                { label: "Middle Name", value: student.middle_name },
                { label: "Last Name", value: student.last_name },
                { label: "Grade", value: String(student.grade_level) },
                { label: "Section", value: student.section },
                ...(student.strand ? [{ label: "Strand", value: student.strand }] : []),
                { label: "Sex", value: student.sex },
                { label: "School", value: student.school },
                { label: "School Year", value: student.school_year },
                { label: "Sports Category", value: student.sports_category },
                { label: "Coach / Teacher", value: student.coach || "Not set" },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
                  <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400 }}>{row.label}:</Text>
                  <Text style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate700 }}>{row.value || "—"}</Text>
                </View>
              ))}
            </View>
          </Card>
          

          <Card>
            <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", color: COLORS.slate800, marginBottom: 12 }}>
              Latest Assessment
            </Text>
            {latestAssessments.length === 0 ? (
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, lineHeight: 18, color: COLORS.slate400, textAlign: "center", paddingVertical: 12 }}>
                No fitness assessments recorded yet.
              </Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {latestAssessments.map((record) => {
                  const test = ASSESSMENT_TESTS.find((item) => item.key === record.test_key);
                  if (!test) return null;
                  const result = record.data[test.primaryField] || "—";
                  return (
                    <View key={record.id} style={{ width: "48.5%", minHeight: 104, backgroundColor: COLORS.surface, borderRadius: RADIUS.input, padding: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 18 }}>{test.emoji}</Text>
                        <Text numberOfLines={1} adjustsFontSizeToFit style={{ flex: 1, fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", color: COLORS.navy }}>
                          {result}{test.primaryUnit ? ` ${test.primaryUnit}` : ""}
                        </Text>
                      </View>
                      <Text numberOfLines={2} style={{ fontSize: 10, lineHeight: 13, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate600, marginTop: 6 }}>
                        {test.testName ?? test.name}
                      </Text>
                      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 9, color: COLORS.slate400, marginTop: 3 }}>
                        {record.assessment_phase === "post-test" ? "Post-Test" : "Pre-Test"} · {formatAssessmentDate(record.test_date)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <Card padded={false} style={{ overflow: "hidden" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SportDrills")}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.slate50 }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 20 }}>{SPORT_EMOJI[student.sport] ?? "🏅"}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate700 }}>My Sport & Drills</Text>
              <IconChevronRight />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Assessment")}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 20 }}>📊</Text>
              <Text style={{ flex: 1, fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: COLORS.slate700 }}>Fitness Assessment Tracker</Text>
              <IconChevronRight />
            </TouchableOpacity>
          </Card>

          <View style={{ backgroundColor: COLORS.green100, borderRadius: RADIUS.input, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: COLORS.green500 }} />
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.green700 }}>All profile data is stored on this device only</Text>
          </View>

          <TouchableOpacity
            onPress={handleClearData}
            style={{
              backgroundColor: COLORS.red100,
              borderRadius: RADIUS.full,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.red500 }}>🗑 Clear App Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const heroInputStyle = {
  flex: 1,
  backgroundColor: "rgba(255,255,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
  color: COLORS.white,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
  fontSize: 14,
};

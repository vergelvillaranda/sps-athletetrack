import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, STRANDS } from "../../constants/theme";
import { useOnboarding } from "../../context/OnboardingContext";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingFooter from "../../components/onboarding/OnboardingFooter";
import { FORM_MAX_WIDTH } from "../../constants/layout";

const GRADES = [7, 8, 9, 10, 11, 12];
const today = new Date();
const currentSchoolYearStart = today.getMonth() < 5 ? today.getFullYear() - 1 : today.getFullYear();
const SCHOOL_YEARS = Array.from({ length: 6 }, (_, index) => {
  const startYear = currentSchoolYearStart - 2 + index;
  return `${startYear}-${startYear + 1}`;
});

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", marginBottom: 8 }}>
      <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 0.96 }}>
        {label}{" "}
      </Text>
      {required ? <Text style={{ color: COLORS.orange, fontFamily: "BricolageGrotesque_700Bold" }}>*</Text> : null}
      {hint ? <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 10, textTransform: "none" }}> {hint}</Text> : null}
    </Text>
  );
}

const inputStyle = {
  width: "100%" as const,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.slate200,
  backgroundColor: COLORS.slate50,
  color: COLORS.slate700,
  fontSize: 14,
  fontFamily: "BricolageGrotesque_500Medium",
};

export default function AcademicInfo() {
  const navigation = useNavigation<any>();
  const { data, updateData } = useOnboarding();
  const [schoolYearOpen, setSchoolYearOpen] = useState(false);
  const isSHS = data.gradeLevel === 11 || data.gradeLevel === 12;

  const canContinue = !!(data.gradeLevel && data.section && data.school && data.schoolYear && (!isSHS || data.strand));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <OnboardingHeader
        step={2}
        title="Academic Info"
        subtitle="Your grade, section, and strand."
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: FORM_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 24, gap: 20 }} style={{ flex: 1 }}>
        <View>
          <FieldLabel label="Grade Level" required />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {GRADES.map((g) => {
              const active = data.gradeLevel === g;
              const isJHS = g <= 10;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => updateData({ gradeLevel: g, strand: g <= 10 ? null : data.strand })}
                  style={{
                    width: "31%",
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: active ? COLORS.orange : COLORS.slate200,
                    backgroundColor: active ? COLORS.navy : COLORS.white,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", color: active ? COLORS.white : COLORS.navy }}>
                    Gr. {g}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: "BricolageGrotesque_600SemiBold",
                      color: active ? "rgba(255,255,255,0.60)" : COLORS.slate400,
                      marginTop: 2,
                    }}
                  >
                    {isJHS ? "JHS" : "SHS"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <FieldLabel label="Section" required />
          <TextInput
            placeholder="e.g. STEM-A"
            placeholderTextColor={COLORS.slate400}
            value={data.section}
            onChangeText={(v) => updateData({ section: v })}
            style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
          />
        </View>
        <View>
  <FieldLabel label="School" required />
  <TextInput
    value={data.school}
    onChangeText={(v) => updateData({ school: v })}
    style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
  />
</View>

        <View>
          <FieldLabel label="School Year" required />
          <TouchableOpacity
            onPress={() => setSchoolYearOpen((open) => !open)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ expanded: schoolYearOpen }}
            accessibilityLabel="Select school year"
            style={{
              ...inputStyle,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: COLORS.white,
              borderColor: schoolYearOpen ? COLORS.orange : COLORS.slate200,
            }}
          >
            <Text
              style={{
                color: data.schoolYear ? COLORS.slate700 : COLORS.slate400,
                fontSize: 14,
                fontFamily: "BricolageGrotesque_500Medium",
              }}
            >
              {data.schoolYear || "Select school year"}
            </Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: schoolYearOpen ? COLORS.orange : COLORS.slate400, fontSize: 18 }}>
              {schoolYearOpen ? "⌃" : "⌄"}
            </Text>
          </TouchableOpacity>

          {schoolYearOpen ? (
            <View
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: COLORS.slate200,
                borderRadius: 12,
                backgroundColor: COLORS.white,
                overflow: "hidden",
              }}
            >
              {SCHOOL_YEARS.map((schoolYear, index) => {
                const selected = data.schoolYear === schoolYear;
                return (
                  <TouchableOpacity
                    key={schoolYear}
                    onPress={() => {
                      updateData({ schoolYear });
                      setSchoolYearOpen(false);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      backgroundColor: selected ? COLORS.orange50 : COLORS.white,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: COLORS.slate100,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? COLORS.orange : COLORS.slate700,
                        fontSize: 14,
                        fontFamily: selected ? "BricolageGrotesque_700Bold" : "BricolageGrotesque_500Medium",
                      }}
                    >
                      {schoolYear}
                    </Text>
                    {selected ? <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.orange, fontSize: 16 }}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {isSHS ? (
          <View>
            <FieldLabel label="Strand" required hint="(Senior High School)" />
            <View style={{ gap: 8 }}>
              {STRANDS.map((s) => {
                const active = data.strand === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => updateData({ strand: s })}
                    style={{
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: active ? COLORS.orange : "#CBD5E1",
                      backgroundColor: active ? COLORS.orange50 : COLORS.white,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 9999,
                        borderWidth: 2,
                        borderColor: active ? COLORS.orange : "#CBD5E1",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active ? <View style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: COLORS.orange }} /> : null}
                    </View>
                    <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: active ? COLORS.navy : COLORS.slate600 }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <OnboardingFooter label="Continue →" disabled={!canContinue} onPress={() => navigation.navigate("OnboardingPhysicalStats")} />
    </View>
  );
}

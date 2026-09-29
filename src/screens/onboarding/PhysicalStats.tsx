import React, { useMemo } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, BMI_COLORS } from "../../constants/theme";
import { useOnboarding } from "../../context/OnboardingContext";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingFooter from "../../components/onboarding/OnboardingFooter";
import { computeAge, getBMIInfo } from "../../utils/bmi";
import { parseISODate } from "../../utils/date";
import { FORM_MAX_WIDTH } from "../../constants/layout";

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

function formatBirthdate(birthday: string) {
  const d = parseISODate(birthday);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function PhysicalStats() {
  const navigation = useNavigation<any>();
  const { data, updateData } = useOnboarding();

  const age = useMemo(() => {
    if (!data.birthday) return null;
    const a = computeAge(data.birthday);
    return isNaN(a) ? null : a;
  }, [data.birthday]);

  const bmiInfo = useMemo(() => {
    const h = parseFloat(data.heightCm);
    const w = parseFloat(data.weightKg);
    if (!h || !w) return null;
    return getBMIInfo(w, h);
  }, [data.heightCm, data.weightKg]);

  const bmiStyle = bmiInfo ? BMI_COLORS[bmiInfo.classification] : null;
  const canContinue = !!(data.heightCm && data.weightKg);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <OnboardingHeader
        step={3}
        title="Physical Stats"
        subtitle="Used to track your fitness progress."
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: FORM_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 24, gap: 20 }} style={{ flex: 1 }}>
        {/* Age display card — TODO: swap flat navy800 for a real gradient via expo-linear-gradient if you add that dependency */}
        <View style={{ backgroundColor: COLORS.navy800, borderRadius: 16, padding: 16, flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 24 }}>🎂</Text>
          </View>
          <View>
            <Text
              style={{
                color: "rgba(255,255,255,0.50)",
                fontSize: 10,
                fontFamily: "BricolageGrotesque_600SemiBold",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Age (from birthday)
            </Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular" }}>
              <Text style={{ color: COLORS.white, fontSize: 30, fontFamily: "BricolageGrotesque_800ExtraBold" }}>{age ?? "–"}</Text>
              <Text style={{ color: "rgba(255,255,255,0.50)", fontSize: 16, fontFamily: "BricolageGrotesque_600SemiBold" }}> yrs</Text>
            </Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: "rgba(255,255,255,0.40)", fontSize: 10, marginTop: 2 }}>{formatBirthdate(data.birthday)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel label="Height" required hint="(in cm)" />
            <TextInput
              placeholder="e.g. 175"
              placeholderTextColor={COLORS.slate400}
              keyboardType="numeric"
              value={data.heightCm}
              onChangeText={(v) => updateData({ heightCm: v })}
              style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel label="Weight" required hint="(in kg)" />
            <TextInput
              placeholder="e.g. 68"
              placeholderTextColor={COLORS.slate400}
              keyboardType="numeric"
              value={data.weightKg}
              onChangeText={(v) => updateData({ weightKg: v })}
              style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
            />
          </View>
        </View>

        {bmiInfo && bmiStyle ? (
          <View style={{ borderWidth: 1, borderColor: `${bmiStyle.color}44`, borderRadius: 12, overflow: "hidden" }}>
            <View
              style={{
                backgroundColor: bmiStyle.bg,
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
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
              <Text style={{ fontSize: 12, color: COLORS.slate600, fontFamily: "BricolageGrotesque_500Medium" }}>{bmiInfo.guidance}</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate400, marginTop: 2 }}>
                Healthy range for your height: {bmiInfo.normalWeightRangeKg[0]}–{bmiInfo.normalWeightRangeKg[1]} kg
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ borderWidth: 1, borderColor: COLORS.slate200, borderStyle: "dashed", borderRadius: 12, padding: 14, flexDirection: "row", gap: 10 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 14 }}>✏️</Text>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate500, fontSize: 12, lineHeight: 17, flex: 1 }}>
            You can edit this later. Height, weight, and other profile details can be updated anytime from your Profile screen.
          </Text>
        </View>
      </ScrollView>

      <OnboardingFooter label="Continue →" disabled={!canContinue} onPress={() => navigation.navigate("OnboardingSportSelection")} />
    </View>
  );
}

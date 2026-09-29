import React, { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../constants/theme";
import { useOnboarding } from "../../context/OnboardingContext";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingFooter from "../../components/onboarding/OnboardingFooter";
import DateInput from "../../components/DateInput";
import { computeAge } from "../../utils/bmi";
import { parseISODate } from "../../utils/date";
import { FORM_MAX_WIDTH } from "../../constants/layout";

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <Text style={{ fontFamily: "BricolageGrotesque_400Regular", marginBottom: 8 }}>
      <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 0.96 }}>
        {label}{" "}
      </Text>
      {required ? <Text style={{ color: COLORS.orange, fontFamily: "BricolageGrotesque_700Bold" }}>*</Text> : null}
      {hint ? <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 10 }}> ({hint})</Text> : null}
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

export default function PersonalInfo() {
  const navigation = useNavigation<any>();
  const { data, updateData } = useOnboarding();
  const [birthdayTouched, setBirthdayTouched] = useState(false);
  const birthdayDate = parseISODate(data.birthday);
  const birthdayError = data.birthday
    ? !birthdayDate
      ? "Enter a valid date in YYYY/MM/DD format."
      : birthdayDate > new Date()
        ? "Birthday cannot be in the future."
        : null
    : birthdayTouched
      ? "Birthday is required."
      : null;

  const age = useMemo(() => {
    if (!birthdayDate) return null;
    const a = computeAge(data.birthday);
    return isNaN(a) || a < 0 ? null : a;
  }, [birthdayDate, data.birthday]);

  const canContinue = !!(data.firstName && data.lastName && birthdayDate && !birthdayError && data.sex);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <OnboardingHeader step={1} title="Your Name & Birthday" subtitle="Your identity on this device." />

      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: FORM_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 24, gap: 20 }} style={{ flex: 1 }}>
        <View>
          <FieldLabel label="First Name" required />
          <TextInput
            placeholder="e.g. Marco"
            placeholderTextColor={COLORS.slate400}
            value={data.firstName}
            onChangeText={(v) => updateData({ firstName: v })}
            style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
          />
        </View>

        <View>
          <FieldLabel label="Middle Name" hint="optional" />
          <TextInput
            placeholder="e.g. Buenaventura"
            placeholderTextColor={COLORS.slate400}
            value={data.middleName}
            onChangeText={(v) => updateData({ middleName: v })}
            style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
          />
        </View>

        <View>
          <FieldLabel label="Last Name" required />
          <TextInput
            placeholder="e.g. Reyes"
            placeholderTextColor={COLORS.slate400}
            value={data.lastName}
            onChangeText={(v) => updateData({ lastName: v })}
            style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
          />
        </View>

        <View>
          <FieldLabel label="Birthday" required />
          <DateInput
            value={data.birthday}
            onChangeText={(birthday) => updateData({ birthday })}
            onBlur={() => setBirthdayTouched(true)}
            onDateSelected={() => setBirthdayTouched(true)}
            error={birthdayError}
            maximumDate={new Date()}
          />
        </View>
        <View>
  <FieldLabel label="Sex" required />
  <View style={{ flexDirection: "row", gap: 8 }}>
    {["Male", "Female"].map((option) => {
      const active = data.sex === option;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => updateData({ sex: option })}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 2,
            alignItems: "center",
            backgroundColor: active ? COLORS.navy : COLORS.white,
            borderColor: active ? COLORS.orange : COLORS.slate200,
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: "BricolageGrotesque_600SemiBold", color: active ? COLORS.white : COLORS.slate600 }}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>

        {age !== null ? (
          <View
            style={{
              width: "100%",
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 16 }}>🎂</Text>
            <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 14 }}>
              <Text style={{ color: COLORS.slate600, fontFamily: "BricolageGrotesque_400Regular" }}>You are </Text>
              <Text style={{ color: COLORS.navy, fontFamily: "BricolageGrotesque_800ExtraBold" }}>{age}</Text>
              <Text style={{ color: COLORS.slate600, fontFamily: "BricolageGrotesque_400Regular" }}> years old</Text>
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <OnboardingFooter label="Continue →" disabled={!canContinue} onPress={() => navigation.navigate("OnboardingAcademicInfo")} />
    </View>
  );
}

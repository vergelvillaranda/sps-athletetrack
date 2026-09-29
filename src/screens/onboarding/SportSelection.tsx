import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { COLORS, SPORTS, SPORT_EMOJI } from "../../constants/theme";
import { SPORT_CATEGORY } from "../../constants/sportsData";
import { useOnboarding } from "../../context/OnboardingContext";
import { insertStudent } from "../../db/database";
import { parseISODate, toISODate } from "../../utils/date";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingFooter from "../../components/onboarding/OnboardingFooter";
import { FORM_MAX_WIDTH, TABLET_BREAKPOINT } from "../../constants/layout";

function SpinningRing() {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <Animated.View
      style={[
        { width: 32, height: 32, borderRadius: 9999, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" },
        style,
      ]}
    />
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

export default function SportSelection() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const { data, updateData, reset } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const columnCount = width >= TABLET_BREAKPOINT ? 4 : width < 360 ? 2 : 3;
  const gridWidth = Math.min(width, FORM_MAX_WIDTH) - 40;
  const tileWidth = (gridWidth - 12 * (columnCount - 1)) / columnCount;

  const handleFinish = async () => {
    if (!data.sport) return;
    const birthday = parseISODate(data.birthday);
    if (!birthday) return;
    setSaving(true);
    try {
      await insertStudent({
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        birthday: toISODate(birthday),
        sex: data.sex ?? undefined,
        school: data.school,
        schoolYear: data.schoolYear,
        gradeLevel: data.gradeLevel ?? 7,
        section: data.section,
        strand: data.strand ?? undefined,
        heightCm: parseFloat(data.heightCm) || 0,
        weightKg: parseFloat(data.weightKg) || 0,
        sport: data.sport,
        sportsCategory: SPORT_CATEGORY[data.sport],
        coach: data.coach || undefined,
        studentId: `SPS-${Date.now().toString().slice(-6)}`, // TODO: replace with your school's real ID format
      });
      setTimeout(() => {
        reset();
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }, 1000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 32 }}>⚡</Text>
        </View>
        <SpinningRing />
        <Text style={{ color: "rgba(255,255,255,0.70)", fontSize: 14, fontFamily: "BricolageGrotesque_500Medium", marginTop: 16 }}>
          Setting up your profile…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <OnboardingHeader
        step={4}
        title="Select Your Sport"
        subtitle="Sets your drills and training focus."
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        key={columnCount}
        data={SPORTS}
        numColumns={columnCount}
        keyExtractor={(item) => item}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ width: "100%", maxWidth: FORM_MAX_WIDTH, alignSelf: "center", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, gap: 12 }}
        ListFooterComponent={
          <View style={{ gap: 16, marginTop: 8 }}>
            <View style={{ backgroundColor: COLORS.orange50, borderRadius: 12, padding: 12, flexDirection: "row", gap: 8 }}>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 14 }}>🏅</Text>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: "#C2410C", fontSize: 12, lineHeight: 17, flex: 1 }}>
                Your sport sets your recommended drills and training activities. You can change this later from your Profile.
              </Text>
            </View>

            <View>
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.slate500, textTransform: "uppercase", letterSpacing: 0.96 }}>
                  Coach / Teacher{" "}
                </Text>
                <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 10 }}> (optional)</Text>
              </Text>
              <TextInput
                placeholder="e.g. Coach Santos"
                placeholderTextColor={COLORS.slate400}
                value={data.coach}
                onChangeText={(v) => updateData({ coach: v })}
                style={[{ fontFamily: "BricolageGrotesque_400Regular" }, inputStyle]}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const active = data.sport === item;
          return (
            <TouchableOpacity
              onPress={() => updateData({ sport: item })}
              style={{
                width: tileWidth,
                minHeight: 86,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: active ? COLORS.orange : COLORS.slate200,
                backgroundColor: active ? COLORS.navy : COLORS.white,
                padding: 12,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 24 }}>{SPORT_EMOJI[item]}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "BricolageGrotesque_600SemiBold",
                  color: active ? COLORS.white : COLORS.slate700,
                  textAlign: "center",
                  lineHeight: 13,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <OnboardingFooter label="Create My Profile →" disabled={!data.sport} onPress={handleFinish} />
    </View>
  );
}

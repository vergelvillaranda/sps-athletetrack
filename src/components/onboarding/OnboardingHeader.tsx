import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { COLORS } from "../../constants/theme";
import { IconBack } from "../icons";
import ResponsiveContainer from "../ResponsiveContainer";
import { FORM_MAX_WIDTH } from "../../constants/layout";

interface Props {
  step: number; // 1-4
  title: string;
  subtitle: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function OnboardingHeader({ step, title, subtitle, showBack, onBack }: Props) {
  return (
    <View style={{ backgroundColor: COLORS.navy, paddingTop: 48, paddingBottom: 20 }}>
      <ResponsiveContainer maxWidth={FORM_MAX_WIDTH} style={{ paddingHorizontal: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: COLORS.navy800,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.16)",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../../assets/images/logosps.jpeg")}
              style={{ width: 38, height: 38, borderRadius: 11 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase" }}>
            SPS AthleteTrack
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: "#4ADE80" }} />
          <Text style={{ color: "#4ADE80", fontSize: 9, fontFamily: "BricolageGrotesque_600SemiBold", textTransform: "uppercase" }}>
            Offline
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              backgroundColor: s <= step ? COLORS.orange : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </View>

      {showBack ? (
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8, alignSelf: "flex-start" }}>
          <IconBack size={20} color={COLORS.white} />
        </TouchableOpacity>
      ) : null}

      <Text
        style={{
          color: "rgba(255,255,255,0.50)",
          fontSize: 10,
          fontFamily: "BricolageGrotesque_600SemiBold",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 4,
        }}
      >
        Step {step} of 4
      </Text>
      <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: "rgba(255,255,255,0.50)", fontSize: 12 }}>{subtitle}</Text>
      </ResponsiveContainer>
    </View>
  );
}

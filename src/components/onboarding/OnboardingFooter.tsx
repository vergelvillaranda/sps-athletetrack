import React from "react";
import { View, Text, Pressable } from "react-native";
import { COLORS } from "../../constants/theme";
import ResponsiveContainer from "../ResponsiveContainer";
import { FORM_MAX_WIDTH } from "../../constants/layout";

interface Props {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export default function OnboardingFooter({ label, disabled, loading, onPress }: Props) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <View style={{ backgroundColor: COLORS.white, paddingTop: 12, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.slate100 }}>
      <ResponsiveContainer maxWidth={FORM_MAX_WIDTH} style={{ paddingHorizontal: 20 }}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        hitSlop={8}
        style={({ pressed }) => ({
          width: "100%",
          height: 56,
          borderRadius: 16,
          backgroundColor: isDisabled ? COLORS.slate200 : COLORS.orange,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text
          pointerEvents="none"
          style={{ color: COLORS.white, fontSize: 16, fontFamily: "BricolageGrotesque_800ExtraBold", textTransform: "uppercase", letterSpacing: 0.96 }}
        >
          {loading ? "Saving…" : label}
        </Text>
      </Pressable>
      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 11, textAlign: "center", marginTop: 8 }}>
        🔒 All data stored on this device only — no internet needed
      </Text>
      </ResponsiveContainer>
    </View>
  );
}

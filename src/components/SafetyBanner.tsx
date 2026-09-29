import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS, RADIUS, SHADOW_SM } from "../constants/theme";

export default function SafetyBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.card,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.orange,
        padding: 14,
        flexDirection: "row",
        gap: 10,
        ...SHADOW_SM,
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 18 }}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontFamily: "BricolageGrotesque_700Bold", color: COLORS.orange, textTransform: "uppercase", marginBottom: 4 }}>
          Safety Reminder
        </Text>
        <Text style={{ fontFamily: "BricolageGrotesque_400Regular", fontSize: 12, color: COLORS.slate600, lineHeight: 17 }}>
          Perform exercises and drills according to your teacher's or coach's instructions. Always use appropriate
          facilities and equipment. Warm up before physical activity, use proper technique, and stop if you
          experience pain, dizziness, or unusual discomfort. High-risk or contact activities should be performed
          only with proper supervision and protective equipment.
        </Text>
      </View>
      {onDismiss ? (
        <TouchableOpacity
          onPress={onDismiss}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Dismiss safety reminder"
          hitSlop={10}
          style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center", marginTop: -5, marginRight: -5 }}
        >
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 22, lineHeight: 24 }}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

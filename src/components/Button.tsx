import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, useWindowDimensions } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import { TYPE } from "../constants/typography";
import { CONTENT_MAX_WIDTH } from "../constants/layout";

interface PrimaryProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={{
        width: "100%",
        height: 56,
        borderRadius: RADIUS.card,
        backgroundColor: disabled ? COLORS.slate200 : COLORS.orange,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[{ fontFamily: "BricolageGrotesque_400Regular" }, TYPE.buttonPrimary, { color: COLORS.white }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

interface OutlineProps {
  label: string;
  onPress: () => void;
}

export function OutlineButton({ label, onPress }: OutlineProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.orange100,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: COLORS.orange, fontSize: 11, fontFamily: "BricolageGrotesque_600SemiBold" }}>{label}</Text>
    </TouchableOpacity>
  );
}

interface GhostProps {
  label: string;
  onPress: () => void;
}

export function GhostButton({ label, onPress }: GhostProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.20)",
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.70)", fontSize: 10, fontFamily: "BricolageGrotesque_600SemiBold" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface FABProps {
  label: string;
  onPress: () => void;
}

export function FAB({ label, onPress }: FABProps) {
  const { width } = useWindowDimensions();
  const responsiveRight = Math.max(16, (width - CONTENT_MAX_WIDTH) / 2 + 16);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        position: "absolute",
        bottom: 24,
        right: responsiveRight,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.orange,
        borderRadius: RADIUS.full,
        height: 48,
        paddingLeft: 16,
        paddingRight: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.white, fontSize: 24, marginRight: 8, fontWeight: "600" }}>+</Text>
      <Text style={[{ fontFamily: "BricolageGrotesque_400Regular" }, TYPE.badge, { color: COLORS.white, fontSize: 15, letterSpacing: 0.9 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

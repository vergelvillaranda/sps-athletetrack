import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW_SM } from "../constants/theme";

interface Props extends ViewProps {
  variant?: "standard" | "navySub" | "surfaceTile";
  padded?: boolean;
}

export default function Card({ variant = "standard", padded = true, style, children, ...rest }: Props) {
  const variantStyle =
    variant === "navySub"
      ? { backgroundColor: COLORS.navy800, borderRadius: RADIUS.card }
      : variant === "surfaceTile"
      ? { backgroundColor: COLORS.surface, borderRadius: RADIUS.input }
      : { backgroundColor: COLORS.white, borderRadius: RADIUS.cardLg, ...SHADOW_SM };

  return (
    <View style={[variantStyle, padded ? styles.padded : null, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: 16 },
});
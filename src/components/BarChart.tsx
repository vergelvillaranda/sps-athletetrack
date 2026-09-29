import React from "react";
import { View, Text } from "react-native";
import { COLORS } from "../constants/theme";

interface Bar {
  value: number;
  label: string;
}

interface Props {
  bars: Bar[];
  color?: string;
  maxHeight?: number;
}

export default function BarChart({ bars, color = COLORS.orange, maxHeight = 72 }: Props) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 4, height: maxHeight + 32 }}>
      {bars.map((b, i) => {
        const isLatest = i === bars.length - 1;
        const height = Math.max((b.value / max) * maxHeight, 6);
        return (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text
              style={{
                fontSize: 9,
                fontFamily: "BricolageGrotesque_600SemiBold",
                color: isLatest ? color : COLORS.slate400,
              }}
            >
              {b.value}
            </Text>
            <View
              style={{
                width: "100%",
                height,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                backgroundColor: isLatest ? color : `${color}44`,
              }}
            />
            <Text style={{ fontSize: 9, color: COLORS.slate400, fontFamily: "BricolageGrotesque_500Medium" }}>
              {b.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
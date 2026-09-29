import React from "react";
import { View, Text } from "react-native";
import { RADIUS } from "../constants/theme";
import { TYPE } from "../constants/typography";

interface Props {
  label: string;
  bg: string;
  color: string;
}

export default function Badge({ label, bg, color }: Props) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: RADIUS.full,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: "flex-start",
      }}
    >
      <Text style={[{ fontFamily: "BricolageGrotesque_400Regular" }, TYPE.badge, { color }]}>{label}</Text>
    </View>
  );
}
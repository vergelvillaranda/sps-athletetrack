import React from "react";
import { View, ViewProps } from "react-native";
import { CONTENT_MAX_WIDTH } from "../constants/layout";

interface Props extends ViewProps {
  maxWidth?: number;
}

export default function ResponsiveContainer({ maxWidth = CONTENT_MAX_WIDTH, style, ...props }: Props) {
  return <View style={[{ width: "100%", maxWidth, alignSelf: "center" }, style]} {...props} />;
}

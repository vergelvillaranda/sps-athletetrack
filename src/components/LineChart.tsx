import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { COLORS } from "../constants/theme";

interface Point {
  value: number;
  label: string;
}

interface Props {
  points: Point[];
  color?: string;
}

const W = 300;
const H = 110;
const PAD = { top: 12, right: 12, bottom: 24, left: 12 };

export default function LineChart({ points, color = COLORS.orange }: Props) {
  if (points.length === 0) return null;

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = PAD.left + (i / Math.max(points.length - 1, 1)) * chartW;
    const y = PAD.top + chartH - ((p.value - min) / range) * chartH;
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${PAD.top + chartH} L ${coords[0].x} ${
    PAD.top + chartH
  } Z`;

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.22} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {[0, 0.5, 1].map((frac) => {
          const y = PAD.top + chartH * frac;
          return (
            <Line
              key={frac}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke={COLORS.slate200}
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          );
        })}

        <Path d={areaPath} fill="url(#areaFill)" stroke="none" />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => {
          const isLatest = i === coords.length - 1;
          return (
            <Circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={4.5}
              fill={isLatest ? color : COLORS.white}
              stroke={color}
              strokeWidth={2}
            />
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, marginTop: -8 }}>
        {points.map((p, i) => (
          <Text key={i} style={{ fontSize: 9, color: COLORS.slate400, fontFamily: "BricolageGrotesque_500Medium" }}>
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
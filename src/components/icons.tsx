import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function IconHome({ size = 22, color = "#94A3B8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 11l9-8 9 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconDumbbell({ size = 22, color = "#94A3B8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="9" width="3" height="6" rx="1" fill={color} />
      <Rect x="20" y="9" width="3" height="6" rx="1" fill={color} />
      <Rect x="4" y="7" width="2.5" height="10" rx="1" fill={color} />
      <Rect x="17.5" y="7" width="2.5" height="10" rx="1" fill={color} />
      <Rect x="6.5" y="11" width="11" height="2" fill={color} />
    </Svg>
  );
}

export function IconTarget({ size = 22, color = "#94A3B8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

export function IconBook({ size = 22, color = "#94A3B8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5.5A2.5 2.5 0 016.5 3H12v18H6.5A2.5 2.5 0 014 18.5v-13z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M20 5.5A2.5 2.5 0 0017.5 3H12v18h5.5a2.5 2.5 0 002.5-2.5v-13z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconUser({ size = 22, color = "#94A3B8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
      <Path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function IconTrendUp({ size = 16, color = "#16A34A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17l6-6 4 4 8-9" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 6h6v6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconTrendDown({ size = 16, color = "#DC2626" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7l6 6 4-4 8 9" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 18h6v-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconPlus({ size = 24, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export function IconChevronRight({ size = 16, color = "#94A3B8" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBack({ size = 20, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19l-7-7 7-7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconEdit({ size = 16, color = "#FF5F1F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20l1-4.5L15.5 5l3.5 3.5L8.5 19 4 20z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconTrash({ size = 16, color = "#DC2626" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v5M14 11v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck({ size = 14, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12l6 6L20 6" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconCalendar({ size = 20, color = "#64748B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 14h2M14 14h2M8 17h2M14 17h2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function IconStar({ size = 20, color = "#FF5F1F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.4 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2z"
        fill={color}
      />
    </Svg>
  );
}

export function IconFire({ size = 20, color = "#FF5F1F" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c1 3-3 4-3 8a3 3 0 106 0c1.5 1 2 3 2 4.5A5.5 5.5 0 016.5 20 6 6 0 015 13c0-4 3-6 4-8 1 1 1 2 1 3 1-1 2-3 2-6z"
        fill={color}
      />
    </Svg>
  );
}

export function IconWifiOff({ size = 12, color = "#16A34A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 2l20 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 9a13 13 0 0114 0M8 13a8 8 0 018 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="12" cy="18" r="1.2" fill={color} />
    </Svg>
  );
}

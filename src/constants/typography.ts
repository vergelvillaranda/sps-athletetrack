import { TextStyle } from "react-native";

export const FONT = {
  extraLight: "BricolageGrotesque_200ExtraLight",
  regular: "BricolageGrotesque_400Regular",
  medium: "BricolageGrotesque_500Medium",
  semiBold: "BricolageGrotesque_600SemiBold",
  bold: "BricolageGrotesque_700Bold",
  extraBold: "BricolageGrotesque_800ExtraBold",
};

export const TYPE: Record<string, TextStyle> = {
  heroTitle: { fontFamily: FONT.extraBold, fontSize: 46, lineHeight: 46, letterSpacing: -0.4 },
  screenTitle: { fontFamily: FONT.extraBold, fontSize: 24, lineHeight: 26.4, letterSpacing: 0, textTransform: "uppercase" },
  cardHeading: { fontFamily: FONT.extraBold, fontSize: 22, lineHeight: 22, letterSpacing: 0 },
  sectionHeading: { fontFamily: FONT.extraBold, fontSize: 16, lineHeight: 19.2, letterSpacing: 0, textTransform: "uppercase" },
  headerAppName: { fontFamily: FONT.extraBold, fontSize: 17, lineHeight: 17, letterSpacing: 0.17, textTransform: "uppercase" },
  statNumber: { fontFamily: FONT.extraBold, fontSize: 24, lineHeight: 24, letterSpacing: 0 },
  navLabel: { fontFamily: FONT.semiBold, fontSize: 10, lineHeight: 10, letterSpacing: 0 },
  body: { fontFamily: FONT.semiBold, fontSize: 14, lineHeight: 19.6, letterSpacing: 0 },
  bodyRegular: { fontFamily: FONT.medium, fontSize: 14, lineHeight: 21, letterSpacing: 0 },
  label: { fontFamily: FONT.bold, fontSize: 12, lineHeight: 14.4, letterSpacing: 0.96, textTransform: "uppercase" },
  caption: { fontFamily: FONT.semiBold, fontSize: 10, lineHeight: 13, letterSpacing: 0 },
  micro: { fontFamily: FONT.medium, fontSize: 9, lineHeight: 10.8, letterSpacing: 0.18 },
  buttonPrimary: { fontFamily: FONT.extraBold, fontSize: 16, lineHeight: 16, letterSpacing: 0.96, textTransform: "uppercase" },
  badge: { fontFamily: FONT.bold, fontSize: 10, lineHeight: 10, letterSpacing: 0.3, textTransform: "uppercase" },
  stepLabel: { fontFamily: FONT.semiBold, fontSize: 10, lineHeight: 10, letterSpacing: 1.2, textTransform: "uppercase" },
};
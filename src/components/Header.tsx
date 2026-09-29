import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/theme";
import { IconBack } from "./icons";
import { Image } from "react-native";
import ResponsiveContainer from "./ResponsiveContainer";

interface Props {
  mode: "dashboard" | "back";
  title?: string;
}

function PinIcon({ size = 9, color = "rgba(255,255,255,0.45)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s7-7.58 7-12.5A7 7 0 105 9.5C5 14.42 12 22 12 22z" fill={color} />
      <Path d="M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" fill="#0B2264" />
    </Svg>
  );
}

export default function Header({ mode, title }: Props) {
  const navigation = useNavigation();

  return (
    <View style={{ backgroundColor: COLORS.navy, paddingTop: 40, paddingBottom: 12 }}>
      <ResponsiveContainer style={{ paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      {mode === "dashboard" ? (
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: COLORS.navy800,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../assets/images/logosps.jpeg")}
              style={{ width: 24, height: 24, borderRadius: 6 }}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text
              style={{
                color: COLORS.white,
                fontSize: 17,
                fontFamily: "BricolageGrotesque_800ExtraBold",
                textTransform: "uppercase",
                letterSpacing: 0.17,
              }}
            >
              SPS AthleteTrack
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <PinIcon />
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "BricolageGrotesque_500Medium" }}>
                Basud, Camarines Norte
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: "row", gap: 12, alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <IconBack />
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: COLORS.white, fontSize: 18, fontFamily: "BricolageGrotesque_700Bold", flexShrink: 1 }}
          >
            {title}
          </Text>
        </View>
      )}
      </ResponsiveContainer>
    </View>
  );
}

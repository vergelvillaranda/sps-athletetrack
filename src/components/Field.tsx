import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import { TYPE } from "../constants/typography";

interface Props extends TextInputProps {
  label: string;
  required?: boolean;
  hint?: string;
}

export default function Field({ label, required, hint, style, ...rest }: Props) {
  return (
    <View>
      <Text style={{ fontFamily: "BricolageGrotesque_400Regular", marginBottom: 8 }}>
        <Text style={[{ fontFamily: "BricolageGrotesque_400Regular" }, TYPE.label, { color: COLORS.slate500 }]}>{label} </Text>
        {required ? <Text style={[{ fontFamily: "BricolageGrotesque_400Regular" }, TYPE.label, { color: COLORS.orange }]}>*</Text> : null}
        {hint ? (
          <Text style={{ fontFamily: "BricolageGrotesque_400Regular", color: COLORS.slate400, fontSize: 10, textTransform: "none" }}> ({hint})</Text>
        ) : null}
      </Text>
      <TextInput
        placeholderTextColor={COLORS.slate400}
        style={[{ fontFamily: "BricolageGrotesque_400Regular" }, 
          {
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: RADIUS.input,
            borderWidth: 1,
            borderColor: COLORS.slate200,
            backgroundColor: COLORS.slate50,
            color: COLORS.slate700,
            fontSize: 14,
            fontFamily: "BricolageGrotesque_500Medium",
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
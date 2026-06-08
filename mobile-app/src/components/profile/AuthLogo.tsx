import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type AuthLogoProps = {
  showAi?: boolean;
};

export function AuthLogo({ showAi = false }: AuthLogoProps) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require("../../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        <Text style={styles.brand}>Wound</Text>
        <Text style={styles.care}>Care</Text>
        {showAi ? <Text style={styles.ai}> AI</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 28
  },
  logo: {
    width: 60,
    height: 60
  },
  title: {
    fontSize: 34,
    fontWeight: "800"
  },
  brand: {
    color: colors.brand
  },
  care: {
    color: colors.accent
  },
  ai: {
    color: colors.primary
  }
});

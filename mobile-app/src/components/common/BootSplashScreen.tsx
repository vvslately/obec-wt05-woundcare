import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { colors } from "../../theme/colors";

export function BootSplashScreen() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    breathing.start();

    return () => {
      breathing.stop();
    };
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06]
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }] }]}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.title}>WoundCare AI</Text>
      <Text style={styles.subtitle}>กำลังเตรียมระบบ...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 32
  },
  logoWrap: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: 96,
    height: 96
  },
  title: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary
  }
});

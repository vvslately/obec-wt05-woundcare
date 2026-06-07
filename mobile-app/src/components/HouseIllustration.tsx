import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function HouseIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.treeLeft} />
      <View style={styles.treeRight} />
      <View style={styles.house}>
        <View style={styles.roof} />
        <View style={styles.body}>
          <View style={styles.windowRow}>
            <View style={styles.window} />
            <View style={styles.window} />
          </View>
          <View style={styles.door} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    height: 90,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  house: {
    alignItems: "center"
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 38,
    borderRightWidth: 38,
    borderBottomWidth: 28,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#8A9BB5",
    marginBottom: -2
  },
  body: {
    width: 68,
    height: 52,
    backgroundColor: colors.card,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C5D0DE",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6
  },
  windowRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6
  },
  window: {
    width: 14,
    height: 14,
    backgroundColor: "#B8D4F0",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#8A9BB5"
  },
  door: {
    width: 16,
    height: 20,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  },
  treeLeft: {
    position: "absolute",
    left: 4,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#5CB85C",
    opacity: 0.85
  },
  treeRight: {
    position: "absolute",
    right: 2,
    bottom: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#6BCF6B",
    opacity: 0.75
  }
});

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

type AiAnalysisCardProps = {
  onTakePhoto?: () => void;
  onUploadFromGallery?: () => void;
};

export function AiAnalysisCard({
  onTakePhoto,
  onUploadFromGallery
}: AiAnalysisCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.decor}>
        <Ionicons name="shield-checkmark" size={72} color="rgba(255,255,255,0.12)" />
      </View>

      <Text style={styles.title}>วิเคราะห์แผลด้วย AI</Text>
      <Text style={styles.subtitle}>
        อัปโหลดรูปแผล เพื่อรับการประเมินเบื้องต้น
      </Text>

      <Pressable style={styles.cameraBtn} onPress={onTakePhoto}>
        <Ionicons name="camera-outline" size={20} color={colors.card} />
        <Text style={styles.cameraBtnText}>ถ่ายรูปแผล</Text>
      </Pressable>

      <Pressable style={styles.galleryBtn} onPress={onUploadFromGallery}>
        <Ionicons name="image-outline" size={20} color={colors.brand} />
        <Text style={styles.galleryBtnText}>อัปโหลดจากคลังภาพ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brand,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden"
  },
  decor: {
    position: "absolute",
    top: 12,
    right: 12
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.card,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 18,
    lineHeight: 20
  },
  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: "rgba(0,0,0,0.12)"
  },
  cameraBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.card
  },
  galleryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14
  },
  galleryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand
  }
});

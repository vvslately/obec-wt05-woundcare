import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { ScreenShell } from "../components/common/ScreenShell";
import { HospitalMap } from "../components/hospital/HospitalMap";
import { HospitalScreenSkeleton } from "../components/skeletons/ScreenSkeletons";
import { useFirstLoadSkeleton } from "../hooks/useFirstLoadSkeleton";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { saveHospitalRequest } from "../api/hospitals";
import { getApiErrorMessage } from "../api/http";
import { useAnalysisStore } from "../store/analysisStore";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

export function HospitalScreen() {
  const hospitals = useAnalysisStore((s) => s.hospitals);
  const loadHospitals = useAnalysisStore((s) => s.loadHospitals);
  const { width, isCompact } = useScreenLayout();
  const mapHeight = Math.round(width * 0.52);
  const [loading, setLoading] = React.useState(true);
  const showSkeleton = useFirstLoadSkeleton(loading);
  const [savingId, setSavingId] = React.useState<number | null>(null);

  useEffect(() => {
    loadHospitals().finally(() => setLoading(false));
  }, [loadHospitals]);

  const handleSaveHospital = async (hospitalId: number) => {
    if (savingId) return;
    setSavingId(hospitalId);
    try {
      await saveHospitalRequest(hospitalId);
      Alert.alert("บันทึกแล้ว", "เพิ่มโรงพยาบาลในโปรไฟล์ของคุณแล้ว");
    } catch (error) {
      Alert.alert("บันทึกไม่สำเร็จ", getApiErrorMessage(error));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      {showSkeleton ? (
        <HospitalScreenSkeleton />
      ) : (
        <ScreenShell
          header={
            <ScreenHeader title="โรงพยาบาลใกล้ที่สุด" onInfoPress={() => {}} />
          }
        >
        <View style={styles.locationBanner}>
          <Ionicons name="location-outline" size={18} color={colors.brand} />
          <Text style={styles.locationText}>
            เปิดตำแหน่งเพื่อดูโรงพยาบาลใกล้คุณ
          </Text>
        </View>

        <View style={styles.mapWrap}>
          <HospitalMap hospitals={hospitals} height={mapHeight} />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>เรียงตามระยะทาง</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>ตัวกรอง</Text>
          </View>
        </View>

        {hospitals.map((item) => (
          <View
            key={item.id}
            style={[styles.card, isCompact && styles.cardCompact]}
          >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1519494026892-80bbd122d47a?w=200&q=80"
                }}
                style={styles.thumb}
              />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.metaText}>{item.distanceKm} กม.</Text>
                  <Text style={styles.metaText}>• {item.etaMinutes} นาที</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.callBtn}
                    onPress={() =>
                      item.phone ? Linking.openURL(`tel:${item.phone}`) : undefined
                    }
                  >
                    <Ionicons name="call-outline" size={14} color={colors.brand} />
                    <Text style={styles.callText}>โทร</Text>
                  </Pressable>
                  <Pressable style={styles.navBtn}>
                    <Ionicons
                      name="navigate-outline"
                      size={14}
                      color={colors.card}
                    />
                    <Text style={styles.navText}>นำทาง</Text>
                  </Pressable>
                  <Pressable
                    style={styles.saveBtn}
                    onPress={() => handleSaveHospital(item.id)}
                    disabled={savingId === item.id}
                  >
                    {savingId === item.id ? (
                      <ActivityIndicator size="small" color={colors.brand} />
                    ) : (
                      <>
                        <Ionicons
                          name="bookmark-outline"
                          size={14}
                          color={colors.brand}
                        />
                        <Text style={styles.saveText}>บันทึก</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
        ))}
        </ScreenShell>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  locationText: { flex: 1, fontSize: 13, color: colors.infoText, lineHeight: 20 },
  mapWrap: {
    marginBottom: spacing.md
  },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  filterText: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md
  },
  cardCompact: {
    flexDirection: "column"
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.statusCardBg
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: "700", color: colors.primary, marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 10 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  callText: { fontSize: 11, color: colors.brand, fontWeight: "600" },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  navText: { fontSize: 11, color: colors.card, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minWidth: 72,
    justifyContent: "center"
  },
  saveText: { fontSize: 11, color: colors.brand, fontWeight: "600" }
});

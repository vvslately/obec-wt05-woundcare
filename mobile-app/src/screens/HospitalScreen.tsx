import React, { useEffect } from "react";
import {
  ActivityIndicator,
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
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useAnalysisStore } from "../store/analysisStore";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

export function HospitalScreen() {
  const hospitals = useAnalysisStore((s) => s.hospitals);
  const loadHospitals = useAnalysisStore((s) => s.loadHospitals);
  const { isCompact } = useScreenLayout();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    loadHospitals().finally(() => setLoading(false));
  }, [loadHospitals]);

  return (
    <>
      <StatusBar style="dark" />
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

        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={42} color={colors.textSecondary} />
          <Text style={styles.mapText}>แผนที่โรงพยาบาลใกล้เคียง</Text>
        </View>

        <View style={styles.filters}>
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>เรียงตามระยะทาง</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>ตัวกรอง</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : (
          hospitals.map((item) => (
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
                  <Pressable style={styles.detailBtn}>
                    <Text style={styles.detailText}>ดูรายละเอียด</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScreenShell>
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
  mapPlaceholder: {
    aspectRatio: 16 / 9,
    minHeight: 140,
    maxHeight: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  mapText: { fontSize: 13, color: colors.textSecondary },
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
  loader: { marginTop: spacing.xl },
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
  detailBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  detailText: { fontSize: 11, color: colors.primary, fontWeight: "600" }
});

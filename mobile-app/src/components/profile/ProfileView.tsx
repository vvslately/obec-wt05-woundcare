import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  fetchWoundCasesRequest
} from "../../api/woundCases";
import {
  fetchSavedHospitalsRequest,
  type SavedHospitalItem
} from "../../api/hospitals";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { useOpenProfileHistoryItem } from "../../hooks/useOpenProfileHistoryItem";
import { useDeleteProfileHistoryItem } from "../../hooks/useDeleteProfileHistoryItem";
import type { TabParamList } from "../../navigation/types";
import type { ProfileStackParamList } from "../../navigation/profileTypes";
import type { UserProfile } from "../../store/authStore";
import { useAssessmentHistoryStore } from "../../store/assessmentHistoryStore";
import { formatBirthDateCompact } from "../../utils/mapUser";
import {
  buildProfileHistory,
  type ProfileHistoryItem
} from "../../utils/profileHistory";
import { ProfileHistoryList } from "./ProfileHistoryList";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ProfileViewProps = {
  user: UserProfile;
  onLogout: () => void;
  onLoadingChange?: (loading: boolean) => void;
};

const ALL_CONDITIONS = ["เบาหวาน", "ความดัน", "ภูมิแพ้", "โรคผิวหนัง", "ไม่มี"];

export function ProfileView({ user, onLogout, onLoadingChange }: ProfileViewProps) {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<ProfileStackParamList>,
        BottomTabNavigationProp<TabParamList>
      >
    >();
  const { horizontal, scrollBottom } = useScreenLayout({ withTabBar: true });
  const { openingCaseId, openHistoryItem } = useOpenProfileHistoryItem();
  const [historyItems, setHistoryItems] = useState<ProfileHistoryItem[]>([]);
  const [savedHospitals, setSavedHospitals] = useState<SavedHospitalItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const loadProfileData = useCallback(async () => {
    setLoadingHistory(true);
    setLoadingHospitals(true);
    onLoadingChange?.(true);

    await useAssessmentHistoryStore.getState().refresh();
    const localItems = useAssessmentHistoryStore.getState().items;

    const [casesResult, hospitalsResult] = await Promise.allSettled([
      fetchWoundCasesRequest(1),
      fetchSavedHospitalsRequest()
    ]);

    const serverItems =
      casesResult.status === "fulfilled" ? casesResult.value : [];

    setHistoryItems(buildProfileHistory(localItems, serverItems).slice(0, 1));

    if (hospitalsResult.status === "fulfilled") {
      setSavedHospitals(hospitalsResult.value);
    } else {
      setSavedHospitals([]);
    }

    setLoadingHistory(false);
    setLoadingHospitals(false);
    onLoadingChange?.(false);
  }, [onLoadingChange]);

  const { deletingCaseId, deleteHistoryItem } =
    useDeleteProfileHistoryItem(loadProfileData);

  useFocusEffect(
    useCallback(() => {
      void loadProfileData();
    }, [loadProfileData])
  );

  const openAllHistory = () => {
    navigation.navigate("AssessmentHistory");
  };

  const openMaps = (hospital: SavedHospitalItem) => {
    const { latitude, longitude, address, name } = hospital;
    const query =
      latitude != null && longitude != null
        ? `${latitude},${longitude}`
        : encodeURIComponent(address || name);

    if (!query) {
      Alert.alert("ไม่สามารถนำทางได้", "โรงพยาบาลนี้ยังไม่มีพิกัดหรือที่อยู่ในระบบ");
      return;
    }

    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`
    );
  };

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "ต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: onLogout }
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontal,
            paddingBottom: scrollBottom
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.brand} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.userType}>{user.userType}</Text>
              <View style={styles.emailRow}>
                <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.email}>{user.email}</Text>
              </View>
              <View style={styles.emailRow}>
                <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.email}>เพศ {user.gender}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="create-outline" size={18} color={colors.card} />
            <Text style={styles.editBtnText}>แก้ไขโปรไฟล์</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ข้อมูลสุขภาพ</Text>
        <View style={styles.statsCard}>
          <StatItem
            label="วันเกิด"
            value={formatBirthDateCompact(user.birthDate)}
          />
          <StatItem label="น้ำหนัก" value={user.weight ? String(user.weight) : "-"} unit="kg" />
          <StatItem label="ส่วนสูง" value={user.height ? String(user.height) : "-"} unit="cm" />
          <StatItem label="กรุ๊ปเลือด" value={user.bloodType} />
        </View>

        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Ionicons name="heart-outline" size={18} color={colors.brand} />
          <Text style={styles.sectionTitleInline}>โรคประจำตัว</Text>
        </View>
        <View style={styles.chips}>
          {ALL_CONDITIONS.map((item) => {
            const active = user.conditions.includes(item);
            return (
              <View
                key={item}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Ionicons name="document-text-outline" size={18} color={colors.brand} />
          <Text style={styles.sectionTitleText}>ประวัติการวิเคราะห์ล่าสุด</Text>
          <Pressable style={styles.viewAllBtn} onPress={openAllHistory} hitSlop={8}>
            <Text style={styles.viewAllText}>ดูทั้งหมด</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.link} />
          </Pressable>
        </View>

        <ProfileHistoryList
          items={historyItems}
          loading={loadingHistory}
          openingCaseId={openingCaseId}
          deletingCaseId={deletingCaseId}
          onPressItem={openHistoryItem}
          onDeleteItem={deleteHistoryItem}
        />

        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Ionicons name="medkit-outline" size={18} color={colors.brand} />
          <Text style={styles.sectionTitleInline}>โรงพยาบาลที่บันทึกไว้</Text>
        </View>

        {loadingHospitals ? (
          <ActivityIndicator color={colors.brand} style={styles.sectionLoader} />
        ) : savedHospitals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="medkit-outline" size={28} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>ยังไม่มีโรงพยาบาลที่บันทึก</Text>
            <Text style={styles.emptySubtitle}>
              บันทึกโรงพยาบาลจากแท็บโรงพยาบาลเพื่อดูที่นี่
            </Text>
          </View>
        ) : (
          savedHospitals.map((hospital) => (
            <View key={hospital.id} style={styles.hospitalCard}>
              <View style={styles.hospitalIconWrap}>
                <Ionicons name="medkit-outline" size={24} color={colors.brand} />
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName} numberOfLines={2}>
                  {hospital.name}
                </Text>
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.distanceText} numberOfLines={2}>
                    {hospital.address ||
                      (hospital.distanceKm != null
                        ? `${hospital.distanceKm} กม.`
                        : "ไม่ระบุที่อยู่")}
                  </Text>
                </View>
              </View>
              <View style={styles.hospitalActions}>
                <Pressable
                  style={styles.callBtn}
                  onPress={() =>
                    hospital.phone
                      ? Linking.openURL(`tel:${hospital.phone}`)
                      : Alert.alert("ไม่มีเบอร์โทร", "โรงพยาบาลนี้ยังไม่มีเบอร์ในระบบ")
                  }
                >
                  <Ionicons name="call-outline" size={16} color={colors.brand} />
                  <Text style={styles.callBtnText}>โทร</Text>
                </Pressable>
                <Pressable
                  style={styles.navBtn}
                  onPress={() => openMaps(hospital)}
                >
                  <Ionicons name="navigate-outline" size={16} color={colors.card} />
                  <Text style={styles.navBtnText}>นำทาง</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.notification} />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatItem({
  label,
  value,
  unit,
  compact = false
}: {
  label: string;
  value: string;
  unit?: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.statValue, compact && styles.statValueCompact]}
        numberOfLines={compact ? 2 : 1}
        adjustsFontSizeToFit={!compact}
        minimumFontScale={0.75}
      >
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingTop: spacing.lg
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  profileRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.statusCardBg,
    alignItems: "center",
    justifyContent: "center"
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center"
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 2
  },
  userType: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.link,
    marginBottom: 4
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 12
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.card
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionHeaderSpaced: {
    marginBottom: 12,
    marginTop: 4,
    flexWrap: "wrap"
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary
  },
  sectionTitleInline: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: 4
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.link
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    paddingHorizontal: 2
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: "center"
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand,
    textAlign: "center",
    width: "100%"
  },
  statValueCompact: {
    fontSize: 12,
    lineHeight: 16
  },
  statUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  chipActive: {
    backgroundColor: "#E6F7F5",
    borderColor: colors.accent
  },
  chipInactive: {
    backgroundColor: colors.card,
    borderColor: colors.border
  },
  chipText: {
    fontSize: 13
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: "600"
  },
  chipTextInactive: {
    color: colors.textSecondary
  },
  historyCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center"
  },
  sectionLoader: {
    marginVertical: spacing.lg
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 6,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center"
  },
  historyThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.border
  },
  historyInfo: {
    flex: 1,
    justifyContent: "center"
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4
  },
  riskText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.notification,
    marginBottom: 2
  },
  statusText: {
    fontSize: 12,
    color: colors.notification
  },
  dateCol: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  dateText: {
    fontSize: 11,
    color: colors.textSecondary
  },
  hospitalCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    alignItems: "center"
  },
  hospitalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.statusCardBg,
    alignItems: "center",
    justifyContent: "center"
  },
  hospitalInfo: {
    flex: 1
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  distanceText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  hospitalActions: {
    gap: 8
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.card
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.notification
  }
});

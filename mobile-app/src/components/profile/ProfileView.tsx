import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import type { UserProfile } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ProfileViewProps = {
  user: UserProfile;
  onLogout: () => void;
};

const ALL_CONDITIONS = ["เบาหวาน", "ความดัน", "ภูมิแพ้", "โรคผิวหนัง", "ไม่มี"];

export function ProfileView({ user, onLogout }: ProfileViewProps) {
  const { horizontal, scrollBottom } = useScreenLayout();
  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "ต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: onLogout }
    ]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={[styles.header, { paddingHorizontal: horizontal }]}>
          <Text style={styles.headerTitle}>
            <Text style={styles.brand}>Wound</Text>
            <Text style={styles.care}>Care</Text>
          </Text>
          <Pressable hitSlop={8}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </SafeAreaView>

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
            </View>
          </View>

          <Pressable style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color={colors.card} />
            <Text style={styles.editBtnText}>แก้ไขโปรไฟล์</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ข้อมูลสุขภาพ</Text>
        <View style={styles.statsCard}>
          <StatItem label="อายุ" value={user.age ? String(user.age) : "-"} unit="ปี" />
          <StatItem label="เพศ" value={user.gender} />
          <StatItem label="น้ำหนัก" value={user.weight ? String(user.weight) : "-"} unit="kg" />
          <StatItem label="ส่วนสูง" value={user.height ? String(user.height) : "-"} unit="cm" />
          <StatItem label="กรุ๊ปเลือด" value={user.bloodType} />
        </View>

        <View style={styles.sectionHeader}>
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

        <Pressable style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={18} color={colors.brand} />
          <Text style={styles.sectionTitleInline}>ประวัติการวิเคราะห์ล่าสุด</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
            style={styles.chevron}
          />
        </Pressable>

        <View style={styles.historyCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80"
            }}
            style={styles.historyThumb}
          />
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>แผลที่หน้าแข้ง</Text>
            <Text style={styles.riskText}>ความเสี่ยง 78%</Text>
            <Text style={styles.statusText}>สถานะ: ควรพบแพทย์</Text>
          </View>
          <View style={styles.dateCol}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>12 พ.ค. 2567</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="medkit-outline" size={18} color={colors.brand} />
          <Text style={styles.sectionTitleInline}>โรงพยาบาลที่บันทึกไว้</Text>
        </View>

        <View style={styles.hospitalCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1519494026892-80bbd122d47a?w=200&q=80"
            }}
            style={styles.hospitalThumb}
          />
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>รพ. ศิริราช</Text>
            <View style={styles.distanceRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.distanceText}>2.4 กม.</Text>
            </View>
          </View>
          <View style={styles.hospitalActions}>
            <Pressable style={styles.callBtn}>
              <Ionicons name="call-outline" size={16} color={colors.brand} />
              <Text style={styles.callBtnText}>โทร</Text>
            </Pressable>
            <Pressable style={styles.navBtn}>
              <Ionicons name="navigate-outline" size={16} color={colors.card} />
              <Text style={styles.navBtnText}>นำทาง</Text>
            </Pressable>
          </View>
        </View>

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
  unit
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
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
  headerSafe: {
    backgroundColor: colors.card
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800"
  },
  brand: {
    color: colors.brand
  },
  care: {
    color: colors.accent
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
    gap: 4
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
    gap: 8,
    marginBottom: 12,
    marginTop: 4
  },
  sectionTitleInline: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary
  },
  chevron: {
    marginLeft: "auto"
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12
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
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    alignItems: "center"
  },
  hospitalThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.border
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

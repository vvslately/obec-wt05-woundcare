import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFooter } from "../components/common/ScreenFooter";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { ScreenShell } from "../components/common/ScreenShell";
import { AnimatedOptionChip } from "../components/profile/AnimatedOptionChip";
import { AuthInput } from "../components/profile/AuthInput";
import { BirthDateField, toBirthDateISO } from "../components/profile/BirthDateField";
import type { ProfileStackParamList } from "../navigation/profileTypes";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import {
  parseBirthDateFromIso,
  profileBloodTypeToApi,
  profileGenderToApi
} from "../utils/mapUser";

const CONDITION_OPTIONS = ["เบาหวาน", "ความดัน", "ภูมิแพ้", "โรคผิวหนัง", "ไม่มี"];

const GENDER_OPTIONS: { value: "male" | "female"; label: string }[] = [
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" }
];

const BLOOD_TYPE_OPTIONS: {
  value: "A" | "B" | "AB" | "O" | "unknown";
  label: string;
}[] = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
  { value: "unknown", label: "ไม่ทราบ" }
];

export function EditProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const initialGender = useMemo(
    () => profileGenderToApi(user?.gender || ""),
    [user?.gender]
  );
  const initialBloodType = useMemo(
    () => profileBloodTypeToApi(user?.bloodType || ""),
    [user?.bloodType]
  );

  const [name, setName] = useState(user?.name || "");
  const [birthDate, setBirthDate] = useState<Date | null>(
    () => parseBirthDateFromIso(user?.birthDate) ?? null
  );
  const [gender, setGender] = useState<"male" | "female" | "">(initialGender);
  const [weightKg, setWeightKg] = useState(
    user?.weight ? String(user.weight) : ""
  );
  const [heightCm, setHeightCm] = useState(
    user?.height ? String(user.height) : ""
  );
  const [bloodType, setBloodType] = useState<
    "A" | "B" | "AB" | "O" | "unknown" | ""
  >(initialBloodType);
  const [conditions, setConditions] = useState<string[]>(
    user?.conditions?.length ? user.conditions : ["ไม่มี"]
  );
  const [loading, setLoading] = useState(false);

  const toggleCondition = (item: string) => {
    if (item === "ไม่มี") {
      setConditions(["ไม่มี"]);
      return;
    }

    setConditions((prev) => {
      const withoutNone = prev.filter((c) => c !== "ไม่มี");
      if (withoutNone.includes(item)) {
        const next = withoutNone.filter((c) => c !== item);
        return next.length ? next : ["ไม่มี"];
      }
      return [...withoutNone, item];
    });
  };

  const handleSave = async () => {
    if (loading) return;

    setLoading(true);
    const result = await updateProfile({
      name,
      birthDate: birthDate ? toBirthDateISO(birthDate) : "",
      gender,
      weightKg,
      heightCm,
      bloodType,
      conditions
    });
    setLoading(false);

    if (!result.ok) {
      Alert.alert("บันทึกไม่สำเร็จ", result.message);
      return;
    }

    Alert.alert("บันทึกสำเร็จ", "อัปเดตข้อมูลโปรไฟล์แล้ว", [
      { text: "ตกลง", onPress: () => navigation.navigate("ProfileMain") }
    ]);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <ScreenShell
        header={
          <ScreenHeader
            title="แก้ไขโปรไฟล์"
            onBack={() => navigation.navigate("ProfileMain")}
          />
        }
        footer={
          <ScreenFooter>
            <Pressable
              style={[styles.saveBtn, loading && styles.btnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
              )}
            </Pressable>
          </ScreenFooter>
        }
        contentStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>ข้อมูลบัญชี</Text>

        <AuthInput
          icon="person-outline"
          placeholder="ชื่อ-นามสกุล"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          style={styles.field}
        />

        <View style={styles.readonlyField}>
          <Text style={styles.readonlyLabel}>อีเมล</Text>
          <Text style={styles.readonlyValue}>{user.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>ข้อมูลสุขภาพ</Text>

        <Text style={styles.fieldLabel}>วันเกิด</Text>
        <BirthDateField
          value={birthDate}
          onChange={setBirthDate}
          style={styles.field}
        />

        <Text style={styles.fieldLabel}>เพศ</Text>
        <View style={styles.chips}>
          {GENDER_OPTIONS.map((item) => (
            <AnimatedOptionChip
              key={item.value}
              label={item.label}
              selected={gender === item.value}
              onPress={() => setGender(item.value)}
            />
          ))}
        </View>

        <View style={styles.rowFields}>
          <AuthInput
            icon="fitness-outline"
            placeholder="น้ำหนัก (kg)"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            style={styles.halfField}
          />
          <AuthInput
            icon="resize-outline"
            placeholder="ส่วนสูง (cm)"
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="numeric"
            style={styles.halfField}
          />
        </View>

        <Text style={styles.fieldLabel}>กรุ๊ปเลือด</Text>
        <View style={styles.chips}>
          {BLOOD_TYPE_OPTIONS.map((item) => (
            <AnimatedOptionChip
              key={item.value}
              label={item.label}
              selected={bloodType === item.value}
              onPress={() => setBloodType(item.value)}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>โรคประจำตัว (ถ้ามี)</Text>
        <View style={styles.chips}>
          {CONDITION_OPTIONS.map((item) => (
            <AnimatedOptionChip
              key={item}
              label={item}
              selected={conditions.includes(item)}
              onPress={() => toggleCondition(item)}
            />
          ))}
        </View>
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.md
  },
  field: {
    marginBottom: 12
  },
  readonlyField: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.lg
  },
  readonlyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4
  },
  readonlyValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 10
  },
  rowFields: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  halfField: {
    flex: 1,
    marginBottom: 0
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20
  },
  saveBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center"
  },
  btnDisabled: {
    opacity: 0.7
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.card
  }
});

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { AnimatedOptionChip } from "./AnimatedOptionChip";
import { AuthInput } from "./AuthInput";
import { AuthLogo } from "./AuthLogo";
import { AnimatedAuthSwitch } from "./AnimatedAuthSwitch";
import { BirthDateField, toBirthDateISO } from "./BirthDateField";

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

type RegisterStep = "account" | "health";

type RegisterViewProps = {
  onGoLogin: () => void;
};

export function RegisterView({ onGoLogin }: RegisterViewProps) {
  const register = useAuthStore((s) => s.register);
  const { horizontal, scrollBottom } = useScreenLayout();
  const [step, setStep] = useState<RegisterStep>("account");
  const [stepDirection, setStepDirection] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bloodType, setBloodType] = useState<
    "A" | "B" | "AB" | "O" | "unknown" | ""
  >("");
  const [conditions, setConditions] = useState<string[]>(["ไม่มี"]);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
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

  const validateAccountStep = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลบัญชีให้ครบถ้วน");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณาตรวจสอบรหัสผ่านอีกครั้ง");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("รหัสผ่านสั้นเกินไป", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }

    if (!acceptedTerms) {
      Alert.alert("กรุณายอมรับเงื่อนไข", "ต้องยอมรับเงื่อนไขการใช้งานก่อนสมัคร");
      return false;
    }

    return true;
  };

  const handleContinueToHealth = () => {
    if (loading) return;
    if (validateAccountStep()) {
      setStepDirection(1);
      setStep("health");
    }
  };

  const goBackToAccount = () => {
    setStepDirection(-1);
    setStep("account");
  };

  const handleCreateAccount = async () => {
    if (loading) return;

    setLoading(true);
    const result = await register({
      name,
      email,
      password,
      confirmPassword,
      birthDate: birthDate ? toBirthDateISO(birthDate) : "",
      gender,
      weightKg,
      heightCm,
      bloodType,
      conditions
    });
    setLoading(false);

    if (!result.ok) {
      Alert.alert("สมัครไม่สำเร็จ", result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: horizontal,
              paddingBottom: scrollBottom
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthLogo />

          <AnimatedAuthSwitch viewKey={step} direction={stepDirection} inline>
          {step === "account" ? (
            <>
              <Text style={styles.heading}>สร้างบัญชีใหม่</Text>
              <Text style={styles.subheading}>
                เริ่มต้นใช้งาน WoundCare เพื่อรับการประเมินแผลเบื้องต้นด้วย AI
              </Text>

              <AuthInput
                icon="person-outline"
                placeholder="ชื่อ-นามสกุล"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={styles.field}
              />
              <AuthInput
                icon="mail-outline"
                placeholder="อีเมล"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.field}
              />
              <AuthInput
                icon="lock-closed-outline"
                placeholder="รหัสผ่าน"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.field}
              />
              <AuthInput
                icon="lock-closed-outline"
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.field}
              />

              <Pressable
                style={styles.termsRow}
                onPress={() => setAcceptedTerms((v) => !v)}
              >
                <Ionicons
                  name={acceptedTerms ? "checkbox" : "square-outline"}
                  size={20}
                  color={acceptedTerms ? colors.brand : colors.textSecondary}
                />
                <Text style={styles.termsText}>
                  ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
                </Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleContinueToHealth}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>สมัคร</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.backRow} onPress={goBackToAccount}>
                <Ionicons name="chevron-back" size={20} color={colors.brand} />
                <Text style={styles.backText}>กลับ</Text>
              </Pressable>

              <Text style={styles.heading}>ข้อมูลสุขภาพ</Text>
              <Text style={styles.subheading}>
                กรอกข้อมูลสุขภาพเพื่อให้ AI ประเมินแผลได้แม่นยำขึ้น
              </Text>

              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>ขั้นที่ 2 จาก 2</Text>
              </View>

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

              <Text style={styles.sectionLabel}>โรคประจำตัว (ถ้ามี)</Text>
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

              <Pressable
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <Text style={styles.primaryBtnText}>สร้างบัญชี</Text>
                )}
              </Pressable>
            </>
          )}
          </AnimatedAuthSwitch>

          <Pressable style={styles.switchLink} onPress={onGoLogin}>
            <Text style={styles.switchText}>
              มีบัญชีแล้ว? <Text style={styles.link}>เข้าสู่ระบบ</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent"
  },
  flex: {
    flex: 1
  },
  content: {
    paddingTop: spacing.lg
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.brand,
    marginBottom: 8,
    textAlign: "center"
  },
  subheading: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center"
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.md
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand
  },
  stepBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.infoBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: spacing.lg
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.infoText
  },
  field: {
    marginBottom: 12
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 10
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.primary
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center"
  },
  btnDisabled: {
    opacity: 0.7
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.card
  },
  switchLink: {
    marginTop: 24,
    alignItems: "center"
  },
  switchText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  link: {
    fontWeight: "600",
    color: colors.link
  }
});

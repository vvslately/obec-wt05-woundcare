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
import { AuthInput } from "./AuthInput";
import { AuthLogo } from "./AuthLogo";

const CONDITION_OPTIONS = ["เบาหวาน", "ความดัน", "ภูมิแพ้", "ไม่มี"];

type RegisterViewProps = {
  onGoLogin: () => void;
};

export function RegisterView({ onGoLogin }: RegisterViewProps) {
  const register = useAuthStore((s) => s.register);
  const { horizontal, scrollBottom } = useScreenLayout();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleRegister = async () => {
    if (loading) return;

    if (!acceptedTerms) {
      Alert.alert("กรุณายอมรับเงื่อนไข", "ต้องยอมรับเงื่อนไขการใช้งานก่อนสมัคร");
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      password,
      confirmPassword,
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

        <Text style={styles.sectionLabel}>โรคประจำตัว (ถ้ามี)</Text>
        <View style={styles.chips}>
          {CONDITION_OPTIONS.map((item) => {
            const selected = conditions.includes(item);
            return (
              <Pressable
                key={item}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleCondition(item)}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.primaryBtnText}>สร้างบัญชี</Text>
          )}
        </Pressable>

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
    backgroundColor: colors.background
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
    marginBottom: 8
  },
  subheading: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 24
  },
  field: {
    marginBottom: 12
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
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.statusCardBg,
    borderWidth: 1,
    borderColor: colors.border
  },
  chipSelected: {
    backgroundColor: colors.card,
    borderColor: colors.accent
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: "600"
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

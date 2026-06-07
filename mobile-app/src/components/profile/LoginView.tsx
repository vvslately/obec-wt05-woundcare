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

type LoginViewProps = {
  onGoRegister: () => void;
};

export function LoginView({ onGoRegister }: LoginViewProps) {
  const login = useAuthStore((s) => s.login);
  const { horizontal, scrollBottom } = useScreenLayout();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    const result = await login(email, password, remember);
    setLoading(false);

    if (!result.ok) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", result.message);
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

        <Text style={styles.heading}>ยินดีต้อนรับกลับ</Text>
        <Text style={styles.subheading}>
          เข้าสู่ระบบเพื่อวิเคราะห์แผล ติดตามผล และค้นหาโรงพยาบาลใกล้คุณ
        </Text>

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

        <View style={styles.row}>
          <Pressable
            style={styles.remember}
            onPress={() => setRemember((v) => !v)}
          >
            <Ionicons
              name={remember ? "checkbox" : "square-outline"}
              size={20}
              color={remember ? colors.brand : colors.textSecondary}
            />
            <Text style={styles.rememberText}>จดจำฉัน</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.link}>ลืมรหัสผ่าน?</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.primaryBtnText}>เข้าสู่ระบบ</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>หรือเข้าสู่ระบบด้วย</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialBtn} disabled={loading}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialBtn} disabled={loading}>
            <Ionicons name="logo-apple" size={18} color={colors.primary} />
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Pressable style={styles.switchLink} onPress={onGoRegister}>
          <Text style={styles.switchText}>
            ยังไม่มีบัญชี? <Text style={styles.link}>สมัครสมาชิก</Text>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 20
  },
  remember: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  rememberText: {
    fontSize: 13,
    color: colors.primary
  },
  link: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.link
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  socialRow: {
    flexDirection: "row",
    gap: 12
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EA4335"
  },
  socialText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary
  },
  switchLink: {
    marginTop: 24,
    alignItems: "center"
  },
  switchText: {
    fontSize: 14,
    color: colors.textSecondary
  }
});

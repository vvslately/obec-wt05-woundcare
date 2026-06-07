import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ScreenFooter } from "../../components/common/ScreenFooter";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { ScreenShell } from "../../components/common/ScreenShell";
import {
  ChipSelect,
  SegmentControl,
  YesNoRow
} from "../../components/common/FormControls";
import type { AnalysisStackParamList } from "../../navigation/analysisTypes";
import { useAnalysisStore } from "../../store/analysisStore";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";
import {
  CONDITION_OPTIONS,
  DURATION_OPTIONS,
  LOCATION_OPTIONS,
  PAIN_OPTIONS,
  type WoundDuration
} from "../../types/analysis";

export function AdditionalInfoScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AnalysisStackParamList>>();
  const form = useAnalysisStore((s) => s.form);
  const updateForm = useAnalysisStore((s) => s.updateForm);
  const submitAnalysis = useAnalysisStore((s) => s.submitAnalysis);
  const [loading, setLoading] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  const toggleCondition = (item: string) => {
    if (item === "ไม่มีโรคประจำตัว") {
      updateForm({ conditions: ["ไม่มีโรคประจำตัว"] });
      return;
    }

    const withoutNone = form.conditions.filter((c) => c !== "ไม่มีโรคประจำตัว");
    if (withoutNone.includes(item)) {
      const next = withoutNone.filter((c) => c !== item);
      updateForm({ conditions: next.length ? next : ["ไม่มีโรคประจำตัว"] });
      return;
    }

    updateForm({ conditions: [...withoutNone, item] });
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    const result = await submitAnalysis();
    setLoading(false);

    if (!result.ok) {
      Alert.alert("วิเคราะห์ไม่สำเร็จ", result.message);
      return;
    }

    if (result.message) {
      Alert.alert("หมายเหตุ", result.message);
    }

    navigation.navigate("AnalysisResult");
  };

  return (
    <>
      <StatusBar style="dark" />
      <ScreenShell
        header={
          <ScreenHeader
            title="ข้อมูลเพิ่มเติม"
            onBack={() => navigation.goBack()}
          />
        }
        footer={
          <ScreenFooter>
            <Pressable
              style={[styles.submitBtn, loading && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.submitText}>ส่งให้ AI วิเคราะห์</Text>
              )}
            </Pressable>
          </ScreenFooter>
        }
        contentStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>ระดับความเจ็บปวด</Text>
        <SegmentControl
          options={PAIN_OPTIONS}
          value={form.painLevel}
          onChange={(value) => updateForm({ painLevel: value })}
        />

        <Text style={styles.sectionTitle}>อาการปัจจุบัน</Text>
        <View style={styles.card}>
          <YesNoRow
            label="มีไข้"
            value={form.hasFever}
            onChange={(hasFever) => updateForm({ hasFever })}
          />
          <YesNoRow
            label="คัน"
            value={form.hasItching}
            onChange={(hasItching) => updateForm({ hasItching })}
          />
          <YesNoRow
            label="บวม"
            value={form.hasSwelling}
            onChange={(hasSwelling) => updateForm({ hasSwelling })}
          />
          <YesNoRow
            label="มีน้ำเหลือง/หนอง"
            value={form.hasPus}
            onChange={(hasPus) => updateForm({ hasPus })}
          />
        </View>

        <Text style={styles.sectionTitle}>ระยะเวลาเป็นแผล</Text>
        <SegmentControl
          options={DURATION_OPTIONS}
          value={form.woundDuration}
          onChange={(value: WoundDuration) =>
            updateForm({ woundDuration: value })
          }
        />

        <Text style={styles.sectionTitle}>ตำแหน่งแผล</Text>
        <Pressable
          style={styles.selectBox}
          onPress={() => setShowLocations((v) => !v)}
        >
          <Text style={styles.selectText}>{form.woundLocation}</Text>
        </Pressable>
        {showLocations && (
          <View style={styles.locationList}>
            {LOCATION_OPTIONS.map((item) => (
              <Pressable
                key={item}
                style={styles.locationItem}
                onPress={() => {
                  updateForm({ woundLocation: item });
                  setShowLocations(false);
                }}
              >
                <Text style={styles.locationText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>อาการเพิ่มเติม</Text>
        <TextInput
          style={styles.textArea}
          multiline
          maxLength={200}
          placeholder="เช่น ปวดตุบ ๆ, แสบ, เหนื่อยล้า..."
          placeholderTextColor={colors.textSecondary}
          value={form.additionalNote}
          onChangeText={(additionalNote) => updateForm({ additionalNote })}
        />
        <Text style={styles.counter}>{form.additionalNote.length}/200</Text>

        <Text style={styles.sectionTitle}>โรคประจำตัว</Text>
        <ChipSelect
          options={CONDITION_OPTIONS}
          values={form.conditions}
          onToggle={toggleCondition}
        />

        <Text style={styles.sectionTitle}>ยาที่ใช้ประจำ / แพ้ยา</Text>
        <TextInput
          style={styles.textArea}
          multiline
          maxLength={200}
          placeholder="ระบุชื่อยา หรือ อาการแพ้ (ถ้ามี)"
          placeholderTextColor={colors.textSecondary}
          value={form.medications}
          onChangeText={(medications) => updateForm({ medications })}
        />
        <Text style={styles.counter}>{form.medications.length}/200</Text>
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.sm
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14
  },
  selectText: { fontSize: 14, color: colors.primary },
  locationList: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  locationItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  locationText: { fontSize: 14, color: colors.primary },
  textArea: {
    minHeight: 96,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.primary,
    textAlignVertical: "top"
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: colors.textSecondary
  },
  submitBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: colors.card, fontSize: 16, fontWeight: "700" }
});

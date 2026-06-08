import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "../../navigation/types";
import { setTabTransition } from "../../navigation/tabTransition";
import { useAssessmentHistoryStore } from "../../store/assessmentHistoryStore";
import { useAnalysisStore } from "../../store/analysisStore";
import { colors } from "../../theme/colors";

type QuickItemId = "latest" | "conditions" | "hospital";

type QuickItem = {
  id: QuickItemId;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
};

const ITEMS: QuickItem[] = [
  {
    id: "latest",
    icon: "time-outline",
    iconColor: colors.brand,
    iconBg: "#E8F0F8",
    title: "ประเมินล่าสุด",
    subtitle: "ดูผลย้อนหลัง"
  },
  {
    id: "conditions",
    icon: "heart-outline",
    iconColor: colors.success,
    iconBg: "#E8F5EA",
    title: "โรคประจำตัว",
    subtitle: "จัดการข้อมูล"
  },
  {
    id: "hospital",
    icon: "location-outline",
    iconColor: colors.brand,
    iconBg: "#E8F0F8",
    title: "โรงพยาบาล",
    subtitle: "ใกล้ฉัน"
  }
];

export function QuickAccessGrid() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const latest = useAssessmentHistoryStore((s) => s.items[0] ?? null);

  const openLatest = () => {
    if (latest) {
      useAnalysisStore.setState({
        photos: latest.photos,
        selectedPhotoIndex: 0,
        form: latest.form,
        caseId: latest.id,
        result: latest.result,
        aiSource: latest.aiSource,
        aiNote: latest.aiNote ?? null,
        aiModel: latest.aiModel ?? null
      });

      setTabTransition(1);
      navigation.navigate("Analysis", { screen: "AnalysisResult" });
      return;
    }

    setTabTransition(3);
    navigation.navigate("Profile");
  };

  const handlePress = (id: QuickItemId) => {
    if (id === "latest") {
      openLatest();
      return;
    }

    if (id === "conditions") {
      setTabTransition(3);
      navigation.navigate("Profile");
      return;
    }

    setTabTransition(2);
    navigation.navigate("Hospital");
  };

  return (
    <View style={styles.grid}>
      {ITEMS.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => handlePress(item.id)}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.icon} size={22} color={item.iconColor} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 10
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center"
  },
  cardPressed: {
    opacity: 0.85
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.brand,
    textAlign: "center",
    marginBottom: 2
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center"
  }
});

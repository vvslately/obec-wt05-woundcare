import React, { useCallback, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { ProfileHistoryList } from "../components/profile/ProfileHistoryList";
import { useOpenProfileHistoryItem } from "../hooks/useOpenProfileHistoryItem";
import { useDeleteProfileHistoryItem } from "../hooks/useDeleteProfileHistoryItem";
import { useScreenLayout } from "../hooks/useScreenLayout";
import type { ProfileStackParamList } from "../navigation/profileTypes";
import { fetchWoundCasesRequest } from "../api/woundCases";
import { useAssessmentHistoryStore } from "../store/assessmentHistoryStore";
import {
  buildProfileHistory,
  type ProfileHistoryItem
} from "../utils/profileHistory";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function AssessmentHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { horizontal, scrollBottom } = useScreenLayout({ withTabBar: true });
  const { openingCaseId, openHistoryItem } = useOpenProfileHistoryItem();
  const [historyItems, setHistoryItems] = useState<ProfileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    await useAssessmentHistoryStore.getState().refresh();
    const localItems = useAssessmentHistoryStore.getState().items;

    try {
      const serverItems = await fetchWoundCasesRequest(20);
      setHistoryItems(buildProfileHistory(localItems, serverItems));
    } catch {
      setHistoryItems(buildProfileHistory(localItems, []));
    } finally {
      setLoading(false);
    }
  }, []);

  const { deletingCaseId, deleteHistoryItem } = useDeleteProfileHistoryItem(loadHistory);

  const goToProfile = useCallback(() => {
    navigation.navigate("ProfileMain");
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goToProfile();
        return true;
      });
      return () => sub.remove();
    }, [goToProfile])
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="ประวัติการวิเคราะห์"
        onBack={goToProfile}
      />
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
        <ProfileHistoryList
          items={historyItems}
          loading={loading}
          openingCaseId={openingCaseId}
          deletingCaseId={deletingCaseId}
          onPressItem={openHistoryItem}
          onDeleteItem={deleteHistoryItem}
        />
      </ScrollView>
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
  }
});

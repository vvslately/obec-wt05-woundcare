import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { fetchWoundCaseDetailRequest } from "../api/woundCases";
import { getApiErrorMessage } from "../api/http";
import type { TabParamList } from "../navigation/types";
import { setTabTransition } from "../navigation/tabTransition";
import { applyAssessmentRecordToStore } from "../utils/openAssessmentRecord";
import type { ProfileHistoryItem } from "../utils/profileHistory";
import { useAnalysisStore } from "../store/analysisStore";

export function useOpenProfileHistoryItem() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [openingCaseId, setOpeningCaseId] = useState<number | null>(null);

  const openHistoryItem = useCallback(
    async (item: ProfileHistoryItem) => {
      if (openingCaseId) return;

      if (item.localRecord) {
        applyAssessmentRecordToStore(item.localRecord);
        setTabTransition(1);
        navigation.navigate("Analysis", { screen: "AnalysisResult" });
        return;
      }

      setOpeningCaseId(item.id);

      try {
        const detail = await fetchWoundCaseDetailRequest(item.id);
        useAnalysisStore.setState({
          photos: detail.photos,
          selectedPhotoIndex: 0,
          form: detail.form,
          caseId: detail.caseId,
          result: detail.analysis,
          aiSource: detail.meta?.aiSource ?? null,
          aiNote: detail.meta?.aiNote ?? null,
          aiModel: detail.meta?.aiModel ?? null
        });
        setTabTransition(1);
        navigation.navigate("Analysis", { screen: "AnalysisResult" });
      } catch (error) {
        Alert.alert("ไม่สามารถเปิดผลวิเคราะห์", getApiErrorMessage(error));
      } finally {
        setOpeningCaseId(null);
      }
    },
    [navigation, openingCaseId]
  );

  return { openingCaseId, openHistoryItem };
}

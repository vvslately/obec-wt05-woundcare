import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { deleteWoundCaseRequest } from "../api/woundCases";
import { getApiErrorMessage } from "../api/http";
import { useAnalysisStore } from "../store/analysisStore";
import { useAssessmentHistoryStore } from "../store/assessmentHistoryStore";
import type { ProfileHistoryItem } from "../utils/profileHistory";

export function useDeleteProfileHistoryItem(onDeleted?: () => void) {
  const [deletingCaseId, setDeletingCaseId] = useState<number | null>(null);

  const deleteHistoryItem = useCallback(
    (item: ProfileHistoryItem) => {
      Alert.alert(
        "ลบประวัติการวิเคราะห์",
        "ต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ลบ",
            style: "destructive",
            onPress: () => {
              void (async () => {
                setDeletingCaseId(item.id);

                try {
                  if (!item.localRecord) {
                    await deleteWoundCaseRequest(item.id);
                  }

                  await useAssessmentHistoryStore.getState().removeRecord(item.id);

                  const { caseId } = useAnalysisStore.getState();
                  if (caseId === item.id) {
                    useAnalysisStore.getState().resetFlow();
                  }

                  onDeleted?.();
                } catch (error) {
                  Alert.alert(
                    "ไม่สามารถลบประวัติ",
                    getApiErrorMessage(error)
                  );
                } finally {
                  setDeletingCaseId(null);
                }
              })();
            }
          }
        ]
      );
    },
    [onDeleted]
  );

  return { deletingCaseId, deleteHistoryItem };
}

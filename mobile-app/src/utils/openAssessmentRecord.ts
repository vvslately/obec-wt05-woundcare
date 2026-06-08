import { useAnalysisStore } from "../store/analysisStore";
import type { AssessmentRecord } from "../store/assessmentHistoryStore";

export function applyAssessmentRecordToStore(record: AssessmentRecord) {
  useAnalysisStore.setState({
    photos: record.photos.length ? record.photos : record.photoUri ? [record.photoUri] : [],
    selectedPhotoIndex: 0,
    form: record.form,
    caseId: record.id,
    result: record.result,
    aiSource: record.aiSource,
    aiNote: record.aiNote ?? null,
    aiModel: record.aiModel ?? null
  });
}

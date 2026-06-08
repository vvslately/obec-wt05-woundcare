import type { NavigatorScreenParams } from "@react-navigation/native";
import type { AnalysisStackParamList } from "./analysisTypes";
import type { ProfileStackParamList } from "./profileTypes";

export type TabParamList = {
  Home: undefined;
  Analysis: NavigatorScreenParams<AnalysisStackParamList> | undefined;
  Hospital: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

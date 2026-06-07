import type { NavigatorScreenParams } from "@react-navigation/native";
import type { AnalysisStackParamList } from "./analysisTypes";

export type TabParamList = {
  Home: undefined;
  Analysis: NavigatorScreenParams<AnalysisStackParamList> | undefined;
  Advice: undefined;
  Hospital: undefined;
  Profile: undefined;
};

export type PainLevel = "none" | "mild" | "moderate" | "severe";

export type WoundDuration =
  | "less_3_days"
  | "3_7_days"
  | "1_4_weeks"
  | "more_4_weeks";

export type AnalysisForm = {
  painLevel: PainLevel;
  hasFever: boolean;
  hasItching: boolean;
  hasSwelling: boolean;
  hasPus: boolean;
  woundDuration: WoundDuration;
  woundLocation: string;
  additionalNote: string;
  conditions: string[];
  medications: string;
};

export type ConditionResult = {
  nameTh: string;
  probability: number;
};

export type FindingResult = {
  label: string;
  icon: string;
};

export type FirstAidStep = {
  step: number;
  title: string;
  description: string;
};

export type AnalysisResultData = {
  riskScore: number;
  riskTitle: string;
  disclaimer: string;
  warningNote: string;
  conditions: ConditionResult[];
  findings: FindingResult[];
  firstAid: FirstAidStep[];
  emergencyWarnings: string[];
};

export type HospitalItem = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm: number;
  etaMinutes: number;
};

export const DEFAULT_ANALYSIS_FORM: AnalysisForm = {
  painLevel: "moderate",
  hasFever: false,
  hasItching: false,
  hasSwelling: false,
  hasPus: false,
  woundDuration: "3_7_days",
  woundLocation: "ขา - หน้าแข้ง (ด้านหน้า)",
  additionalNote: "",
  conditions: ["เบาหวาน"],
  medications: ""
};

export const PAIN_OPTIONS: { value: PainLevel; label: string }[] = [
  { value: "none", label: "ไม่มี" },
  { value: "mild", label: "เล็กน้อย" },
  { value: "moderate", label: "ปานกลาง" },
  { value: "severe", label: "มาก" }
];

export const DURATION_OPTIONS: { value: WoundDuration; label: string }[] = [
  { value: "less_3_days", label: "< 3 วัน" },
  { value: "3_7_days", label: "3-7 วัน" },
  { value: "1_4_weeks", label: "1-4 สัปดาห์" },
  { value: "more_4_weeks", label: "> 4 สัปดาห์" }
];

export const LOCATION_OPTIONS = [
  "ขา - หน้าแข้ง (ด้านหน้า)",
  "ขา - น่อง",
  "แขน - ด้านนอก",
  "มือ",
  "เท้า",
  "อื่น ๆ"
];

export const CONDITION_OPTIONS = [
  "เบาหวาน",
  "ความดันโลหิตสูง",
  "ภูมิแพ้",
  "ผิวหนังอักเสบ (Eczema)",
  "หอบหืด",
  "ไม่มีโรคประจำตัว"
];

export const DEMO_ANALYSIS: AnalysisResultData = {
  riskScore: 78,
  riskTitle: "มีความเสี่ยงต่อการติดเชื้อผิวหนัง",
  disclaimer:
    "ผลลัพธ์นี้เป็นการประเมินเบื้องต้นจาก AI ไม่ใช่การวินิจฉัยทางการแพทย์ กรุณาพบแพทย์หากอาการไม่ดีขึ้น",
  warningNote:
    "หากมีไข้สูง ปวดรุนแรง หรือแผลขยายเร็ว ควรพบแพทย์ทันที",
  conditions: [
    { nameTh: "การติดเชื้อที่ผิวหนัง (Infected wound)", probability: 78 },
    { nameTh: "ผื่นแพ้สัมผัส (Contact dermatitis)", probability: 35 },
    { nameTh: "แผลกดทับระยะแรก (Pressure sore)", probability: 18 }
  ],
  findings: [
    { label: "ผิวแดง", icon: "ellipse" },
    { label: "บวมเล็กน้อย", icon: "water-outline" },
    { label: "ชื้น/มีความชื้น", icon: "rainy-outline" },
    { label: "ขอบแผลไม่เรียบ", icon: "shapes-outline" }
  ],
  firstAid: [
    {
      step: 1,
      title: "ล้างมือให้สะอาด",
      description: "ล้างมือก่อนและหลังสัมผัสแผลทุกครั้ง"
    },
    {
      step: 2,
      title: "ทำความสะอาดแผล",
      description: "ใช้น้ำเกลือหรือน้ำสะอาดล้างแผลเบา ๆ"
    },
    {
      step: 3,
      title: "ปิดแผลด้วยผ้าก๊อซปลอดเชื้อ",
      description: "หลีกเลี่ยงการปิดแน่นเกินไป"
    },
    {
      step: 4,
      title: "หลีกเลี่ยงการเกา/บีบ/แกะ",
      description: "อย่าเกา บีบ หรือแกะแผล"
    },
    {
      step: 5,
      title: "สังเกตอาการอย่างใกล้ชิด",
      description: "หากอาการแย่ลง ให้พบแพทย์ทันที"
    }
  ],
  emergencyWarnings: [
    "ไข้สูงกว่า 38.5°C",
    "ปวดรุนแรงขึ้นเรื่อย ๆ",
    "แดง/บวมล spread เร็ว",
    "มีหนอง/น้ำเหลืองมาก"
  ]
};

export const DEMO_HOSPITALS: HospitalItem[] = [
  {
    id: 1,
    name: "รพ. ศิริราช",
    address: "2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพมหานคร",
    phone: "02-419-7000",
    latitude: 13.7583,
    longitude: 100.4853,
    distanceKm: 2.4,
    etaMinutes: 8
  },
  {
    id: 2,
    name: "รพ. สมิติเวช สุขุมวิท",
    address: "133 ถนนสุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร",
    phone: "02-022-2222",
    latitude: 13.7236,
    longitude: 100.5776,
    distanceKm: 4.8,
    etaMinutes: 15
  },
  {
    id: 3,
    name: "รพ. กรุงเทพคริสเตียน",
    address: "124 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร",
    phone: "02-235-1000",
    latitude: 13.7266,
    longitude: 100.5347,
    distanceKm: 6.1,
    etaMinutes: 19
  }
];

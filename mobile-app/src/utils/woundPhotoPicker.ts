import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestCameraPermissionsAsync();
  if (requested.granted) return true;

  Alert.alert(
    "ไม่ได้รับอนุญาตใช้กล้อง",
    "กรุณาอนุญาตการเข้าถึงกล้องใน Settings เพื่อถ่ายรูปแผล",
    [
      { text: "ยกเลิก", style: "cancel" },
      { text: "เปิด Settings", onPress: () => Linking.openSettings() }
    ]
  );
  return false;
}

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (requested.granted) return true;

  Alert.alert(
    "ไม่ได้รับอนุญาตเข้าถึงรูปภาพ",
    "กรุณาอนุญาตการเข้าถึงคลังภาพใน Settings เพื่ออัปโหลดรูปแผล",
    [
      { text: "ยกเลิก", style: "cancel" },
      { text: "เปิด Settings", onPress: () => Linking.openSettings() }
    ]
  );
  return false;
}

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.85
};

export async function takeWoundPhoto(): Promise<string | null> {
  if (!(await ensureCameraPermission())) return null;

  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) return null;

  return result.assets[0].uri;
}

export async function pickWoundPhotoFromGallery(): Promise<string | null> {
  if (!(await ensureLibraryPermission())) return null;

  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) return null;

  return result.assets[0].uri;
}

export async function cropWoundPhotoFromGallery(): Promise<string | null> {
  return pickWoundPhotoFromGallery();
}

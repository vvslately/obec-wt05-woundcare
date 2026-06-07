import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  AnalysisActionBar,
  AnalysisHeader,
  WoundPhotoPreview
} from "../components/analysis";
import type { AnalysisStackParamList } from "../navigation/analysisTypes";
import type { TabParamList } from "../navigation/types";
import { setTabTransition } from "../navigation/tabTransition";
import { useAnalysisStore } from "../store/analysisStore";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useScreenLayout } from "../hooks/useScreenLayout";
import {
  cropWoundPhotoFromGallery,
  pickWoundPhotoFromGallery,
  takeWoundPhoto
} from "../utils/woundPhotoPicker";

type UploadPhotoRoute = RouteProp<AnalysisStackParamList, "UploadPhoto">;
type UploadPhotoNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<AnalysisStackParamList, "UploadPhoto">,
  BottomTabNavigationProp<TabParamList>
>;

export function AnalysisScreen() {
  const navigation = useNavigation<UploadPhotoNavigation>();
  const route = useRoute<UploadPhotoRoute>();
  const setPhotosInStore = useAnalysisStore((s) => s.setPhotos);
  const { horizontal } = useScreenLayout();
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const selectedUri = photos[selectedIndex] ?? null;

  const addPhoto = useCallback((uri: string, replaceIndex?: number) => {
    if (replaceIndex !== undefined) {
      setPhotos((prev) => {
        const next = [...prev];
        next[replaceIndex] = uri;
        return next;
      });
      setSelectedIndex(replaceIndex);
      return;
    }

    setPhotos((prev) => {
      const next = [...prev, uri];
      setSelectedIndex(next.length - 1);
      return next;
    });
  }, []);

  const handleTakePhoto = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await takeWoundPhoto();
      if (uri) {
        if (selectedUri) {
          addPhoto(uri, selectedIndex);
        } else {
          addPhoto(uri);
        }
      }
    } finally {
      setBusy(false);
    }
  }, [addPhoto, busy, selectedIndex, selectedUri]);

  const handlePickFromGallery = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await pickWoundPhotoFromGallery();
      if (uri) {
        if (selectedUri) {
          addPhoto(uri, selectedIndex);
        } else {
          addPhoto(uri);
        }
      }
    } finally {
      setBusy(false);
    }
  }, [addPhoto, busy, selectedIndex, selectedUri]);

  const handleAddPhoto = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await pickWoundPhotoFromGallery();
      if (uri) addPhoto(uri);
    } finally {
      setBusy(false);
    }
  }, [addPhoto, busy]);

  const handleCrop = useCallback(async () => {
    if (busy || !selectedUri) return;
    setBusy(true);
    try {
      const uri = await cropWoundPhotoFromGallery();
      if (uri) addPhoto(uri, selectedIndex);
    } finally {
      setBusy(false);
    }
  }, [addPhoto, busy, selectedIndex, selectedUri]);

  const handleConfirm = useCallback(() => {
    if (!selectedUri) {
      Alert.alert("ยังไม่มีรูป", "กรุณาถ่ายรูปหรืออัปโหลดจากคลังภาพก่อน");
      return;
    }

    setPhotosInStore(photos);
    navigation.navigate("AdditionalInfo");
  }, [navigation, photos, selectedUri, setPhotosInStore]);

  useFocusEffect(
    useCallback(() => {
      const action = route.params?.openPicker;
      if (!action) return;

      navigation.setParams({ openPicker: undefined });

      if (action === "camera") {
        handleTakePhoto();
      } else {
        handlePickFromGallery();
      }
    }, [handlePickFromGallery, handleTakePhoto, navigation, route.params?.openPicker])
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <AnalysisHeader
        onBack={() => {
          setTabTransition(0);
          navigation.getParent()?.navigate("Home");
        }}
      />

      <Text style={[styles.instructions, { paddingHorizontal: horizontal }]}>
        ถ่ายภาพให้ชัดเจน ในที่มีแสงสว่าง{"\n"}
        และทำความสะอาดบริเวณแผลก่อนถ่าย
      </Text>

      {selectedUri ? (
        <View style={[styles.previewWrap, { paddingHorizontal: horizontal }]}>
          <WoundPhotoPreview
            uri={selectedUri}
            photos={photos}
            selectedIndex={selectedIndex}
            onSelectPhoto={setSelectedIndex}
            onAddPhoto={handleAddPhoto}
          />
        </View>
      ) : (
        <EmptyPhotoPicker
          busy={busy}
          horizontal={horizontal}
          onTakePhoto={handleTakePhoto}
          onPickFromGallery={handlePickFromGallery}
        />
      )}

      <AnalysisActionBar
        disabled={busy}
        confirmDisabled={!selectedUri}
        onRetake={handleTakePhoto}
        onCrop={handleCrop}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

type EmptyPhotoPickerProps = {
  busy: boolean;
  horizontal: number;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
};

function EmptyPhotoPicker({
  busy,
  horizontal,
  onTakePhoto,
  onPickFromGallery
}: EmptyPhotoPickerProps) {
  return (
    <View style={[styles.emptyWrap, { paddingHorizontal: horizontal }]}>
      <View style={styles.emptyFrame}>
        <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>ยังไม่มีรูปแผล</Text>
        <Text style={styles.emptySubtitle}>
          ถ่ายรูปใหม่หรือเลือกจากคลังภาพ
        </Text>

        <Pressable
          style={[styles.emptyBtn, styles.emptyBtnPrimary]}
          onPress={onTakePhoto}
          disabled={busy}
        >
          <Ionicons name="camera" size={18} color={colors.card} />
          <Text style={styles.emptyBtnPrimaryText}>ถ่ายรูปแผล</Text>
        </Pressable>

        <Pressable
          style={[styles.emptyBtn, styles.emptyBtnSecondary]}
          onPress={onPickFromGallery}
          disabled={busy}
        >
          <Ionicons name="image-outline" size={18} color={colors.brand} />
          <Text style={styles.emptyBtnSecondaryText}>อัปโหลดจากคลังภาพ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  instructions: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    paddingVertical: spacing.md
  },
  emptyWrap: {
    flex: 1,
    paddingTop: spacing.sm
  },
  previewWrap: {
    flex: 1,
    paddingTop: spacing.sm,
    minHeight: 0
  },
  emptyFrame: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 8
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: "center"
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14
  },
  emptyBtnPrimary: {
    backgroundColor: colors.brand
  },
  emptyBtnPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.card
  },
  emptyBtnSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyBtnSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand
  }
});

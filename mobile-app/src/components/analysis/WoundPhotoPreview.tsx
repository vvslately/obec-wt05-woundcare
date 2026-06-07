import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

type WoundPhotoPreviewProps = {
  uri: string;
  photos: string[];
  selectedIndex: number;
  onSelectPhoto: (index: number) => void;
  onAddPhoto?: () => void;
};

export function WoundPhotoPreview({
  uri,
  photos,
  selectedIndex,
  onSelectPhoto,
  onAddPhoto
}: WoundPhotoPreviewProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.frame}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />

        <View style={styles.focusBox} />

        <View style={styles.thumbs}>
          {photos.map((photoUri, index) => (
            <Pressable
              key={`${photoUri}-${index}`}
              style={[
                styles.thumb,
                index === selectedIndex && styles.thumbActive
              ]}
              onPress={() => onSelectPhoto(index)}
            >
              <Image
                source={{ uri: photoUri }}
                style={styles.thumbImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
          <Pressable style={styles.thumbAdd} onPress={onAddPhoto}>
            <Ionicons name="add" size={22} color={colors.card} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: 0
  },
  frame: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  focusBox: {
    position: "absolute",
    top: "28%",
    left: "18%",
    right: "18%",
    bottom: "28%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    borderStyle: "dashed",
    borderRadius: 4
  },
  thumbs: {
    position: "absolute",
    left: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 10
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    overflow: "hidden"
  },
  thumbActive: {
    borderColor: colors.card
  },
  thumbImage: {
    width: "100%",
    height: "100%"
  },
  thumbAdd: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)"
  }
});

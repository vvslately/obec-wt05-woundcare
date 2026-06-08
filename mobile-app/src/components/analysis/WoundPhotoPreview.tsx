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
  onEditPhoto?: (index: number) => void;
  onDeletePhoto?: (index: number) => void;
};

export function WoundPhotoPreview({
  uri,
  photos,
  selectedIndex,
  onSelectPhoto,
  onAddPhoto,
  onEditPhoto,
  onDeletePhoto
}: WoundPhotoPreviewProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.frame}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />

        <View style={styles.focusBox} />

        {(onEditPhoto || onDeletePhoto) && (
          <View style={styles.overlayActions}>
            {onEditPhoto ? (
              <Pressable
                style={styles.overlayBtn}
                hitSlop={8}
                onPress={() => onEditPhoto(selectedIndex)}
              >
                <Ionicons name="create-outline" size={18} color={colors.card} />
              </Pressable>
            ) : null}
            {onDeletePhoto ? (
              <Pressable
                style={[styles.overlayBtn, styles.overlayBtnDanger]}
                hitSlop={8}
                onPress={() => onDeletePhoto(selectedIndex)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.card} />
              </Pressable>
            ) : null}
          </View>
        )}

        <View style={styles.thumbs}>
          {photos.map((photoUri, index) => (
            <View key={`${photoUri}-${index}`} style={styles.thumbWrap}>
              <Pressable
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
              {onDeletePhoto && photos.length > 0 ? (
                <Pressable
                  style={styles.thumbDelete}
                  hitSlop={6}
                  onPress={() => onDeletePhoto(index)}
                >
                  <Ionicons name="close" size={12} color={colors.card} />
                </Pressable>
              ) : null}
            </View>
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
  overlayActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8
  },
  overlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)"
  },
  overlayBtnDanger: {
    backgroundColor: "rgba(180,40,40,0.75)"
  },
  thumbs: {
    position: "absolute",
    left: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 10
  },
  thumbWrap: {
    position: "relative"
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
  thumbDelete: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.notification,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.card
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

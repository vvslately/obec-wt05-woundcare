import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";

type BirthDateFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  style?: ViewStyle;
};

const DEFAULT_DATE = new Date(1990, 0, 1);
const MIN_DATE = new Date(new Date().getFullYear() - 120, 0, 1);
const FADE_DURATION = 280;

export function formatBirthDateDisplay(date: Date | null): string {
  if (!date) return "เลือกวันเกิด";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    calendar: "gregory"
  });
}

export function toBirthDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BirthDateField({ value, onChange, style }: BirthDateFieldProps) {
  const insets = useSafeAreaInsets();
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(value || DEFAULT_DATE);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(16)).current;
  const previewOpacity = useRef(new Animated.Value(1)).current;
  const previewTranslateY = useRef(new Animated.Value(0)).current;
  const fieldOpacity = useRef(new Animated.Value(1)).current;
  const fieldTranslateY = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);
  const prevValueKey = useRef(value ? value.toISOString() : "");

  const resetAnimation = () => {
    backdropOpacity.setValue(0);
    sheetOpacity.setValue(0);
    sheetTranslateY.setValue(16);
  };

  const animateIn = () => {
    resetAnimation();
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: FADE_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  };

  const animateOut = (onDone?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 10,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      closingRef.current = false;
      if (finished) {
        setShowPicker(false);
        onDone?.();
      }
    });
  };

  useEffect(() => {
    if (showPicker) {
      animateIn();
    }
  }, [showPicker]);

  useEffect(() => {
    const nextKey = value ? value.toISOString() : "";
    if (nextKey === prevValueKey.current) return;
    prevValueKey.current = nextKey;

    fieldOpacity.setValue(0.35);
    fieldTranslateY.setValue(6);
    Animated.parallel([
      Animated.timing(fieldOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(fieldTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [fieldOpacity, fieldTranslateY, value]);

  const animateDraftChange = () => {
    previewOpacity.setValue(0.3);
    previewTranslateY.setValue(8);
    Animated.parallel([
      Animated.timing(previewOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(previewTranslateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  };

  const openPicker = () => {
    setDraftDate(value || DEFAULT_DATE);
    setShowPicker(true);
  };

  const closePicker = () => {
    animateOut();
  };

  const confirmPicker = () => {
    animateOut(() => {
      onChange(draftDate);
    });
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(false);

    if (event.type === "dismissed") {
      return;
    }

    if (selected) {
      onChange(selected);
    }
  };

  return (
    <View style={style}>
      <Pressable style={styles.wrap} onPress={openPicker}>
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        <Animated.Text
          style={[
            styles.text,
            !value && styles.placeholder,
            {
              opacity: fieldOpacity,
              transform: [{ translateY: fieldTranslateY }]
            }
          ]}
        >
          {formatBirthDateDisplay(value)}
        </Animated.Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      {Platform.OS === "ios" ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="none"
          onRequestClose={closePicker}
        >
          <View style={styles.modalRoot}>
            <Animated.View
              style={[styles.backdrop, { opacity: backdropOpacity }]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closePicker} />
            </Animated.View>

            <Animated.View
              style={[
                styles.sheet,
                {
                  paddingBottom: Math.max(insets.bottom, 16),
                  opacity: sheetOpacity,
                  transform: [{ translateY: sheetTranslateY }]
                }
              ]}
            >
              <View style={styles.toolbar}>
                <Pressable style={styles.toolbarSide} onPress={closePicker} hitSlop={8}>
                  <Text style={styles.cancelText}>ยกเลิก</Text>
                </Pressable>
                <View style={styles.toolbarCenter} pointerEvents="none">
                  <Text style={styles.toolbarTitle}>เลือกวันเกิด</Text>
                </View>
                <Pressable
                  style={[styles.toolbarSide, styles.toolbarSideRight]}
                  onPress={confirmPicker}
                  hitSlop={8}
                >
                  <Text style={styles.confirmText}>ตกลง</Text>
                </Pressable>
              </View>

              <Animated.View
                style={[
                  styles.previewWrap,
                  {
                    opacity: previewOpacity,
                    transform: [{ translateY: previewTranslateY }]
                  }
                ]}
              >
                <Text style={styles.previewText}>{formatBirthDateDisplay(draftDate)}</Text>
              </Animated.View>

              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="spinner"
                  locale="th-TH"
                  maximumDate={new Date()}
                  minimumDate={MIN_DATE}
                  onChange={(_, selected) => {
                    if (selected) {
                      setDraftDate(selected);
                      animateDraftChange();
                    }
                  }}
                  style={styles.picker}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      ) : showPicker ? (
        <DateTimePicker
          value={value || DEFAULT_DATE}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={MIN_DATE}
          onChange={handleAndroidChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  text: {
    flex: 1,
    fontSize: 15,
    color: colors.primary
  },
  placeholder: {
    color: colors.textSecondary
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)"
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden"
  },
  toolbar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  toolbarSide: {
    flex: 1,
    zIndex: 1
  },
  toolbarSideRight: {
    alignItems: "flex-end"
  },
  toolbarCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center"
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent
  },
  previewWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4
  },
  previewText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center"
  },
  pickerWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  picker: {
    width: 320,
    height: 216
  }
});

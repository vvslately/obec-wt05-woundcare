import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR } from "../theme/layout";
import { colors } from "../theme/colors";
import { setTabTransition } from "./tabTransition";

gsap.registerPlugin(useGSAP);

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<
  string,
  { label: string; active: TabIconName; inactive: TabIconName }
> = {
  Home: { label: "หน้าหลัก", active: "home", inactive: "home-outline" },
  Analysis: {
    label: "วิเคราะห์",
    active: "document-text",
    inactive: "document-text-outline"
  },
  Hospital: {
    label: "โรงพยาบาล",
    active: "medkit",
    inactive: "medkit-outline"
  },
  Profile: { label: "โปรไฟล์", active: "person", inactive: "person-outline" }
};

const FILL_EASE = "power2.inOut";

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const barRef = useRef<React.ComponentRef<typeof Animated.View>>(null);
  const bottomInset =
    Math.max(insets.bottom, TAB_BAR.minBottomInset) + TAB_BAR.bottomOffset;

  const barTranslateY = useRef(new Animated.Value(14)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  const tabCount = state.routes.length;
  const tabOpacities = useRef(
    Array.from({ length: tabCount }, () => new Animated.Value(0))
  ).current;

  useGSAP(
    () => {
      const bar = { y: 14, o: 0 };
      gsap.to(bar, {
        y: 0,
        o: 1,
        duration: 0.38,
        ease: FILL_EASE,
        onUpdate: () => {
          barTranslateY.setValue(bar.y);
          barOpacity.setValue(bar.o);
        }
      });

      state.routes.forEach((_, index) => {
        const item = { o: 0 };
        gsap.to(item, {
          o: 1,
          duration: 0.32,
          delay: 0.04 + index * 0.03,
          ease: FILL_EASE,
          onUpdate: () => {
            tabOpacities[index].setValue(item.o);
          }
        });
      });
    },
    { scope: barRef }
  );

  return (
    <Animated.View
      ref={barRef}
      style={[
        styles.bar,
        {
          paddingBottom: bottomInset,
          opacity: barOpacity,
          transform: [{ translateY: barTranslateY }]
        }
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TAB_ICONS[route.name];
        if (!config) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true
          });

          if (!focused && !event.defaultPrevented) {
            setTabTransition(index);
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
          >
            <Animated.View
              style={{
                opacity: tabOpacities[index],
                alignItems: "center"
              }}
            >
              <Ionicons
                name={focused ? config.active : config.inactive}
                size={24}
                color={focused ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.label,
                  focused ? styles.labelActive : styles.labelInactive
                ]}
              >
                {config.label}
              </Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 4
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6
  },
  label: {
    fontSize: 11,
    marginTop: 4
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "800"
  },
  labelInactive: {
    color: colors.textSecondary,
    fontWeight: "600"
  }
});

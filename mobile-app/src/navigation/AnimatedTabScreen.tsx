import React, { useCallback, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getTabTransitionDirection } from "./tabTransition";

gsap.registerPlugin(useGSAP);

const SLIDE_OFFSET = Math.round(Dimensions.get("window").width * 0.28);

type AnimatedTabScreenProps = {
  children: React.ReactNode;
};

export function AnimatedTabScreen({ children }: AnimatedTabScreenProps) {
  const containerRef = useRef<React.ComponentRef<typeof Animated.View>>(null);
  const translateX = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const direction = getTabTransitionDirection();
      const anim = { x: direction * SLIDE_OFFSET };

      translateX.setValue(direction * SLIDE_OFFSET);

      const tween = gsap.to(anim, {
        x: 0,
        duration: 0.38,
        ease: "power3.out",
        onUpdate: () => {
          translateX.setValue(anim.x);
        }
      });

      return () => {
        tween.kill();
      };
    }, [translateX])
  );

  return (
    <Animated.View
      ref={containerRef}
      style={[styles.container, { transform: [{ translateX }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

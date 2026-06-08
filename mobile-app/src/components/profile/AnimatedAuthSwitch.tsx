import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const SLIDE_OFFSET = Math.round(Dimensions.get("window").width * 0.28);

type AnimatedAuthSwitchProps = {
  viewKey: string;
  direction: number;
  inline?: boolean;
  children: React.ReactNode;
};

export function AnimatedAuthSwitch({
  viewKey,
  direction,
  inline = false,
  children
}: AnimatedAuthSwitchProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      translateX.setValue(0);
      opacity.setValue(1);
      return;
    }

    const anim = { x: direction * SLIDE_OFFSET, o: 0.88 };
    translateX.setValue(anim.x);
    opacity.setValue(anim.o);

    const tween = gsap.to(anim, {
      x: 0,
      o: 1,
      duration: 0.38,
      ease: "power3.out",
      onUpdate: () => {
        translateX.setValue(anim.x);
        opacity.setValue(anim.o);
      }
    });

    return () => {
      tween.kill();
    };
  }, [viewKey, direction, translateX, opacity]);

  return (
    <Animated.View
      style={[
        inline ? styles.inline : styles.container,
        {
          opacity,
          transform: [{ translateX }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inline: {}
});

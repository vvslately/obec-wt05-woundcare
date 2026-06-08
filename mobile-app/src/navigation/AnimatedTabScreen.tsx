import React, { useCallback, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type AnimatedTabScreenProps = {
  children: React.ReactNode;
};

export function AnimatedTabScreen({ children }: AnimatedTabScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const anim = { o: 0 };
      opacity.setValue(0);

      const enterTween = gsap.to(anim, {
        o: 1,
        duration: 0.34,
        ease: "power2.out",
        onUpdate: () => {
          opacity.setValue(anim.o);
        }
      });

      return () => {
        enterTween.kill();
        const exitAnim = { o: 1 };
        gsap.to(exitAnim, {
          o: 0,
          duration: 0.24,
          ease: "power2.in",
          onUpdate: () => {
            opacity.setValue(exitAnim.o);
          }
        });
      };
    }, [opacity])
  );

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

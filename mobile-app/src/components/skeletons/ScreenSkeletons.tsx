import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonCircle,
  SkeletonLine
} from "../common/Skeleton";
import { ScreenShell } from "../common/ScreenShell";
import { useScreenLayout } from "../../hooks/useScreenLayout";
import { colors } from "../../theme/colors";
import { radius, spacing } from "../../theme/spacing";

type SkeletonLayoutProps = {
  horizontal?: number;
};

function ShellHeaderSkeleton() {
  return (
    <View style={styles.header}>
      <SkeletonLine width={120} height={22} />
      <SkeletonCircle size={24} />
    </View>
  );
}

export function HomeScreenSkeleton() {
  return (
    <>
      <ScreenShell header={<ShellHeaderSkeleton />} contentStyle={styles.homeContent}>
        <SkeletonLine width="55%" height={24} />
        <SkeletonLine width="72%" height={14} />
        <SkeletonBlock height={180} />
        <View style={styles.grid}>
          {[0, 1, 2].map((item) => (
            <SkeletonBlock key={item} height={88} style={styles.gridItem} />
          ))}
        </View>
        <SkeletonCard>
          <View style={styles.row}>
            <SkeletonBlock height={64} style={styles.thumb} />
            <View style={styles.flex}>
              <SkeletonLine width="80%" />
              <SkeletonLine width="50%" />
              <SkeletonLine width="60%" />
            </View>
          </View>
        </SkeletonCard>
      </ScreenShell>
    </>
  );
}

export function ProfileScreenSkeleton() {
  return (
    <View style={styles.profileRoot}>
      <View style={styles.profileBody}>
        <SkeletonCard>
          <View style={styles.row}>
            <SkeletonCircle size={72} />
            <View style={[styles.flex, { gap: 8 }]}>
              <SkeletonLine width="70%" height={18} />
              <SkeletonLine width="45%" />
              <SkeletonLine width="85%" />
              <SkeletonLine width="35%" />
            </View>
          </View>
          <SkeletonBlock height={44} style={{ marginTop: spacing.md }} />
        </SkeletonCard>
        <SkeletonLine width={100} height={16} style={{ marginVertical: spacing.md }} />
        <SkeletonBlock height={72} />
        <SkeletonLine width={120} height={16} style={{ marginVertical: spacing.md }} />
        <View style={styles.chips}>
          {[0, 1, 2, 3].map((item) => (
            <SkeletonLine key={item} width={72} height={32} style={styles.chip} />
          ))}
        </View>
        <SkeletonLine width={160} height={16} style={{ marginBottom: spacing.md }} />
        {[0, 1].map((item) => (
          <SkeletonBlock key={item} height={88} style={{ marginBottom: spacing.sm }} />
        ))}
      </View>
    </View>
  );
}

export function HospitalScreenSkeleton() {
  const { width } = useScreenLayout();
  const mapHeight = Math.round(width * 0.52);

  return (
    <ScreenShell header={<ShellHeaderSkeleton />}>
      <SkeletonBlock height={48} style={{ marginBottom: spacing.md }} />
      <SkeletonBlock
        height={mapHeight}
        style={{ marginBottom: spacing.md, borderRadius: radius.lg }}
      />
      <View style={styles.row}>
        <SkeletonLine width={120} height={32} style={styles.chip} />
        <SkeletonLine width={80} height={32} style={styles.chip} />
      </View>
      {[0, 1, 2].map((item) => (
        <SkeletonCard key={item} style={styles.hospitalCard}>
          <View style={styles.row}>
            <SkeletonBlock height={72} style={styles.thumb} />
            <View style={[styles.flex, { gap: 8 }]}>
              <SkeletonLine width="90%" />
              <SkeletonLine width="60%" />
              <SkeletonLine width="100%" height={28} />
            </View>
          </View>
        </SkeletonCard>
      ))}
    </ScreenShell>
  );
}

export function AdviceScreenSkeleton() {
  return (
    <ScreenShell header={<ShellHeaderSkeleton />}>
      {[0, 1, 2, 4, 5].map((item) => (
        <SkeletonCard key={item} style={styles.stepCard}>
          <View style={styles.row}>
            <SkeletonCircle size={44} />
            <View style={[styles.flex, { gap: 8 }]}>
              <SkeletonLine width="75%" />
              <SkeletonLine width="100%" />
              <SkeletonLine width="92%" />
            </View>
          </View>
        </SkeletonCard>
      ))}
      <SkeletonBlock height={120} style={{ marginVertical: spacing.md }} />
      <SkeletonBlock height={48} style={{ marginBottom: spacing.sm }} />
      <SkeletonBlock height={48} />
    </ScreenShell>
  );
}

export function AnalysisScreenSkeleton() {
  return (
    <View style={styles.analysisRoot}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.analysisHeader}>
          <SkeletonCircle size={28} />
          <SkeletonLine width={120} height={18} />
          <SkeletonCircle size={28} />
        </View>
      </SafeAreaView>
      <View style={styles.analysisBody}>
        <SkeletonBlock height={280} />
        <View style={styles.row}>
          {[0, 1, 2].map((item) => (
            <SkeletonBlock key={item} height={56} style={styles.flex} />
          ))}
        </View>
        <SkeletonBlock height={52} />
      </View>
    </View>
  );
}

export function AdditionalInfoScreenSkeleton() {
  return (
    <ScreenShell header={<ShellHeaderSkeleton />}>
      {[0, 1, 2, 3, 4].map((item) => (
        <View key={item} style={{ marginBottom: spacing.md }}>
          <SkeletonLine width={120} height={14} style={{ marginBottom: spacing.sm }} />
          <SkeletonBlock height={44} />
        </View>
      ))}
      <SkeletonBlock height={52} />
    </ScreenShell>
  );
}

export function AnalysisResultScreenSkeleton() {
  return (
    <ScreenShell header={<ShellHeaderSkeleton />}>
      <View style={styles.center}>
        <SkeletonCircle size={140} />
      </View>
      <SkeletonLine width="60%" height={18} style={{ alignSelf: "center", marginVertical: spacing.md }} />
      {[0, 1, 2].map((item) => (
        <View key={item} style={{ marginBottom: spacing.md }}>
          <SkeletonLine width="40%" style={{ marginBottom: spacing.xs }} />
          <SkeletonBlock height={10} />
        </View>
      ))}
      <SkeletonBlock height={100} style={{ marginTop: spacing.sm }} />
    </ScreenShell>
  );
}

export function AuthScreenSkeleton() {
  return (
    <View style={styles.authRoot}>
      <View style={styles.authLogo}>
        <SkeletonCircle size={60} />
        <SkeletonLine width={160} height={28} />
      </View>
      <SkeletonLine width="70%" height={22} style={{ alignSelf: "center" }} />
      <SkeletonLine width="88%" height={14} style={{ alignSelf: "center" }} />
      <SkeletonBlock height={52} style={{ marginTop: spacing.lg }} />
      <SkeletonBlock height={52} style={{ marginTop: spacing.sm }} />
      <SkeletonBlock height={52} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  homeContent: {
    gap: spacing.lg,
    paddingTop: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card
  },
  grid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  gridItem: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  flex: {
    flex: 1,
    gap: spacing.xs
  },
  thumb: {
    width: 64,
    borderRadius: radius.md
  },
  profileRoot: {
    flex: 1,
    backgroundColor: colors.background
  },
  profileBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.lg
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  chip: {
    borderRadius: radius.pill
  },
  hospitalCard: {
    marginBottom: spacing.sm
  },
  stepCard: {
    marginBottom: spacing.sm
  },
  analysisRoot: {
    flex: 1,
    backgroundColor: colors.background
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  analysisBody: {
    flex: 1,
    paddingHorizontal: 20,
    gap: spacing.md
  },
  center: {
    alignItems: "center"
  },
  authRoot: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: spacing.xl
  },
  authLogo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    marginBottom: spacing.xl
  }
});

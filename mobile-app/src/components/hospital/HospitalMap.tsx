import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import type { HospitalItem } from "../../types/analysis";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";

const DEFAULT_REGION: Region = {
  latitude: 13.7563,
  longitude: 100.5018,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08
};

type HospitalMapProps = {
  hospitals: HospitalItem[];
  height: number;
};

function getHospitalMarkers(hospitals: HospitalItem[]) {
  return hospitals.filter(
    (item) =>
      item.latitude != null &&
      item.longitude != null &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude)
  );
}

function getMapRegion(markers: HospitalItem[]): Region {
  if (markers.length === 0) return DEFAULT_REGION;

  if (markers.length === 1) {
    return {
      latitude: markers[0].latitude!,
      longitude: markers[0].longitude!,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03
    };
  }

  const latitudes = markers.map((item) => item.latitude!);
  const longitudes = markers.map((item) => item.longitude!);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitudeDelta = Math.max((maxLat - minLat) * 1.6, 0.03);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.6, 0.03);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta
  };
}

export function HospitalMap({ hospitals, height }: HospitalMapProps) {
  const markers = useMemo(() => getHospitalMarkers(hospitals), [hospitals]);
  const region = useMemo(() => getMapRegion(markers), [markers]);

  if (markers.length === 0) {
    return (
      <View style={[styles.fallback, { height }]}>
        <Ionicons name="map-outline" size={42} color={colors.textSecondary} />
        <Text style={styles.fallbackText}>ยังไม่มีพิกัดโรงพยาบาลสำหรับแสดงแผนที่</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        toolbarEnabled={false}
      >
        {markers.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude!,
              longitude: item.longitude!
            }}
            title={item.name}
            description={item.address ?? undefined}
            pinColor={colors.brand}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  map: {
    flex: 1
  },
  fallback: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24
  },
  fallbackText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center"
  }
});

import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

const API_KEY = "AIzaSyCDnj-plCPLhZUgdc7VDGX-DITm2pZAYA8";

const Airmap = () => {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  if (!coords) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
      >
        {/* Marker for current location */}
        <Marker coordinate={coords} title="You are here" />

        {/* Air Quality API heatmap overlay */}
        <UrlTile
          urlTemplate={`https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/{z}/{x}/{y}?key=${API_KEY}`}
          zIndex={-1}
          maximumZ={20} // Higher zoom for clarity
          flipY={false} // Google Maps tile scheme
        />
      </MapView>
    </View>
  );
};

export default Airmap;

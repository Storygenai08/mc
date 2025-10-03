"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native"
import { api } from "@/lib/api"

// react-native-maps and expo-location are loaded dynamically to avoid web-build issues
type RegionType = {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
}

interface Restaurant {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  cuisineType: string
  isVerified: boolean
}

export default function ExploreScreen() {
  const [location, setLocation] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [region, setRegion] = useState<RegionType>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [MapModule, setMapModule] = useState<any>(null)

  useEffect(() => {
    requestLocationPermission()
    // Dynamically load map module (only when running on native platforms or supported environments)
    ;(async () => {
      try {
        const mod = await import("react-native-maps")
        setMapModule(mod)
      } catch (err) {
        // map module not available for web or not installed - fail gracefully
        console.warn("react-native-maps not available:", err)
      }
    })()
  }, [])

  useEffect(() => {
    if (location) {
      fetchNearbyRestaurants()
    }
  }, [location])

  const requestLocationPermission = async () => {
    try {
      const Location = await import("expo-location")
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to show nearby restaurants.")
        setLoading(false)
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation)
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error getting location:", error)
      Alert.alert("Error", "Failed to get your location.")
      setLoading(false)
    }
  }

  const fetchNearbyRestaurants = async () => {
    if (!location) return
    try {
      const data = await api.restaurants.nearby(location.coords.latitude, location.coords.longitude)
      setRestaurants(data as any)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    }
  }

  // Haversine formula for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {MapModule ? (
        <MapModule.default
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {restaurants.map((restaurant) => (
            <MapModule.Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              onPress={() => setSelectedRestaurant(restaurant)}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.marker, restaurant.isVerified && styles.verifiedMarker]}>
                  <Text style={styles.markerEmoji}>🍽️</Text>
                </View>
              </View>
            </MapModule.Marker>
          ))}
        </MapModule.default>
      ) : (
        <View style={[styles.map, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: "#666" }}>Map not available in this environment.</Text>
        </View>
      )}

      {selectedRestaurant && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedRestaurant(null)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantHeader}>
              <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
              {selectedRestaurant.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.cuisineType}>{selectedRestaurant.cuisineType}</Text>
            <Text style={styles.address}>{selectedRestaurant.address}</Text>

            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!location && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>Enable location to discover nearby restaurants</Text>
          <TouchableOpacity style={styles.enableButton} onPress={requestLocationPermission}>
            <Text style={styles.enableButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter",
    color: "#2D1B12",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  verifiedMarker: {
    borderWidth: 3,
    borderColor: "#FFB800",
  },
  markerEmoji: {
    fontSize: 22,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#2D1B12",
    fontFamily: "Inter SemiBold",
  },
  restaurantInfo: {
    paddingTop: 8,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 24,
    fontFamily: "Inter Bold",
    color: "#2D1B12",
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: "#FFB800",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: "Inter SemiBold",
    color: "#FFFFFF",
  },
  cuisineType: {
    fontSize: 16,
    fontFamily: "Inter SemiBold",
    color: "#FF6B35",
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#666",
    marginBottom: 16,
  },
  viewButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 16,
    fontFamily: "Inter SemiBold",
    color: "#FFFFFF",
  },
  permissionBanner: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#2D1B12",
    marginBottom: 12,
    textAlign: "center",
  },
  enableButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  enableButtonText: {
    fontSize: 14,
    fontFamily: "Inter SemiBold",
    color: "#FFFFFF",
  },
})

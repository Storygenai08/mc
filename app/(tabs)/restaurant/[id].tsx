"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { api } from "@/lib/api"
import { Colors } from "@/constants/Colors"
import { Button } from "@/components/Button"

export default function RestaurantProfile() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await api.restaurants.get(id!)
        setRestaurant(data)
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to load restaurant")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }
  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Restaurant not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.sub}>
          {restaurant.cuisineType} • {restaurant.address}
        </Text>
      </View>

      <FlatList
        data={restaurant.reviews || []}
        keyExtractor={(r: any) => r.id}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Button
              title="Write a Review"
              onPress={() => router.push({ pathname: "/(tabs)/create-review", params: { restaurantId: id } })}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photos?.[0] ? <Image source={{ uri: item.photos[0] }} style={styles.photo} /> : null}
            <View style={styles.cardBody}>
              <Text style={styles.rating}>
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
              </Text>
              <Text style={styles.text}>{item.reviewText}</Text>
              <Text style={styles.meta}>
                by {item.user?.username || "Foodie"} • {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.secondary },
  title: { fontSize: 24, fontFamily: "Inter Bold", color: Colors.text.primary },
  sub: { fontSize: 14, color: Colors.text.secondary },
  card: { margin: 16, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3 },
  photo: { width: "100%", height: 220, backgroundColor: "#eee" },
  cardBody: { padding: 12 },
  rating: { color: "#FFB800", marginBottom: 6 },
  text: { color: Colors.text.primary, marginBottom: 6 },
  meta: { color: Colors.text.secondary, fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  err: { color: "crimson" },
})

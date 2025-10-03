"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { api } from "@/lib/api"
import { Colors } from "@/constants/Colors"
import { Button } from "@/components/Button"

export default function CreateReview() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>()
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isPromoter, setIsPromoter] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  // NOTE: For fully native flows, integrate react-native-vision-camera.
  // Here we provide a simple gallery picker fallback via expo-image-picker.
  const pickImage = async () => {
    const ImagePicker = await import("expo-image-picker")
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow photo library access.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false })
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri)
    }
  }

  const submit = async () => {
    try {
      const photoUrls = photoUri ? [photoUri] : []
      await api.reviews.create(restaurantId!, rating, reviewText, isPromoter, photoUrls)
      Alert.alert("Success", "Review submitted!")
      router.back()
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not submit review")
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Write a Review</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Rating</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Text style={[styles.star, n <= rating && styles.starActive]}>{n <= rating ? "★" : "☆"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.label}>Photos</Text>
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}
      <Button
        title={photoUri ? "Change Photo" : "Add Photo"}
        onPress={pickImage}
        variant="outline"
        style={{ marginBottom: 12 }}
      />

      <Text style={styles.label}>Your review</Text>
      <TextInput
        style={styles.input}
        multiline
        value={reviewText}
        onChangeText={setReviewText}
        placeholder="Tell us about your experience..."
      />

      <TouchableOpacity style={styles.toggle} onPress={() => setIsPromoter((v) => !v)}>
        <View style={[styles.checkbox, isPromoter && styles.checkboxOn]} />
        <Text style={styles.toggleText}>Request to become a promoter</Text>
      </TouchableOpacity>

      <Button title="Submit Review" onPress={submit} />
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontFamily: "Inter Bold", color: Colors.text.primary, marginBottom: 16 },
  label: { fontSize: 14, color: Colors.text.secondary, marginBottom: 8 },
  input: {
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  stars: { flexDirection: "row", gap: 8 },
  star: { fontSize: 22, color: "#bbb" },
  starActive: { color: "#FFB800" },
  photo: { width: "100%", height: 240, borderRadius: 12, marginBottom: 12, backgroundColor: "#eee" },
  toggle: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    backgroundColor: "transparent",
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleText: { color: Colors.text.primary },
})

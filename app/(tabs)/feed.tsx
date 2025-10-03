"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl } from "react-native"
import { useAuthStore } from "../../store/authStore"
import { api } from "@/lib/api"

interface Review {
  id: string
  userId: string
  restaurantId: string
  rating: number
  reviewText: string
  createdAt: string
  user?: {
    username: string
    profilePictureUrl?: string
    level: string
  }
  restaurant?: {
    name: string
    cuisineType: string
  }
  photos?: string[]
}

export default function FeedScreen() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const data = await api.reviews.listRecent()
      setReviews(data as any)
    } catch (error) {
      console.error("Error fetching feed:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchFeed()
  }

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= rating ? "★" : "☆"}
          </Text>
        ))}
      </View>
    )
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "gold":
        return "#FFD700"
      case "silver":
        return "#C0C0C0"
      default:
        return "#CD7F32"
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Text style={styles.headerSubtitle}>Discover what foodies are sharing</Text>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyText}>Start following foodies or post your first review!</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {review.user?.profilePictureUrl ? (
                    <Image source={{ uri: review.user.profilePictureUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{review.user?.username?.[0]?.toUpperCase() || "?"}</Text>
                    </View>
                  )}
                  <View style={[styles.levelBadge, { backgroundColor: getLevelColor(review.user?.level || "bronze") }]}>
                    <Text style={styles.levelText}>{review.user?.level?.[0]?.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{review.user?.username || "Anonymous"}</Text>
                  <Text style={styles.restaurantName}>{review.restaurant?.name}</Text>
                </View>
              </View>
              {renderStars(review.rating)}
            </View>

            {review.photos && review.photos.length > 0 && (
              <Image source={{ uri: review.photos[0] }} style={styles.reviewImage} />
            )}

            <View style={styles.reviewContent}>
              <Text style={styles.reviewText}>{review.reviewText}</Text>
              <Text style={styles.cuisineType}>{review.restaurant?.cuisineType}</Text>
            </View>

            <View style={styles.reviewFooter}>
              <Text style={styles.timestamp}>
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFF5F0",
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Inter Bold",
    color: "#2D1B12",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Inter",
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Inter Bold",
    color: "#2D1B12",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter",
    color: "#666",
    textAlign: "center",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Inter Bold",
    color: "#FFFFFF",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  levelText: {
    fontSize: 10,
    fontFamily: "Inter Bold",
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: "Inter SemiBold",
    color: "#2D1B12",
  },
  restaurantName: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#FF6B35",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 16,
    color: "#FFB800",
  },
  reviewImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#FFF5F0",
  },
  reviewContent: {
    padding: 16,
  },
  reviewText: {
    fontSize: 15,
    fontFamily: "Inter",
    color: "#2D1B12",
    lineHeight: 22,
    marginBottom: 8,
  },
  cuisineType: {
    fontSize: 14,
    fontFamily: "Inter SemiBold",
    color: "#FF6B35",
  },
  reviewFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "Inter",
    color: "#999",
  },
})

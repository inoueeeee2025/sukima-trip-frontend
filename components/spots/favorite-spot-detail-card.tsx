import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

type Props = {
  name: string;
  coinAmount: number;
  photoUrl: string | null;
  isPhotoLoading: boolean;
  liked: boolean;
  isLiking: boolean;
  onHeartPress: () => void;
};

export function FavoriteSpotDetailCard({
  name,
  coinAmount,
  photoUrl,
  isPhotoLoading,
  liked,
  isLiking,
  onHeartPress,
}: Props) {
  return (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        {/* 写真エリア */}
        <View style={styles.photoArea}>
          {isPhotoLoading ? (
            <View style={styles.photoPlaceholder}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder} />
          )}

          {/* スポット名バナー */}
          <View style={styles.nameBanner}>
            <Text style={styles.spotName} numberOfLines={1}>
              {name}
            </Text>
          </View>

          {/* ハートボタン */}
          <TouchableOpacity
            style={[styles.heartButton, !liked && styles.heartButtonInactive]}
            onPress={onHeartPress}
            disabled={isLiking}
          >
            {isLiking ? (
              <ActivityIndicator size="small" color={liked ? "#ffffff" : "#e74c3c"} />
            ) : (
              <Text style={[styles.heartIcon, !liked && styles.heartIconInactive]}>
                {liked ? "♥" : "♡"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 下部エリア */}
        <View style={styles.bottomArea} />
      </View>

      {/* コインバッジ */}
      <View style={styles.coinBadge}>
        <Text style={styles.coinBadgeText}>{coinAmount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    width: CARD_WIDTH,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#c8b87a",
    backgroundColor: "#f0e8d0",
  },
  photoArea: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#b0d8e8",
    justifyContent: "center",
    alignItems: "center",
  },
  nameBanner: {
    position: "absolute",
    top: 12,
    left: 44,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(50, 42, 28, 0.88)",
    borderRadius: 5,
  },
  spotName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  heartButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e74c3c",
    alignItems: "center",
    justifyContent: "center",
  },
  heartButtonInactive: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e74c3c",
  },
  heartIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  heartIconInactive: {
    color: "#e74c3c",
  },
  bottomArea: {
    height: 100,
    backgroundColor: "#f0e8d0",
  },
  coinBadge: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8b800",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coinBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useData } from "../../../context/DataProvider";
import { envConfig } from "@/configs/envConfig";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  translateActivityLevel,
  translateCuisine,
  translateDietaryRestriction,
  translateFood,
  translateGoal,
} from "@/utils/enum-translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const ProfileSection = ({ title, children, icon }: any) => (
  <View style={styles.section}>
    <LinearGradient
      colors={["#FFFFFF", "#F8FAFC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#005e3e" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

const InfoItem = ({ label, value }: any) => (
  <View style={styles.infoContainer}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text style={styles.infoValue}>{value || "No especificado"}</Text>
    </View>
  </View>
);

const FavRecipesInfoItem = () => {
  const { favouriteRecipes } = useData();

  if (!favouriteRecipes || favouriteRecipes.length === 0) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoValue}>{"No tenés recetas favoritas aún"}</Text>
      </View>
    );
  }

  return (
    <View>
      {favouriteRecipes.map((fav, index) => (
        <View key={index} style={styles.recipeContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            resizeMode="contain"
            style={styles.recipeImage}
          />
          <View style={styles.recipeContainerInfo}>
            <Text style={styles.recipeName}>{fav.name}</Text>
            <Text style={styles.moreRecipeInfo}>Ver más</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useData();

  const handleLogout = () => {
    AsyncStorage.removeItem("app_user");
    AsyncStorage.clear();
    router.replace("/(logged)/onboarding/onboardingSteps");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#005e3e", "#003825"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Image
              style={styles.profileImage}
              source={{
                uri: `${envConfig.IMAGE_SERVER_URL}/users/${user?.image}`,
              }}
            />
            <Text style={styles.nameText}>
              {user?.name || "Nombre no disponible"}
            </Text>
            <Text style={styles.usernameText}>
              {user?.email || "Email no disponible"}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.measurements?.weight || "--"}
              </Text>
              <Text style={styles.statLabel}>kg</Text>
            </View>
            <View style={[styles.statItem, styles.statItemBorder]}>
              <Text style={styles.statValue}>
                {user?.measurements?.height || "--"}
              </Text>
              <Text style={styles.statLabel}>cm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.measurements?.age || "--"}
              </Text>
              <Text style={styles.statLabel}>años</Text>
            </View>
          </View>

          {/* Health Section */}
          <ProfileSection title="Salud y Actividad" icon="fitness-outline">
            <InfoItem
              label="Nivel de Actividad"
              value={
                user && translateActivityLevel(user.measurements.activityLevel)
              }
            />
            <View style={styles.healthStats}>
              <View style={styles.healthStatItem}>
                <Ionicons name="flame-outline" size={24} color="#005e3e" />
                <Text style={styles.healthStatValue}>
                  {user?.measurements?.bmr || "--"}
                </Text>
                <Text style={styles.healthStatLabel}>BMR (kcal)</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Ionicons name="restaurant-outline" size={24} color="#005e3e" />
                <Text style={styles.healthStatValue}>
                  {user?.measurements?.dailyCalories || "--"}
                </Text>
                <Text style={styles.healthStatLabel}>Calorías Diarias</Text>
              </View>
            </View>
          </ProfileSection>

          {/* Preferences Section */}
          <ProfileSection title="Preferencias" icon="options-outline">
            <InfoItem
              label="Restricciones Dietéticas"
              value={user?.preferences?.dietaryRestrictions
                ?.map((d) => translateDietaryRestriction(d))
                .join(", ")}
            />
            <InfoItem
              label="Objetivos"
              value={user?.preferences?.goals
                ?.map((g) => translateGoal(g))
                .join(", ")}
            />
            <InfoItem
              label="Categorías Preferidas"
              value={user?.preferences?.preferredCategories
                ?.map((pc) => translateFood(pc))
                .join(", ")}
            />
            <InfoItem
              label="Cocinas Preferidas"
              value={user?.preferences?.preferredCuisines
                ?.map((c) => translateCuisine(c))
                .join(", ")}
            />
          </ProfileSection>

          <ProfileSection title="Recetas favoritas" icon="heart-outline">
            <FavRecipesInfoItem />
          </ProfileSection>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={["#FF4B4B", "#FF3636"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutGradient}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#FFFFFF"
                style={styles.logoutIcon}
              />
              <Text onPress={handleLogout} style={styles.logoutText}>
                Cerrar Sesión
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    marginTop: -20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#F8FAFC",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginVertical: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#005e3e",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionGradient: {
    padding: 20,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 10,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  infoValueContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
  },
  infoValue: {
    fontSize: 14,
    color: "#4B5563",
  },
  healthStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  healthStatItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  healthStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#005e3e",
    marginTop: 8,
  },
  healthStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  logoutButton: {
    marginVertical: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  recipeContainer: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    marginBottom: 12,
  },
  recipeContainerInfo: {
    flexDirection: "column"
  },
  recipeImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 10,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  moreRecipeInfo: {
    textDecorationLine: "underline",
    fontSize: 14,
    color: "#4B5563",
  },
});

export default ProfileScreen;

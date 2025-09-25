import React from "react";
import { View, Text, StyleSheet, Button, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function HomePage() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../../assets/images/HP_background.png")} // ✅ Background Image
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>MyVocabVault</Text>

        {/* Box around Log In Button */}
        <View style={styles.box}>
          <View style={styles.buttonContainer}>
            <Button title="Log In" onPress={() => navigation.navigate("LoginPage")} color="#4CAF50" />
          </View>
        </View>

        {/* Box around Create Account Button */}
        <View style={styles.box}>
          <View style={styles.buttonContainer}>
            <Button title="Create Account" onPress={() => navigation.navigate("CreateAccountPage")} color="#2196F3" />
          </View>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#222222",
  },
  box: {
    width: "80%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#222222",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonContainer: {
    width: "100%",
  },
});


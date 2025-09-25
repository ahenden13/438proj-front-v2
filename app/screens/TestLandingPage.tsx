import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function TestLandingPage() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Login Successful! 🎉</Text>
      <Text style={styles.subtitle}>You have been redirected to the test page.</Text>
      <Button title="Go to HomePage" onPress={() => navigation.navigate("HomePage")} color="#3498db" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
});

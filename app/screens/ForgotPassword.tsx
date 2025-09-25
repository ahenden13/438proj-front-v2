import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function ForgotPassword() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");

  const handleNext = async () => {
    const user = await db.getFirstAsync("SELECT securityQuestion FROM users WHERE email = ?", [email]);
    if (!user) {
      Alert.alert("Error", "No account found with this email.");
      return;
    }
    navigation.navigate("VerifySecurityAnswer", { email, securityQuestion: user.securityQuestion });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" />
      <Button title="Next" onPress={handleNext} color="#FF5733" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#adba95",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

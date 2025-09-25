import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function LoginPage() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userData = await db.getFirstAsync("SELECT * FROM users WHERE email = ?", [email]);
      if (!userData) {
        Alert.alert("Login Failed", "User not found.");
        return;
      }

      const validUser = await db.getFirstAsync("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
      if (validUser) {
        navigation.navigate("LandingPage", { userID: validUser.userID });
      } else {
        Alert.alert("Login Failed", "Incorrect password.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message || "An unknown error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput style={styles.input} placeholder="User Name" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Log In" onPress={handleLogin} color="#FF5733" />
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}> 
        <Text style={{ color: "blue", marginTop: 10 }}>Forgot/Reset Password?</Text> 
      </TouchableOpacity>
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



import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function LoginPage() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {

      const response = await fetch("https://vocabapp-group5-04a1e4402b45.herokuapp.com/api/users");
      if (!response.ok) throw new Error("Failed to fetch users from server");
      const users = await response.json();
      const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      
      if (!user) {
        Alert.alert("Login Failed", "User not found.");
        return;
      }

      // No password check because your API doesn’t store passwords
      // If you want to skip password entirely for now:
      navigation.navigate("LandingPage", { userID: user.userId });

      // If you want to temporarily “fake” password check:
      // if (password === "test123") navigation.navigate("LandingPage", { userID: user.userId });
      // else Alert.alert("Login Failed", "Incorrect password (demo).");

    } catch (error) {
      Alert.alert("Login Failed", error.message || "An unknown error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput style={styles.input} placeholder="User Name" value={username} onChangeText={setUsername} />
      {/* <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} /> */}
      <Button title="Log In" onPress={handleLogin} color="#FF5733" />
      {/* <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}> 
        <Text style={{ color: "blue", marginTop: 10 }}>Forgot/Reset Password?</Text> 
      </TouchableOpacity> */}
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



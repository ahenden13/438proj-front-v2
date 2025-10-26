import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function CreateAccount() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");

  useEffect(() => {
    navigation.setOptions({ headerBackTitle: "Back" });
  }, [navigation]);


  const handleSignUp = async () => {
    try {
      if (!username.trim()) {
        Alert.alert("Error", "Username is required.");
        return;
      }

      const newUser = {
        oauthProvider: "local",
        oauthProvId: "none",
        username: username.trim(),
      };
      const response = await fetch("https://vocabapp-group5-04a1e4402b45.herokuapp.com/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const createdUser = await response.json();
      console.log("User created:", createdUser);

      const newUserID = createdUser.userId;
      await db.runAsync("INSERT INTO vocabLists (userID, listName) VALUES (?, ?)", [newUserID, "Vocab Word History"]);

      Alert.alert("Sign Up Successful", "You can now log in.");
      navigation.navigate("LoginPage");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Sign Up Failed", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="User Name" value={username} onChangeText={setUsername} />
      <Button title="Sign Up" onPress={handleSignUp} color="#FF5733" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#71a2a8",
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


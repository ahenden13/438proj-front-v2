import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function CreateAccount() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  useEffect(() => {
    navigation.setOptions({ headerBackTitle: "Back" });
    checkAndUpdateDatabase();
  }, [navigation]);

  // check and update database
  const checkAndUpdateDatabase = async () => {
    try {
      const result = await db.getAllAsync("PRAGMA table_info(users);"); // ensure to return the list
      if (!Array.isArray(result)) {
        console.error("Error: Unexpected database response", result);
        return;
      }

      console.log("Database columns:", result); // make record and return data

      const columns = result.map((col) => col.name);

      if (!columns.includes("securityQuestion")) {
        await db.runAsync("ALTER TABLE users ADD COLUMN securityQuestion TEXT;");
      }
      if (!columns.includes("securityAnswer")) {
        await db.runAsync("ALTER TABLE users ADD COLUMN securityAnswer TEXT;");
      }
    } catch (error) {
      console.error("Error updating database:", error);
    }
  };

  const handleSignUp = async () => {
    try {
      if (!email || !password || !securityQuestion || !securityAnswer) {
        Alert.alert("Error", "All fields are required.");
        return;
      }

      const existingUser = await db.getFirstAsync("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUser) {
        Alert.alert("Error", "This email is already registered.");
        return;
      }

      await db.runAsync(
        "INSERT INTO users (email, password, securityQuestion, securityAnswer) VALUES (?, ?, ?, ?)",
        [email, password, securityQuestion, securityAnswer]
      );

      const result = await db.getFirstAsync("SELECT last_insert_rowid() AS lastID");
      const newUserID = result.lastID;
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
      <TextInput style={styles.input} placeholder="User Name" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Security Question" value={securityQuestion} onChangeText={setSecurityQuestion} />
      <TextInput style={styles.input} placeholder="Answer to Security Question" value={securityAnswer} onChangeText={setSecurityAnswer} />
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


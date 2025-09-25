import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

export default function VerifySecurityAnswer() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, securityQuestion } = route.params;

  const [securityAnswer, setSecurityAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleNext = async () => {
    const user = await db.getFirstAsync("SELECT securityAnswer FROM users WHERE email = ?", [email]);
    if (user.securityAnswer !== securityAnswer) {
      setAttempts(attempts + 1);
      if (attempts >= 2) {
        Alert.alert("Reset Failed", "Too many incorrect attempts.");
        navigation.navigate("HomePage");
        return;
      }
      Alert.alert("Incorrect Answer", `Attempt ${attempts + 1}/3`);
      return;
    }
    navigation.navigate("ResetPassword", { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Question</Text>
      <Text style={styles.question}>{securityQuestion}</Text>
      <TextInput style={styles.input} value={securityAnswer} onChangeText={setSecurityAnswer} placeholder="Enter your answer" />
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
    marginBottom: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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

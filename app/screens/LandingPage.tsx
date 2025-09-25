import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, Button } from "react-native";
import wordList from "../../assets/advanced_words.json";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { Asset } from "expo-asset";

const LandingScreen = ({ route }) => {
  const [dailyWord, setDailyWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vocabHistoryID, setVocabHistoryID] = useState<number | null>(null);
  const navigation = useNavigation();
  const { userID } = route.params;
  const db = useSQLiteContext();

  useEffect(() => {
    fetchDailyWord();
    getVocabHistoryID();
  }, []);

  const fetchDailyWord = async () => {
    setLoading(true);
    try {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      const API_KEY = "9c3b1721-9b03-4686-954c-91e9137bf51a";
      const API_URL = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${randomWord}?key=${API_KEY}`;
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch definition for ${randomWord}`);
      }

      const data = await response.json();
      const fetchedDefinition = data[0]?.shortdef?.[0] || "Definition not available.";

      setDailyWord(randomWord);
      setDefinition(fetchedDefinition);
    } catch (error) {
      console.error("Error fetching daily word:", error);
      setDailyWord("No word available");
      setDefinition("Definition not available.");
    } finally {
      setLoading(false);
    }
  };

  const getVocabHistoryID = async () => {
    // gets the listID of the vocab history list
    const vocabHistoryID = await db.getFirstAsync("SELECT listID FROM vocabLists WHERE userID = ? ORDER BY listID ASC LIMIT 1", [userID]);
    // console.log("User Vocab History ID: ", vocabHistoryID.listID); // Debugging
    setVocabHistoryID(vocabHistoryID.listID);
  }

  // Might need to add a limit to how many words can be saved to history
  const saveWordToHistory = async () => {
    if (dailyWord && definition) {
      try {
        const existingWord = await db.getFirstAsync(
          "SELECT * FROM wordInList WHERE userID = ? AND listID = ? AND word = ?",
          [userID, vocabHistoryID, dailyWord]
        );

        if (existingWord) {
          console.log(`⚠️ Word '${dailyWord}' already exists in history.`);
          alert("This word is already in your history!");
          return;
        }

        const response = await db.runAsync(
          "INSERT INTO wordInList (listID, userID, word, definition) VALUES (?, ?, ?, ?)",
          [vocabHistoryID, userID, dailyWord, definition]
        );

        if (response && response.changes > 0) { // Check if changes were made
          console.log("Insertion successful!");
        } else {
          console.log("Insertion failed");
        }

        console.log(`✅ Saved '${dailyWord}' to vocabHistory`);
        alert("Word saved to history!");
      } catch (error) {
        console.error("🚨 Error saving word:", error);
      }
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/LP_background.png")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate("HomePage")}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Random Vocabulary Word: </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <>
            {/*  TEXT BOX HERE */}
            <View style={styles.textBox}>
              <Text style={styles.dailyWord}>{dailyWord || "No word available"}</Text>
              <Text style={styles.definition}>{definition || "Definition not available."}</Text>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={fetchDailyWord}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Word</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveWordToHistory}>
          <Text style={styles.saveButtonText}>✅ Save Word to History</Text>
        </TouchableOpacity>

        {/*  Need to create custom style for button (Currently using Save Button Style) */}
        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.navigate("PickList", { userID, vocabHistoryID, dailyWord, definition })} accessibilityLabel="Save Word to Vocab List">
          <Text style={styles.refreshButtonText}>✅ Save to Existing Vocab List</Text>
        </TouchableOpacity>

        {/*  Need to create custom style for button (Currently using Save Button Style) */}
        <TouchableOpacity style={styles.createListButton} onPress={() => navigation.navigate("ListCreation", { userID })} accessibilityLabel="Create New List">
          <Text style={styles.createListText}>✨ Create New List</Text>
        </TouchableOpacity>

        {/*  Need to create custom style for button (Currently using Save Button Style) */}
        <TouchableOpacity
          style={styles.vocabListButton}
          onPress={() => navigation.navigate("VocabListPage", { userID, vocabHistoryID })}
        >
          <Text style={styles.vocabListText}>🚀 View Vocab Lists</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
};

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
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 20,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#d9534f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  createListButton: {
    backgroundColor: "#77afdd",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  createListText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  vocabListButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  vocabListText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 10,
  },
  textBox: {
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFA500",
    marginVertical: 10, //Adds spacing around the box
    alignItems: "center", //Centers text inside the box
  },
  dailyWord: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  definition: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  refreshButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default LandingScreen;

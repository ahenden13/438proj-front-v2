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
  const navigation: any = useNavigation();
  const { userID } = route.params;
  const db = useSQLiteContext();
  const BASE_URL = "https://vocabapp-group5-04a1e4402b45.herokuapp.com";
  const [dailyWordId, setDailyWordId] = useState<number | null>(null);

  useEffect(() => {
    fetchDailyWord();
    getVocabHistoryID();
  }, []);

  const fetchDailyWord = async () => {
    setLoading(true);
    try {
  const backendUrl = `${BASE_URL}/api/words`;

      let usedWord: string | null = null;
      let usedDef: string | null = null;

      try {
        const res = await fetch(backendUrl);
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const words = await res.json();
        if (Array.isArray(words) && words.length > 0) {
          const picked = words[Math.floor(Math.random() * words.length)];
          usedWord = picked.word || picked.wordText || picked.name || null;
          usedDef = picked.definition || picked.def || null;
          const maybeId = picked.id ?? picked.wordId ?? picked.word_id ?? picked._id ?? null;
          setDailyWordId(maybeId);
        }
      } catch (backendErr) {
        console.warn("Backend fetch failed, falling back to local list:", backendErr);
      }

      if (!usedDef) usedDef = "Definition not available.";

      setDailyWord(usedWord);
      setDefinition(usedDef);
    } catch (error) {
      console.error("Error fetching daily word:", error);
      setDailyWord("No word available");
      setDefinition("Definition not available.");
    } finally {
      setLoading(false);
    }
  };

  const getVocabHistoryID = async () => {
    const row: any = await db.getFirstAsync("SELECT listID FROM vocabLists WHERE userID = ? ORDER BY listID ASC LIMIT 1", [userID]);
    if (row && row.listID != null) setVocabHistoryID(row.listID);
  }

  // Might need to add a limit to how many words can be saved to history
  const saveWordToHistory = async () => {
    if (!dailyWord || !definition) return;

    try {
      if (dailyWordId != null) {
        const url = `${BASE_URL}/api/users/${userID}/words`;
        const payload = { wordId: dailyWordId, status: "not started" };
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          console.log(`✅ Saved '${dailyWord}' to remote history (user ${userID}).`);
          alert("Word saved to history (remote)!");
          return;
        } else {
          console.warn("Remote save returned non-OK status", res.status);
        }
      } else {
        console.warn("No remote word id available, skipping remote save.");
      }
    } catch (err) {
      console.warn("Remote save failed, falling back to local DB:", err);
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
        <TouchableOpacity
          style={styles.vocabListButton}
          onPress={() => navigation.navigate("VocabListPage", { userID, vocabHistoryID })}
        >
          <Text style={styles.vocabListText}>🚀 View History List</Text>
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

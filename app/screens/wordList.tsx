import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

const WordListPage = ({ route }: any) => {
  const BASE_URL = "https://vocabapp-group5-04a1e4402b45.herokuapp.com";
  const [loading, setLoading] = useState(true);
  const [listName, setListName] = useState<string | null>(null);
  const [wordList, setWordList] = useState<any[]>([]);
  const navigation: any = useNavigation();
  const { userID, listID } = (route?.params ?? {}) as any;
  const db = useSQLiteContext();

  useEffect(() => {
    if (db && userID && listID) {
      loadWordList();
    }
  }, [db, userID, listID]);

  const loadWordList = async () => {
    try {
      // Debugging
      // console.log(`UserID: ${userID} and ListID: ${listID}`);
  const existingList: any = await db.getFirstAsync("SELECT * FROM vocabLists WHERE userID = ? AND listID = ?", [userID, listID]);
  setListName(existingList?.listName ?? null);
      if (existingList.listName && existingList.listName.toLowerCase().includes("history")) {
        try {
          const res = await fetch(`${BASE_URL}/api/users/${userID}/words`);
          if (res.ok) {
            const remote: any[] = await res.json();
            const mapped = remote.map((uw) => {
              const w = uw.word || {};
              const wordText = w.word || w.wordText || w.name || uw.wordText || "";
              const definition = w.definition || w.def || uw.definition || "";
              return {
                userWordId: uw.userWordId ?? uw.user_word_id ?? uw.id ?? null,
                wordID: w.wordID ?? w.id ?? w.wordId ?? null,
                word: wordText,
                definition,
                status: uw.status,
                timesReviewed: uw.timesReviewed,
                lastReviewed: uw.lastReviewed,
              };
            });
            setWordList(mapped);
            return;
          } else {
            console.warn("Remote history fetch returned non-OK status", res.status);
          }
        } catch (err) {
          console.warn("Remote history fetch failed, falling back to local DB:", err);
        }
      }

  const vocabWords: any[] = await db.getAllAsync("SELECT * FROM wordInList WHERE userID = ? AND listID = ?", [userID, `${listID}`]);
  setWordList(vocabWords);
      // console.log("Vocab Words:", vocabWords); // Debugging Purposes
    } catch (error) {
      console.error("Error loading vocab words:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("VocabListPage", { userID })}>
          <Text style={styles.backButtonText}>&#8249;- Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{listName}</Text>
        </View>
        {/* Added for center alignment */}
        <View style={styles.rightContent} />
      </View>

      <SafeAreaView style={styles.container}>
        {/* Word List Section */}
        {wordList.length === 0 ? (
          <Text style={styles.noWordsText}>No words added yet</Text>
        ) : (
          <FlatList
            data={wordList}
            renderItem={({ item }) => (
              <View style={styles.wordItem}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.definition}>{item.definition}</Text>
              </View>
            )}
            keyExtractor={(item) => (item.userWordId ?? item.wordID ?? item.wordId ?? item.id ?? item.word ?? Math.random()).toString()}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: "white",
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "blue",
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightContent: {
    width: 50,
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  noWordsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  wordItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
  },
  definition: {
    fontSize: 16,
    fontStyle: "italic",
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 5,
  },
});

export default WordListPage;

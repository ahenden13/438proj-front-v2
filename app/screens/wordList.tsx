import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

const WordListPage = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const [listName, setListName] = useState<string | null>(null);
  const [wordList, setWordList] = useState([]);
  const navigation = useNavigation();
  const { userID, listID } = route.params;
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
      const existingList = await db.getFirstAsync("SELECT * FROM vocabLists WHERE userID = ? AND listID = ?", [userID, listID]);
      setListName(existingList.listName);

      const vocabWords = await db.getAllAsync("SELECT * FROM wordInList WHERE userID = ? AND listID = ?", [userID, `${listID}`]);
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
            keyExtractor={(item) => item.wordID.toString()}
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

import { useSQLiteContext } from "expo-sqlite";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function PickList({ route }) {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [vocabLists, setVocabLists] = useState([]);
  const { userID, vocabHistoryID, dailyWord, definition } = route.params;
  const [selectedID, setSelectedID] = useState<number | null>(null);

  let isMounted = true;

  useEffect(() => {
    // Added due to risk of errors
    let isMounted = true;

    if (db) {
      const loadVocabLists = async () => {
        try {
          // Debugging
          // console.log(`Fetching vocab lists for userID: ${userID} and vocabHistoryID: ${vocabHistoryID}`);

          // gets all created lists from user except for Vocab History
          const results = await db.getAllAsync("SELECT * FROM vocabLists WHERE userID = ? AND listID != ?", [userID, vocabHistoryID]);
          if (isMounted) {
            setVocabLists(results);
          }
        } catch (error) {
          console.error("Error loading vocab lists:", error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      loadVocabLists();
    }

    return () => { isMounted = false; };
  }, [db, userID]);

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
      <Text style={[styles.listName, { color: textColor }]}>{item.listName || item.word}</Text>
    </TouchableOpacity>
  );


  const renderItem = ({ item }) => {
    const backgroundColor = item.listID === selectedID ? "#aed6f1" : "#5dade2";
    const color = item.listID === selectedID ? "black" : "white";

    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedID(item.listID);
          saveWordToList(item.listID);
          navigation.goBack();
        }}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  const saveWordToList = async (chosenID) => {
    if (dailyWord && definition) {
      try {
        const existingWord = await db.getFirstAsync(
          "SELECT * FROM wordInList WHERE userID = ? AND listID = ? AND word = ?",
          [userID, chosenID, dailyWord]
        );

        const existingList = await db.getFirstAsync("SELECT * FROM vocabLists WHERE userID = ? AND listID = ?", [userID, chosenID]);
        const chosenListName = existingList.listName;

        if (existingWord) {
          console.log(`⚠️ Word '${dailyWord}' already exists in ${chosenListName}.`);
          alert(`This word is already in ${chosenListName}!`);
          return;
        }

        const response = await db.runAsync(
          "INSERT INTO wordInList (userID, listID, word, definition) VALUES (?, ?, ?, ?)",
          [userID, chosenID, dailyWord, definition]
        );

        if (response && response.changes > 0) { // Check if changes were made
          console.log(`✅ Saved '${dailyWord}' to ${chosenListName}.`);
          alert(`Word saved to ${chosenListName}!`);
        } else {
          console.log(`Failed to save word to ${chosenListName}.`);
        }
      } catch (error) {
        console.error("🚨 Error saving word:", error);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>&#8249;- Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Select List to Add "{dailyWord}"</Text>
        </View>
        {/* Added for center alignment */}
        <View style={styles.rightContent} />
      </View>

      <SafeAreaView style={styles.container}>
        {/* Vocab Lists Section */}
        {loading ? (
          <Text>Loading Vocab Lists...</Text>
        ) : vocabLists.length === 0 ? (
          <Text style={styles.noListsText}>No Created Vocab Lists Found</Text>
        ) : (
          <FlatList
            data={vocabLists}
            renderItem={renderItem}
            keyExtractor={(item) => item.listID.toString()}
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
    textAlign: "center",
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
  noListsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 5,
  },
  listName: {
    fontSize: 25,
    fontWeight: "bold",
  },
});
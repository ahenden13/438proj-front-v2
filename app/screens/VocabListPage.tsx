import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

const VocabListPage = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [vocabLists, setVocabLists] = useState([]);
  const { userID } = route.params;
  const [selectedId, setSelectedId] = useState(null);
  const db = useSQLiteContext();

  useEffect(() => {
    // Added due to risk of errors
    let isMounted = true;

    if (db) {
      const loadVocabLists = async () => {
        try {
          // console.log("Fetching vocab lists for userID:", userID); // Debugging

          const results = await db.getAllAsync("SELECT * FROM vocabLists WHERE userID = ?", [userID]);
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
    // first color is if the item is selected otherwise it appears as the second color
    const backgroundColor = item.listID === selectedId ? "#aed6f1" : "#5dade2";
    const color = item.listID === selectedId ? "black" : "white";

    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedId(item.listID);
          // Debugging
          // console.log("Item List ID: ", item.listID);
          navigation.navigate("WordListPage", { userID, listID: item.listID });
        }}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("LandingPage", { userID })}>
          <Text style={styles.backButtonText}>&#8249;- Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Vocab Lists</Text>
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
  // need to fix header and comments
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

export default VocabListPage;
import React from "react";
import { Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import HomePage from "./screens/HomePage";
import LoginPage from "./screens/login";
import LandingPage from "./screens/LandingPage";
import VocabListPage from "./screens/VocabListPage";
import CreateAccount from "./screens/createAccount";
import TestLandingPage from "./screens/TestLandingPage";
import ForgotPassword from "./screens/ForgotPassword";
import VerifySecurityAnswer from "./screens/VerifySecurityAnswer";
import ResetPassword from "./screens/ResetPassword";
import ListCreation from "./screens/ListCreation";
import WordListPage from "./screens/wordList";
import PickList from "./screens/PickList";

const initDB = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        userID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
        email TEXT UNIQUE NOT NULL, 
        password TEXT NOT NULL,
        securityQuestion TEXT NOT NULL,
        securityAnswer TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS vocabLists (
        listID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        userID INTEGER NOT NULL,
        listName TEXT NOT NULL,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS wordInList (
          wordID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          listID INTEGER NOT NULL,
          userID INTEGER NOT NULL,
          word TEXT NOT NULL,
          definition TEXT NOT NULL,
          FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
          FOREIGN KEY (listID) REFERENCES vocabLists(listID) ON DELETE CASCADE
        )
    `);

    // Use getFirstAsync and handle the case where no rows are returned
    const userCountResult = await db.getFirstAsync("SELECT COUNT(*) AS userCount FROM users");

    // For Debugging Purposes
    // adds example user and vocab lists with a word already added to the database without needing to create an account on db initialization
    if (userCountResult && userCountResult.userCount === 0) {  // Safer check
      await db.execAsync(`INSERT INTO users (email, password, securityQuestion, securityAnswer) VALUES ("testuser", "123", "What is 1 + 1?", "2");`);

      await db.execAsync(`INSERT INTO vocabLists (userID, listName) VALUES ("1", "Vocab Word History");`);
      await db.execAsync(`INSERT INTO vocabLists (userID, listName) VALUES ("1", "Created List for testuser");`);

      await db.execAsync(`INSERT INTO wordInList (listID, userID, word, definition) VALUES (2, 1, "serendipity", "The occurrence and development of events by chance in a happy or beneficial way.")`)
    }

  } catch (error) {
    console.error("Error initializing database:", error);
    Alert.alert("Error", "Database initialization failed. Please try again later.");
  }
};

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <SQLiteProvider databaseName="vocabVault.db" onInit={initDB}>
      <Stack.Navigator initialRouteName="HomePage">
        <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="CreateAccountPage" component={CreateAccount} options={{ title: "Create an Account" }} />
        <Stack.Screen name="LoginPage" component={LoginPage} options={{ title: "Log In" }} />
        <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
        <Stack.Screen name="TestLandingPage" component={TestLandingPage} options={{ headerShown: false }} />
        <Stack.Screen name="VocabListPage" component={VocabListPage} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: "Forgot Password" }} />
        <Stack.Screen name="VerifySecurityAnswer" component={VerifySecurityAnswer} options={{ title: "Security Question" }} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: "Reset Password" }} />
        <Stack.Screen name="WordListPage" component={WordListPage} options={{ headerShown: false }} />
        <Stack.Screen name="ListCreation" component={ListCreation} options={{ headerShown: false }} />
        <Stack.Screen name="PickList" component={PickList} options={{ headerShown: false }} />
      </Stack.Navigator>
    </SQLiteProvider>
  );
}


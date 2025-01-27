import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
  useFonts,
} from "@expo-google-fonts/jetbrains-mono";
import { router, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStorage from "expo-secure-store";
const API_URL = "http://localhost:8000";

export default function Index() {
  SplashScreen.preventAutoHideAsync();
  const [loaded, error] = useFonts({
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const onLogin = async () => {
    console.log("Attempting to log in with:", username);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const jsonResponse = await response.json();
        throw new Error(jsonResponse.error || "Unknown login error");
      }

      const data = await response.json();
      const accessCode = data.hashedUsername;

      await SecureStorage.setItemAsync("user", String(accessCode));
      console.log("Access code saved, navigating to main page");
      router.push("/main");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login failed", error);
        Alert.alert("Login Failed", error.message);
      } else {
        console.error("Login failed with an unknown error");
        Alert.alert("Login Failed", "An unknown error occurred");
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#292929",
        padding: 30,
      }}
    >
      <Text
        style={{
          fontFamily: "JetBrainsMono_700Bold",
          fontSize: 100,
          color: "#ffffff",
        }}
      >
        KOS-
      </Text>
      <Text
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 24,
          color: "#ffffff",
          alignSelf: "flex-start",
          width: "100%",
        }}
      >
        Username
      </Text>
      <TextInput
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 20,
          color: "#ffffff",
          alignSelf: "flex-start",
          marginTop: 10,
          padding: 4,
          backgroundColor: "#313131",
          width: "100%",
        }}
        onChangeText={setUsername}
        value={username}
      />
      <Text
        style={{
          width: "100%",
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 24,
          color: "#ffffff",
          alignSelf: "flex-start",
          marginTop: 10,
        }}
      >
        Password
      </Text>
      <TextInput
        style={{
          fontFamily: "JetBrainsMono_500Medium",
          fontSize: 20,
          color: "#ffffff",
          padding: 4,
          alignSelf: "flex-start",
          marginTop: 10,
          backgroundColor: "#313131",
          width: "100%",
        }}
        secureTextEntry={true}
        onChangeText={setPassword}
        value={password}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "#313131",
          width: "100%",
          marginTop: 20,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        }}
        onPress={onLogin}
      >
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 24,
            color: "#ffffff",
            width: "100%",
            textAlign: "center",
          }}
        >
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

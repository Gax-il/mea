import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
  useFonts,
} from "@expo-google-fonts/jetbrains-mono";
import { SplashScreen } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  TextInput,
  Alert,
} from "react-native";
import * as SecureStorage from "expo-secure-store";

// Adjusted API URL
const API_URL = "http://localhost:8000";

type Note = {
  id: number;
  type: number;
  text: string;
};

type ClassObj = {
  name: string;
  shortcut: string;
  room: string;
  type: string;
  start: string;
  end: string;
};

const Page = () => {
  SplashScreen.preventAutoHideAsync();

  const [openName, setOpenName] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState(1);
  const [classObj, setClassObj] = useState<ClassObj | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  const [loaded, error] = useFonts({
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    fetchClassObj();
    fetchNotes();
  }, []);

  const fetchClassObj = async () => {
    try {
      const response = await fetch(`${API_URL}/classObj?user=testuser`);
      const data = await response.json();
      setClassObj(data);
    } catch (error) {
      console.error("Error fetching class object:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const accessCode = await SecureStorage.getItemAsync("user");
      const response = await fetch(`${API_URL}/notes?user=${accessCode}`);
      const data = await response.json();
      setNotes(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const addNote = async () => {
    if (!newNote) return;

    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newNoteType, text: newNote }),
      });
      const newNoteData = await response.json();
      setNotes([...notes, newNoteData]);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleNotePress = (noteId: number) => {
    Alert.alert(
      "Smazat poznámku",
      "Jste si jistý že chcete smazat tuto poznámku?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNote(noteId),
        },
      ]
    );
  };

  const calculateTime = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const now = new Date();
    const startTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startHour,
      startMinute
    );
    const endTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endHour,
      endMinute
    );

    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const diffMs = endTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

    const daysStr = diffDays > 0 ? `${diffDays}d ` : "";
    const hoursStr = diffHours > 0 ? `${diffHours}h ` : "";
    const minutesStr = diffMinutes > 0 ? `${diffMinutes}m` : "";

    return `${daysStr}${hoursStr}${minutesStr}`.trim();
  };

  useEffect(() => {
    if (!classObj) return;

    const updateTime = () => {
      setTimeLeft(calculateTime(classObj.start, classObj.end));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000);

    return () => clearInterval(intervalId);
  }, [classObj]);

  const toggleName = () => {
    setOpenName((prevState) => !prevState);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: openName ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: openName ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const colorRoom = (room: string) => {
    const splitterRoom = room.split(":");
    switch (splitterRoom[0]) {
      case "AL":
        return "#00F6FF";
      case "KL":
        const splittedKL = splitterRoom[1].split("-")[0];
        switch (splittedKL) {
          case "K":
            return "#ff073a";
          default:
            return "#39ff14";
        }
    }
    return "#fff";
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "Cvičení":
        return "#9d00ff";
      case "Přednáška":
        return "#00ff9d";
      case "Speciální":
        return "#ff9d00";
      case "Kktina":
        return "#ff0s09d";
      default:
        return "#fff";
    }
  };

  if (!classObj) return null;

  return (
    <View
      style={{
        backgroundColor: "#292929",
        width: "100%",
        height: "100%",
        paddingHorizontal: 10,
      }}
    >
      <TouchableOpacity
        style={{
          width: "100%",
          backgroundColor: "#292929",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={toggleName}
      >
        <Text
          style={{
            color: "#fff",
            fontFamily: "JetBrainsMono_700Bold",
            fontSize: 100,
          }}
        >
          {classObj.shortcut}
        </Text>
      </TouchableOpacity>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          justifyContent: "center",
          alignItems: "center",
          height: openName ? "auto" : "0%",
          overflow: "hidden",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontFamily: "JetBrainsMono_500Medium",
            fontSize: 20,
            textAlign: "center",
          }}
        >
          {classObj.name}
        </Text>
      </Animated.View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            color: colorRoom(classObj.room),
            fontSize: 26,
          }}
        >
          {classObj.room}
        </Text>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            color: typeColor(classObj.type),
            fontSize: 26,
          }}
        >
          {classObj.type}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            color: "#fff",
            fontSize: 26,
          }}
        >
          {classObj.start}
        </Text>
        <Text
          style={{
            fontFamily: "JetBrainsMono_500Medium",
            color: "#fff",
            fontSize: 26,
          }}
        >
          {timeLeft}
        </Text>
      </View>
      <View
        style={{
          marginTop: 20,
        }}
      >
        {notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => handleNotePress(note.id)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  ...styles.bullet,
                  backgroundColor:
                    note.type === 1
                      ? "#ff0000"
                      : note.type === 2
                      ? "#00ff00"
                      : "#0000ff",
                }}
              />
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                {note.text}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
          onChangeText={setNewNote}
          value={newNote}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <TouchableOpacity
            style={{ ...styles.radioButton }}
            onPress={() => setNewNoteType(1)}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                fontSize: 20,
                padding: 4,
                marginTop: 10,
                backgroundColor: "#313131",
                width: "100%",
                textAlign: "center",
                color: newNoteType !== 1 ? "#ffffff" : "#a0a0a0",
              }}
            >
              Moje
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setNewNoteType(2)}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                fontSize: 20,
                padding: 4,
                marginTop: 10,
                backgroundColor: "#313131",
                width: "100%",
                textAlign: "center",
                color: newNoteType !== 2 ? "#ffffff" : "#a0a0a0",
              }}
            >
              Předmět
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setNewNoteType(3)}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                fontSize: 20,
                color: newNoteType !== 3 ? "#ffffff" : "#a0a0a0",
                padding: 4,
                marginTop: 10,
                backgroundColor: "#313131",
                width: "100%",
                textAlign: "center",
              }}
            >
              Celková
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={addNote}
          style={{
            backgroundColor: "#313131",
            width: "100%",
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
          }}
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
            Přidat poznámku
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  } as ViewStyle,
  radioButton: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
  },
});

export default Page;

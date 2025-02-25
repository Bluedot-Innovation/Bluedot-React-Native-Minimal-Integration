import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Button, Text, FlatList, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Dimensions, SafeAreaView } from "react-native";
import { useNavigate } from "react-router-native";
import { BackHandler } from "react-native";
import BluedotPointSdk from "bluedot-react-native";

class ChatMessage {
  constructor(id, text, user) {
    this.id = id;
    this.text = text;
    this.user = user;
    this.liked = false;
    this.disliked = false;
    this.isBot = !user;
  }
}

export default function BrainAiScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [chatSessionId, setChatSessionId] = useState("");
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const flatListRef = useRef(null);
  const navigate = useNavigate();
  const brainAi = new BluedotPointSdk.BrainAi();
  const botMessageRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      navigate("/main");
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigate]);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    BluedotPointSdk.isInitialized().then((isInitialized) => {
      if (isInitialized) {
        console.log("Initialize BrainAi");
        registerBrainAiListeners();
        brainAi.createNewChat().then(setChatSessionId);
      } else {
        console.log("Error: Bluedot SDK not initialized!");
      }
    });
  }, []);

  const registerBrainAiListeners = () => {
    BluedotPointSdk.on(brainAi.BRAIN_EVENT_TEXT_RESPONSE, (event) => {
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.isBot && msg.id === botMessageRef.current?.id) {
            return { ...msg, text: msg.text === "..." ? event.brainEventTextResponse : msg.text + event.brainEventTextResponse };
          }
          return msg;
        });
      });
    });

    BluedotPointSdk.on(brainAi.BRAIN_EVENT_CONTEXT_RESPONSE, (event) => {
      console.log("BRAIN_EVENT_CONTEXT_RESPONSE: " + event.brainEventContextResponse.length);
    });

    BluedotPointSdk.on(brainAi.BRAIN_EVENT_IDENTIFIER_RESPONSE, () => {
      botMessageRef.current = null;
    });

    BluedotPointSdk.on(brainAi.BRAIN_EVENT_ERROR, (event) => {
      console.log("BRAIN_EVENT_ERROR: " + event.brainEventError);
    });
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      const userMessage = new ChatMessage(Date.now(), inputText, true);
      setMessages(prev => [...prev, userMessage]);
      setInputText("");
      brainAi.sendMessage(chatSessionId, inputText);
      setTimeout(() => {
        const botMessage = new ChatMessage(Date.now() + 1, "...", false);
        botMessageRef.current = botMessage;
        setMessages(prev => [...prev, botMessage]);
      }, 100);
    }
  };

  useEffect(() => {
    if (!userScrolledUp) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setUserScrolledUp(!isAtBottom);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
          <TouchableOpacity onPress={() => navigate("/")} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageContainer, item.user ? styles.userMessage : styles.responseMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            onScroll={handleScroll}
            onContentSizeChange={() => {
              if (!userScrolledUp) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />
          <View style={[styles.inputContainer, { marginBottom: 20 }, keyboardVisible && styles.inputContainerKeyboardVisible]}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
            />
            <Button title="Send" onPress={sendMessage} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 90 },
  backButton: { alignSelf: "flex-start", marginBottom: 10, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: "#ddd", borderRadius: 5 },
  backButtonText: { fontSize: 16, color: "blue" },
  messageContainer: { padding: 10, marginVertical: 5, borderRadius: 5 },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#dcf8c6" },
  responseMessage: { alignSelf: "flex-start", backgroundColor: "#e5e5ea" },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "gray", borderRadius: 5, padding: 10, marginRight: 10 }
});

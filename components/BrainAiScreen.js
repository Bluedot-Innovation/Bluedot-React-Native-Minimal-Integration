import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, FlatList, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Dimensions, SafeAreaView } from "react-native";
import { useNavigate } from "react-router-native";
import { BackHandler } from "react-native";
import BluedotPointSDK from "bluedot-react-native";

class ChatMessage {
  constructor(id, text, user) {
    this.id = id;
    this.text = text;
    this.user = user;
    this.liked = false;
    this.disliked = false;
  }
}


/**
 *  To use BrainAi you need to complete RezolveAi integration in your Canvas dashboard.
 */
export default function BrainAiScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const navigate = useNavigate();
  const brainAi = new BluedotPointSDK.BrainAi();

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

  const sendMessage = () => {
    const onSuccessCallback = (chatSessionId) => {
      console.log("brain success: "+chatSessionId);
    }
    const onFailCallback = (error) => {
      console.log("brain fail");
    }
    brainAi.createNewChat(onSuccessCallback, onFailCallback);
    // brainAi.testLog(onSuccessCallback, onFailCallback);



    if (inputText.trim()) {
      setMessages([...messages, new ChatMessage(Date.now(), inputText, true)]);
      setInputText("");
    }
  };

  const handleLike = (id) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, liked: !msg.liked, disliked: false } : msg
      )
    );
  };

  const handleDislike = (id) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, disliked: !msg.disliked, liked: false } : msg
      )
    );
  };

  function onCreateChatSuccess(chatSessionId) {
    console.log('react create chat success: '+chatSessionId);
  }
  
  function onCreateChatError(error) {
    console.error('Error Starting Tempo: ', error);
  }

  const { width } = Dimensions.get("window");

  const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: "#f5f5f5" },
    container: { flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 70, paddingHorizontal: 10 },
    backButton: { width: width * 0.2, marginBottom: 10, alignItems: "center", paddingVertical: 10, borderRadius: 5, backgroundColor: "#ddd" },
    backButtonText: { fontSize: 16, color: "blue" },
    messageContainer: { backgroundColor: "white", padding: 10, marginVertical: 5, borderRadius: 5, maxWidth: '80%' },
    userMessage: { alignSelf: "flex-end", backgroundColor: "#dcf8c6" },
    responseMessage: { alignSelf: "flex-start" },
    messageText: { fontSize: 16 },
    reactionContainer: { flexDirection: "row", marginTop: 5 },
    button: { marginRight: 10, padding: 5, backgroundColor: "#ccc", borderRadius: 5 },
    activeButton: { backgroundColor: "#007bff" },
    inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, paddingBottom: 10 },
    inputContainerKeyboardVisible: { marginBottom: 0 },
    input: { flex: 1, borderWidth: 1, borderColor: "gray", borderRadius: 5, padding: 10, marginRight: 10 }
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
          <TouchableOpacity onPress={() => navigate("/")} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageContainer, item.user ? styles.userMessage : styles.responseMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
                {!item.user && (
                  <View style={styles.reactionContainer}>
                    <TouchableOpacity onPress={() => handleLike(item.id)} style={[styles.button, item.liked && styles.activeButton]}>
                      <Text>👍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDislike(item.id)} style={[styles.button, item.disliked && styles.activeButton]}>
                      <Text>👎</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
          <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboardVisible]}>
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


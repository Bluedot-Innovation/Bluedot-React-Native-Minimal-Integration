import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Button, Text, FlatList, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Dimensions, SafeAreaView } from "react-native";
import { useNavigate } from "react-router-native";
import { BackHandler } from "react-native";
import BluedotPointSdk from "bluedot-react-native";
import RenderHTML from 'react-native-render-html';
import ProductGrid from "./ProductGrid";

const placeholderImage = require("../assets/icon.png");

class ChatMessage {
  constructor(id, text, user) {
    this.id = id;
    this.text = text;
    this.user = user;
    this.liked = null;
    this.isBot = !user;
    this.products = [];
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
  const chatSessionIdRef = useRef("");

  useEffect(() => {
    const backAction = () => {
      onBackAction();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigate]);

  useEffect(() => {
    chatSessionIdRef.current = chatSessionId;
  }, [chatSessionId]);

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
        brainAi.createNewChat().then((sessionId) => {
          console.log("register listeners for session: "+sessionId);
          setChatSessionId(sessionId);
          registerBrainAiListeners(sessionId);
        });
      } else {
        console.log("Error: Bluedot SDK not initialized!");
      }
    });
  }, []);

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

  const onBackAction = () => {
    brainAi.getChatSessionIDs().then((chatSessionIDs) => {
      chatSessionIDs.forEach(element => {
        console.log("onBackAction:unregister session: "+element);
        brainAi.closeChat(element);
        unregisterBrainAiListeners(element);
      });
    });
    
    navigate("/");
  };

  const registerBrainAiListeners = (chatSessionId) => {
    console.log("REGISTER LISTENERS: "+brainAi.BRAIN_EVENT_TEXT_RESPONSE+chatSessionId);
    BluedotPointSdk.on(brainAi.BRAIN_EVENT_TEXT_RESPONSE+chatSessionId, (event) => {
      // console.log("BRAIN_EVENT_TEXT_RESPONSE: "+event.brainEventTextResponse);
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.isBot && msg.id === botMessageRef.current?.id) {
            return { ...msg, text: msg.text === "..." ? event.brainEventTextResponse : msg.text + event.brainEventTextResponse };
          }
          return msg;
        });
      });
    });

    BluedotPointSdk.on(brainAi.BRAIN_EVENT_CONTEXT_RESPONSE+chatSessionId, (event) => {
      // console.log("BRAIN_EVENT_CONTEXT_RESPONSE: " + event.brainEventContextResponse.length);

      if (event.brainEventContextResponse.length > 0) {
        const products = event.brainEventContextResponse.map(product => ({
          productId: product.product_id ?? product.title, // in case the id is missing
          categoryId: product.categoryId,
          merchantId: product.merchantId,
          description: product.description,
          title: product.title,
          price: product.price,
          image: product.image_links?.length > 0 ? product.image_links[0] : placeholderImage,
        }));

        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.isBot && msg.id === botMessageRef.current?.id) {
              return { 
                ...msg, 
                products
              };
            }
            return msg;
          })
        );
      }
    });

    BluedotPointSdk.on(brainAi.BRAIN_EVENT_RESPONSE_ID+chatSessionId, (event) => {
      const responseId = event.brainEventResponseID;
      const currentBotResponseId = botMessageRef.current?.id
      console.log("BRAIN_EVENT_RESPONSE_ID: " + responseId);
      
      /**
       * Update response id of the last BrainAi response.
       */
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.isBot && msg.id === currentBotResponseId) {
            return { 
              ...msg, 
              id: responseId
            };
          }
          return msg;
        })
      );
      botMessageRef.current = null;
    });

    BluedotPointSdk.on(brainAi.BRAIN_EVENT_ERROR+chatSessionId, (event) => {
      console.log("BRAIN_EVENT_ERROR: " + event.brainEventError);
      if (event.brainEventErrorCode in brainAi.errorMessages) {
        console.log("error: "+brainAi.errorMessages[event.brainEventErrorCode]);
      }
    });
  };

  const unregisterBrainAiListeners = (chatSessionId) => {
    console.log("UNREGISTER LISTENERS: "+brainAi.BRAIN_EVENT_TEXT_RESPONSE+chatSessionId);
    BluedotPointSdk.unsubscribe(BluedotPointSdk.BrainAi.BRAIN_EVENT_TEXT_RESPONSE+chatSessionId, () => {});
    BluedotPointSdk.unsubscribe(BluedotPointSdk.BrainAi.BRAIN_EVENT_CONTEXT_RESPONSE+chatSessionId, () => {});
    BluedotPointSdk.unsubscribe(BluedotPointSdk.BrainAi.BRAIN_EVENT_IDENTIFIER_RESPONSE+chatSessionId, () => {});
    BluedotPointSdk.unsubscribe(BluedotPointSdk.BrainAi.BRAIN_EVENT_ERROR+chatSessionId, () => {});
  }

  const sendMessage = () => {
    if (inputText.trim()) {
      const userChatMessageId = Date.now();
      const userMessage = new ChatMessage(userChatMessageId, inputText, true);
      setMessages(prev => [...prev, userMessage]);
      setInputText("");
      brainAi.sendMessage(chatSessionId, inputText);

      setTimeout(() => {
        const botChatMessageId = Date.now() + 1; // assign temporary id to the response until a real response id is returned in "brainAi.BRAIN_EVENT_RESPONSE_ID+chatSessionId" event.
        const botMessage = new ChatMessage(botChatMessageId, "...", false);
        botMessageRef.current = botMessage;
        setMessages(prev => [...prev, botMessage]);
      }, 100);
    }
  };

  const onProductPress = (product) => {
    console.log("Product clicked:", product);
    console.log("chatSessionId: "+chatSessionId);
  };

  const onResponseFeedback = (msgId, liked) => {
    brainAi.submitFeedback(chatSessionId, msgId, liked);  //TODO dupa console.js:614 Error: Exception in HostFunction: Expected argument 1 of method "androidSubmitFeedback" to be a string, but got a number (1741093847279.000000)
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.isBot && msg.id === msgId) {
          return { 
            ...msg, 
            liked
          };
        }
        return msg;
      })
    );
  }

  const renderMessage = ({ item, index }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.user ? styles.userMessage : styles.responseMessage,
        ]}
      >
        {item.isBot ? (
          <RenderHTML contentWidth={300} source={{ html: item.text }} />
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
  
        {item.products.length > 0 && (
          <ProductGrid products={item.products} onProductPress={onProductPress} />
        )}

        {
          item.isBot && 
          isNaN(item.id) && // Only show the feedback options when response generation was finished.
                            // We know it's finished when initially set botChatMessageId number was replaced with 
                            // real response id from "brainAi.BRAIN_EVENT_RESPONSE_ID+chatSessionId" event.
          (
          <View style={styles.reactionContainer}>
            <TouchableOpacity
              onPress={() => {
                console.log("response liked: "+item.id);
                onResponseFeedback(item.id, true);
              }}
              style={[styles.reactionButton, item.liked === true && styles.liked]}
            >
              <Text style={{ color: item.liked === true ? 'blue' : 'gray' }}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log("response disliked: "+item.id);
                onResponseFeedback(item.id, false);
              }}
              style={[styles.reactionButton, item.liked === false && styles.disliked]}
            >
              <Text style={{ color: item.liked === false ? 'red' : 'gray' }}>👎</Text>
            </TouchableOpacity>
          </View>
        )}
        
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
          <TouchableOpacity onPress={() => {
              onBackAction();
            }
          } style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
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
  input: { flex: 1, borderWidth: 1, borderColor: "gray", borderRadius: 5, padding: 10, marginRight: 10 },
  reactionContainer: { flexDirection: 'row', marginTop: 8 },
  reactionButton: { padding: 8, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#f0f0f0' },
  liked: { backgroundColor: '#d0e8ff' },
  disliked: { backgroundColor: '#ffd0d0' },
});

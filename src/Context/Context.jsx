import { createContext, useEffect, useRef, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState(""); // User input
  const [messages, setMessages] = useState([]); // Conversation history
  const [loading, setLoading] = useState(false); // Loading indicator
  const [showResult, setShowResult] = useState(false); // Toggle between greeting and conversation
  const isFirstChat = useRef(true);
  const onSent = async (prompt) => {
    console.log("Sending message...");
  setLoading(true);
  console.log("Loading set to true");

  setShowResult(true);

  const userMessage = { type: "user", text: prompt || input };
  const botMessage = { type: "bot", text: "" }; // Empty text initially for loader

  setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);

  setInput("");

  // Short delay to ensure React renders loader
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("Fetching response...");
  const response = await run(prompt || input);

  console.log("Response received, formatting...");
  let formattedResponse = response
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(?:\r\n|\r|\n)/g, "<br>")
    .replace(/### (.*?)\n/g, "<h3>$1</h3>")
    .replace(/## (.*?)\n/g, "<h2>$1</h2>")
    .replace(/# (.*?)\n/g, "<h1>$1</h1>")
    .replace(/- (.*?)\n/g, "<li>$1</li>")
    .replace(/<li>(.*?)<\/li>/g, "<ul><li>$1</li></ul>");

  setMessages((prevMessages) => {
    const updatedMessages = [...prevMessages];
    updatedMessages[updatedMessages.length - 1] = { type: "bot", text: formattedResponse };
    return updatedMessages;
  });

  setLoading(false);
  console.log("Loading set to false");
    const words = formattedResponse.split(" "); // Split response into words
  let currentText = "";
  words.forEach((word, index) => {
    setTimeout(() => {
      currentText += word + " "; // Add the next word
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].text = currentText; // Update the last bot message
        return updatedMessages;
      });
      if (index === words.length - 1) {
        setLoading(false);
      }
    setLoading(false);

      }, index * 150);
    });
  };

  const contextValue = {
    messages,
    onSent,
    input,
    setInput,
    loading,
    showResult,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;

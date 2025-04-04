import { createContext, useState, useRef } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [allowSending, setAllowSending] = useState(true);
  const [stopIcon, setStopIcon] = useState(false);
  
  const stopReplyRef = useRef(false);
  const timeoutIdsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = []; 
  };

  const onSent = async (prompt) => {
    setAllowSending(false);
    setLoading(true);
    stopReplyRef.current = false; 
    setStopIcon(true);
    setShowResult(true);

    const userMessage = { type: "user", text: prompt || input };
    const botMessage = { type: "bot", text: "" };

    setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);
    setInput("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await run(prompt || input);

    const formattedResponse = response
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
    .replace(/\*(.*?)\*/g, "<i>$1</i>") // Italics
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>") // Code block
    .replace(/`([^`]+)`/g, "<code>$1</code>") // Inline code
    .replace(/(?:\r\n|\r|\n)/g, "<br>") // Line breaks
    .replace(/### (.*?)\n/g, "<h3>$1</h3>") // H3
    .replace(/## (.*?)\n/g, "<h2>$1</h2>") // H2
    .replace(/# (.*?)\n/g, "<h1>$1</h1>") // H1
    .replace(/^- (.*?)$/gm, "<ul><li>$1</li></ul>") // Convert `- item` to `<ul><li>item</li></ul>`
    .replace(/^\* (.*?)$/gm, "<ul><li>$1</li></ul>") // Convert `* item` to `<ul><li>item</li></ul>`
    .replace(/<\/ul>\s*<ul>/g, ""); // Merge consecutive `<ul>` tags

    const words = formattedResponse.split(" ");
    let currentText = "";

    words.forEach((word, index) => {
      const id = setTimeout(() => {
        if (stopReplyRef.current) {
          clearAllTimeouts();
          setMessages((prevMessages) => prevMessages.slice(0, -1)); 
          setLoading(false); 
          setAllowSending(true);
          setStopIcon(false);
          return;
        }

        currentText += word + " ";
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].text = currentText;
          return updatedMessages;
        });

        if (index === words.length - 1) {
          setLoading(false); 
          setStopIcon(false);
          setAllowSending(true);
        }
        setLoading(false);
      }, index * 40);

      timeoutIdsRef.current.push(id);
    });
  };

  const stopReply = () => {
    stopReplyRef.current = true; 
    clearAllTimeouts();
    setLoading(false); 
    setAllowSending(true);
    setStopIcon(false);
  };

  return (
    <Context.Provider
      value={{
        messages,
        onSent,
        input,
        setInput,
        loading,
        showResult,
        allowSending,
        stopReply,
        stopIcon,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;

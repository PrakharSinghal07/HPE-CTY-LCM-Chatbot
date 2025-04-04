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
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") 
    .replace(/\*(?!\s)(.*?)\*/g, "<i>$1</i>") 
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>") 
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(?:\r\n|\r|\n)/g, "<br>") 
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>") 
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>") 
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>") 
    .replace(/^\d+\.\s(.*)$/gm, "<ol><li>$1</li></ol>") 
    .replace(/<\/ol>\s*<ol>/g, "") 
    .replace(/^[-*]\s(.*)$/gm, "<ul><li>$1</li></ul>")
    .replace(/<\/ul>\s*<ul>/g, ""); 



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

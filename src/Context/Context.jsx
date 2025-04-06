import { createContext, useState, useRef } from "react";
import run from "../config/gemini";
import { marked } from "marked";
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
    
    const formattedResponse = marked(response);



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

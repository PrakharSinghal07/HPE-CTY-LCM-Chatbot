import { createContext, useState, useRef, useEffect } from "react";
import { marked } from "marked";
export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [allowSending, setAllowSending] = useState(true);
  const [stopIcon, setStopIcon] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isTypingCompleted, setIsTypingCompleted] = useState(false);
  const stopReplyRef = useRef(false);
  const timeoutIdsRef = useRef([]);
  const firstMessage = useRef(1);
  const titleQuery = useRef("New Chat");
  const [conversation, setConversation] = useState({
    sessionId: crypto.randomUUID(),
    title: "New Chat",
    messages: []
  });

  useEffect(() => {
    const getConvo = async () => {
      const response = await fetch("http://127.0.0.1:8000/conversation/", {
        method: "GET",
      });
      const result = await response.json();
      setConversation({
        sessionId: result.sessionId || crypto.randomUUID(),
        title: result.title || "New Chat",
        messages: Array.isArray(result.messages) ? result.messages : [],
      });
    };
    getConvo();
  }, []);   
  


  useEffect(() => {
    setConversation((prev) => ({
      ...prev,
      title: titleQuery.current,
    }));
    console.log(firstMessage.current);
  }, [firstMessage.current]);


  useEffect(() => {
    const postData = async () => {
      try {
        const response = await fetch("http://localhost:8000/conversation/", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(conversation),
        });
      } catch (error) {
        console.log(error);
      }
    };
    postData();
  }, [isTypingCompleted]);


  
  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  const getSuggestions = async () => {
    let response = await fetch("http://127.0.0.1:8000/suggestions/");
    response = await response.json();
    setSuggestions(response.suggestions);
    // return response.suggestions
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  const onSent = async (prompt) => {
    titleQuery.current = prompt;
    firstMessage.current = firstMessage.current * 0;
    setAllowSending(false);
    setLoading(true);
    stopReplyRef.current = false;
    setStopIcon(true);
    setShowResult(true);

    const userMessage = { type: "user", text: prompt || input };
    const botMessage = { type: "bot", text: "" };

    // setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);
    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, botMessage],
    }));
    setInput("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    // const response = await run(prompt || input);
    const query = prompt;

    const data = {
      query: query,
    };
    let botReply;
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        botReply = result;
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    const formattedResponse = marked(botReply.response);
    setIsTypingCompleted(false);
    const words = formattedResponse.split(" ");
    let currentText = "";

    words.forEach((word, index) => {
      const id = setTimeout(() => {
        if (stopReplyRef.current) {
          clearAllTimeouts();
          // setMessages((prevMessages) => prevMessages.slice(0, -1));
          setConversation((prev) => ({
            ...prev,
            messages: [...prev.messages.slice(0, -1)],
          }));
          setLoading(false);
          setAllowSending(true);
          setStopIcon(false);
          return;
        }

        currentText += word + " ";
        setConversation((prev) => {
          const updatedMessages = [...prev.messages];
          updatedMessages[updatedMessages.length - 1].text = currentText;
          return {
            ...prev,
            messages: updatedMessages,
          };
        });

        if (index === words.length - 1) {
          setLoading(false);
          setStopIcon(false);
          setAllowSending(true);
          // console.log(conversation);
          setIsTypingCompleted(true);
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
        conversation,
        onSent,
        input,
        setInput,
        loading,
        showResult,
        allowSending,
        stopReply,
        stopIcon,
        suggestions,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;

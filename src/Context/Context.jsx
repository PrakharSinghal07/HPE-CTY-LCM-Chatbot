import { createContext, useState, useRef, useEffect } from "react";
import { marked } from "marked";

export const Context = createContext();


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const generateNewChat = async () => {
  try {
    const response = await fetch("http://localhost:8000/conversation/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "New Chat",
        messages: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting to backend:", error);
    return null;
  }
};

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [allowSending, setAllowSending] = useState(true);
  const [stopIcon, setStopIcon] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const stopReplyRef = useRef(false);

  const [conversation, setConversation] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [updateSidebar, setUpdateSidebar] = useState(true)
  const [updateSidebar2, setUpdateSidebar2] = useState(true)
  const createNewChat = async () => {
    if(conversation.title !== "New Chat"){
    const newChat = await generateNewChat();
    setConversation(newChat);
    setActiveConversationId(newChat.sessionId);
    }
  };

  useEffect(() => {
    const getConvo = async () => {
      const response = await fetch(`http://127.0.0.1:8000/conversation/initial`, {
        method: "GET",
      });
      const result = await response.json();
      {
        setConversation(result);

        setActiveConversationId(result.sessionId);
      }
    };
    getConvo();
  }, [updateSidebar2]);

  useEffect(() => {
    if (!activeConversationId) return;
    const getCurrentConversation = async () => {
      const response = await fetch(
        `http://127.0.0.1:8000/conversation/active/${activeConversationId}`
      );
      const result = await response.json();
      // console.log(result);
      if(result && result.sessionId !== conversation.sessionId)
      setConversation(result)
    };
    getCurrentConversation();
  }, [activeConversationId]);
  

  const getSuggestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/suggestions/");
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  const onSent = async (prompt, file) => {
    const userPrompt = prompt || input;

    setAllowSending(false);
    setLoading(true);
    stopReplyRef.current = false;
    setStopIcon(true);
    setShowResult(true);

    const userMessage = { type: "user", text: userPrompt };
    const botMessage = { type: "bot", text: "..." };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, botMessage],
    }));

    setInput("");

    const formData = new FormData();
    formData.append("message", userPrompt);
    if (file) formData.append("file", file);

    let botReply;
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        botReply = result;
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    const formattedResponse = marked(
      botReply?.response || "Something went wrong"
    );
    await sleep(1000);


    const userMessage1 = { type: "user", text: userPrompt };
    const botMessage1 = { type: "bot", text: formattedResponse };

    const updateConversation = async () => {
      const response = await fetch(`http://127.0.0.1:8000/conversation/${activeConversationId}`, {
        method:"POST",
        headers:{
          "Content-type": "application/json",
        },
        body: JSON.stringify({"userMsg": userMessage1, "botMsg": botMessage1, "prompt": prompt})
      })
      setUpdateSidebar(!updateSidebar)
      const result = await response.json()
      setConversation(result)
      if (conversation.title === "New Chat") {
        setConversation((prev) => ({
          ...prev,
          title: userPrompt.slice(0, 20),
        }));
      }
      
    }
    updateConversation()

    setLoading(false);
    setStopIcon(false);
    setAllowSending(true);
  };

  const stopReply = () => {
    stopReplyRef.current = true;
    setLoading(false);
    setAllowSending(true);
    setStopIcon(false);
  };

  return (
    <Context.Provider
      value={{
        conversation,
        setActiveConversationId,
        activeConversationId,
        onSent,
        input,
        setInput,
        loading,
        showResult,
        allowSending,
        stopReply,
        stopIcon,
        suggestions,
        createNewChat,
        updateSidebar,
        setUpdateSidebar,
        updateSidebar2,
        setUpdateSidebar2
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;

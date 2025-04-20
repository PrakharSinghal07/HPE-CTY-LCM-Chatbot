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
  const [isTypingCompleted, setIsTypingCompleted] = useState(true);
  const stopReplyRef = useRef(false);
  const timeoutIdsRef = useRef([]);
  const firstMessage = useRef(1);
  const titleQuery = useRef("New Chat");
  const [messageVersion, setMessageVersion] = useState(0);

  const [conversation, setConversation] = useState({
    sessionId: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
  });

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const hasMounted = useRef(false);

  const createNewChat = () => {
    const newChat = {
      sessionId: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };
    setConversation(newChat);
    setActiveConversationId(newChat.sessionId);
    setConversations((prev) => [newChat, ...prev]);
  };

  useEffect(() => {
    const getConvo = async () => {
      const response = await fetch("http://127.0.0.1:8000/conversation/all", {
        method: "GET",
      });
      const result = await response.json();

      if (result.length === 0) {
        const newConvo = {
          sessionId: crypto.randomUUID(),
          title: "New Chat",
          messages: [],
        };
        setConversation(newConvo);
        setConversations([newConvo]);
        setActiveConversationId(newConvo.sessionId);
      } else {
        setConversations(result);
        setActiveConversationId(result[0].sessionId);
      }
    };

    getConvo();
  }, []);

  // ✅ Sync conversation with activeConversationId — only after typing is complete
  useEffect(() => {
    if (!activeConversationId || !isTypingCompleted) return;

    const activeConv = conversations.find(
      (conv) => conv.sessionId === activeConversationId
    );

    if (activeConv && activeConv.sessionId !== conversation.sessionId) {
      setConversation(activeConv);
    }
  }, [activeConversationId, conversations, isTypingCompleted]);

  useEffect(() => {
    setConversation((prev) => ({
      ...prev,
      title: titleQuery.current,
    }));
    console.log(firstMessage.current);
  }, [firstMessage.current]);

  useEffect(() => {
    setConversations((prev) => {
      const isAlreadyPresent = prev.some(
        (c) => c.sessionId === conversation.sessionId
      );
      if (isAlreadyPresent) {
        return prev.map((c) =>
          c.sessionId === conversation.sessionId ? conversation : c
        );
      } else {
        return [conversation, ...prev];
      }
    });
  }, [isTypingCompleted]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const postData = async () => {
      try {
        console.log("Posting conversations to backend:");
        console.log(JSON.stringify(conversations, null, 2)); // nicely formatted
        await fetch("http://localhost:8000/conversation/all", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(conversations),
        });
      } catch (error) {
        console.error("Error posting to backend:", error);
      }
    };
    

    postData();
  }, [conversations]);

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  const getSuggestions = async () => {
    let response = await fetch("http://127.0.0.1:8000/suggestions/");
    response = await response.json();
    setSuggestions(response.suggestions);
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  const onSent = async (prompt) => {
    const userPrompt = prompt || input;

    if (conversation.title === "New Chat") {
      setConversation((prev) => ({
        ...prev,
        title: userPrompt.slice(0, 20),
      }));
    }

    setAllowSending(false);
    setLoading(true);
    stopReplyRef.current = false;
    setStopIcon(true);
    setShowResult(true);

    const userMessage = { type: "user", text: userPrompt };
    const botMessage = { type: "bot", text: "" };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, botMessage],
    }));

    setInput("");

    await new Promise((resolve) => setTimeout(resolve, 500));
    let botReply;
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userPrompt }),
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

    const formattedResponse = marked(botReply.response);
    setIsTypingCompleted(false);
    const words = formattedResponse.split(" ");
    let currentText = "";

    words.forEach((word, index) => {
      const id = setTimeout(() => {
        if (stopReplyRef.current) {
          clearAllTimeouts();
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
          if (updatedMessages.length > 0) {
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              text: currentText,
            };
            return { ...prev, messages: updatedMessages };
          }
          return prev;  // If no message to update, keep the previous state intact
        });
    
        // Log the updated conversation state
        setTimeout(() => {
          console.log("Current text:", currentText);
          console.log("Updated conversation:", conversation);
        }, 0);
    
        if (index === words.length - 1) {
          setLoading(false);
          setStopIcon(false);
          setAllowSending(true);
          setIsTypingCompleted(true);
        }
        setLoading(false);

      }, index * 40); // Adjust delay per word here
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
        conversations,
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
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;

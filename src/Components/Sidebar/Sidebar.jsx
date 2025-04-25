import React, { useContext, useEffect, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/Context";

const Sidebar = () => {
  const {updateSidebar2, setUpdateSidebar2 ,updateSidebar , setUpdateSidebar ,setActiveConversationId, activeConversationId, createNewChat} =
    useContext(Context);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [conversations, setConversations] = useState([])
  useEffect(() => {
    const fetchTitle = async () => {
      const response = await fetch("http://127.0.0.1:8000/conversation/sidebar")
      const result = await response.json()
      setConversations(result)
    }
    fetchTitle()
  }, [activeConversationId, updateSidebar])

  const handleChatMenuClicked = async () => {
    const response = await fetch(`http://127.0.0.1:8000/conversation/${activeConversationId}`, {
      method: "DELETE"
    })
    setUpdateSidebar2(!updateSidebar2)
  }
  const handleMenuIconClicked = () => {
    setSidebarExpanded((prev) => !prev);
  };


  return (
    <div className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
      <div className="top">
        <img
          className="menu_icon"
          src={assets.menu_bar}
          alt="Menu"
          onClick={handleMenuIconClicked}
        />
        <div
          className="new_chat"
          onClick={createNewChat}
        >
          <img src={assets.plus_icon} alt="New Chat" />
          {sidebarExpanded && <p>New Chat</p>}
        </div>
        {sidebarExpanded && (
          <div className="recent">
            <p className="recent_title">Recent</p>
            {conversations.map((conv) => (
              <div
                key={conv.sessionId}
                className={`chat-title recent_entry ${
                  activeConversationId === conv.sessionId ? "active" : ""
                }`}
                onClick={() => setActiveConversationId(conv.sessionId)}
              >
                <p className="chatName"><span>{conv.title?.slice(0, 18) || "New Chat"}...</span> {activeConversationId === conv.sessionId && <span className="menu" onClick={handleChatMenuClicked}><img src={assets.deleteBtn}></img></span>}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

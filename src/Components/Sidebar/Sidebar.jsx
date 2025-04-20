import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/Context";

const Sidebar = () => {
  const { conversations, setActiveConversationId, activeConversationId, createNewChat} =
    useContext(Context);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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
            {/* <div
              className="recent_entry"
              onClick={() => console.log("Recent Chat Clicked")}
            >
              <img src={assets.message_icon} alt="Message" />
              <p>{conversation.title.slice(0, 18)}...</p>
            </div> */}
            {conversations.map((conv) => (
              <div
                key={conv.sessionId}
                className={`chat-title recent_entry ${
                  activeConversationId === conv.sessionId ? "active" : ""
                }`}
                onClick={() => setActiveConversationId(conv.sessionId)}
              >
                {/* <img src={assets.message_icon} alt="Message" /> */}
                <p>{conv.title?.slice(0, 18) || "Untitled Chat"}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

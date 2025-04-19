// IF MODYING THE SIDEBAR PLZ CHANGE THE CONTEXT VALUES USED
// AS prevPrompts, recentPrompt, timeouts, dataFetched NO LONGER EXIST
// I REPLACED THEM WITH A MESSAGE ARRAY STORING BOTH USER PROMPTS AND
// CHATBOT REPLY

import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/Context";

const Sidebar = () => {
  const { conversation } = useContext(Context);
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
          onClick={() => console.log("New Chat Clicked")}
        >
          <img src={assets.plus_icon} alt="New Chat" />
          {sidebarExpanded && <p>New Chat</p>}
        </div>
        {sidebarExpanded && (
          <div className="recent">
            <p className="recent_title">Recent</p>
            <div
              className="recent_entry"
              onClick={() => console.log("Recent Chat Clicked")}
            >
              <img src={assets.message_icon} alt="Message" />
              <p>{conversation.title.slice(0, 18)}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

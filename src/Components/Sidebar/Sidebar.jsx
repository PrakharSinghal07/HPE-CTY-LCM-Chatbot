// IF MODYING THE SIDEBAR PLZ CHANGE THE CONTEXT VALUES USED 
// AS prevPrompts, recentPrompt, timeouts, dataFetched NO LONGER EXIST
// I REPLACED THEM WITH A MESSAGE ARRAY STORING BOTH USER PROMPTS AND 
// CHATBOT REPLY

import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/Context";
const Sidebar = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const {
    onSent,
    prevPrompts,
    setRecentPrompt,
    newChat,
    setResultData,
    clearAllTimeouts,
    dataFetched,
  } = useContext(Context);

  const loadPrompt = async (prompt) => {
    if (dataFetched) {
      // clearAllTimeouts(); 
      setResultData(""); 
      setRecentPrompt(prompt);
      await onSent(prompt);
  };
}

  const handleMenuIconClicked = () => {
    setSidebarExpanded((prev) => !prev);
  };
  return (
    <div className="sidebar">
      <div className="top">
        <img
          className="menu_icon"
          src={assets.menu_icon}
          alt=""
          onClick={() => {
            handleMenuIconClicked();
          }}
        />
        <div className="new_chat" onClick={() => newChat()}>
          <img src={assets.plus_icon} alt="" />
          {sidebarExpanded ? <p>New Chat</p> : null}
        </div>
        {sidebarExpanded ? (
          <div className="recent">
            <p className="recent_title"> Recent </p>
            {prevPrompts.map((item, index) => {
              return (
                <div onClick={() => loadPrompt(item)} className="recent_entry">
                  <img src={assets.message_icon} alt="" />
                  <p>{item.slice(0, 18)}...</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="bottom">
        <div className="bottom_item recent_entry">
          <img src={assets.question_icon} alt="" />
          {sidebarExpanded ? <p>Help</p> : null}
        </div>
        <div className="bottom_item recent_entry">
          <img src={assets.history_icon} alt="" />
          {sidebarExpanded ? <p>Activity</p> : null}
        </div>
        <div className="bottom_item recent_entry">
          <img src={assets.setting_icon} alt="" />
          {sidebarExpanded ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

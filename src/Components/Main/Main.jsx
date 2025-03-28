import React, { useContext, useEffect, useRef } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import Card from "./Card";
import { Context } from "../../Context/Context";

const Main = () => {
  const cardText = [
    "Why is my node frequently rebooting?",
    "How to debug a failed build?",
    "How to resolve dependency conflicts?",
  ];
  const cardImages = [
    assets.compass_icon,
    assets.bulb_icon,
    assets.message_icon,
    assets.code_icon,
  ];

  const {
    onSent,
    showResult,
    loading,
    setInput,
    input,
    messages,
    allowSending
  } = useContext(Context);

  const chatEndRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="main">
      <div className="nav">
        <p>ChatBot</p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main_container">
        {!showResult ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Dev</span>
              </p>
              <p>How can I help you today?</p>
            </div>
            <div className="cards">
              {cardText.map((text, i) => (
                <Card key={i} cardText={text} cardImage={cardImages[i]} />
              ))}
            </div>
          </>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="result">
              <>
                <div className="result_title">
                  {message.type === "bot" ? (
                    <div className="result_data">
                      <img src={assets.chatbot_icon} alt="" />
                      {index === messages.length - 1 && loading ? (
                        <div className="loader">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <p
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        ></p>
                      )}
                    </div>
                  ) : (
                    <>
                      <img src={assets.user_icon} alt="User" />
                      <p>{message.text}</p>
                    </>
                  )}
                </div>
              </>
            </div>
          ))
        )}
         <div ref={chatEndRef}></div>
      </div>

      <div className="main_bottom">
        <div className="search_box">
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim() && allowSending) {
                onSent(input);
                scrollToBottom(); 

              }
            }}
            value={input}
            type="text"
            placeholder="Ask anything"
          />
          <div>
            <img src={assets.mic_icon} alt="" />
            <img src={assets.add_file} alt="" />
            <img
               onClick={() => {
                if (input.trim() && allowSending) {
                  onSent(input); 
                  scrollToBottom(); 
                }
              }}
              src={assets.send_icon}
              alt=""
            />
          </div>
        </div>
        <p className="bottom_info">
          Chatbot can make mistakes. Check important info.
        </p>
      </div>
      <div className="transparent"></div>
    </div>
  );
};

export default Main;

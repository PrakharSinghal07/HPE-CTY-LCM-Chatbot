import React, { useContext, useRef, useState } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import Card from "./Card";
import { Context } from "../../Context/Context";

const Main = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [file, setFile] = useState(null);
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
    conversation,
    allowSending,
    stopReply,
    stopIcon,
    suggestions,
  } = useContext(Context);

  const cardText = suggestions;

  const chatEndRef = useRef(null);
  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark-mode");
      } else {
        document.documentElement.classList.remove("dark-mode");
      }
      return newMode;
    });
  };
  return (
    <div className={`main`}>
      <div className="nav">
        <p>Orbit</p>{" "}
        <div className="nav_right">
          {" "}
          <div className="nav_right">
            <img
              className={isDarkMode ? "light_mode_icon" : "dark_mode_icon"}
              src={isDarkMode ? assets.light_mode : assets.night_mode}
              onClick={toggleDarkMode}
              alt={isDarkMode ? "Light Mode" : "Dark Mode"}
            />
            <img src={assets.user_icon} alt="User" />
          </div>
        </div>{" "}
      </div>
      <div className="main_container">
        {!conversation.messages ||
        conversation.messages.length === 0 ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Dev</span>
              </p>
              <p className="greetMsg">How can I help you today?</p>
            </div>
            <div className="cards">
              {cardText.map((text, i) => (
                <Card key={i} cardText={text} index={i} />
              ))}
            </div>
          </>
        ) : (
          conversation.messages.map((message, index) => (
            <div key={index} className="result">
              <div className={`result_title ${message.type}`}>
                {message.type === "bot" ? (
                  <div className={`result_data`}>
                    {/* <img src={assets.chatbot_icon} alt="" /> */}
                    {index === conversation.messages.length - 1 && loading ? (
                      <div className="loader">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <div className="hello">
                        {/* {scrollToBottom()} */}
                        <p
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        ></p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p>{message.text}</p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className={`main_bottom ${file && 'main_bottom_with_file'}`}>
        <div className="search_box">
          {file &&<div className="file_container">
            {file && <img className="new_file" src={assets.file} alt="" />}
            {file && <p className="file_name">{file.name}</p>}
            <img src={assets.cross}  onClick={() => {
              setFile(null);
            }}/>
          </div>}
          <div className="tempo">
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim() && allowSending) {
                onSent(input, file);
                setFile(null)
                scrollToBottom();
              }
            }}
            value={input}
            type="text"
            placeholder="Ask anything"
          />
          <div>
            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              style={{ display: "none" }}
              id="fileUpload"
            />
              <img src={assets.mic_icon} className="utility_icon" alt="" />
            <label className="file_label" htmlFor="fileUpload">
              <img className="file_icon utility_icon" src={assets.add_file} alt="" />

            </label>
            <img
              onClick={() => {
                if (stopIcon) {
                  stopReply();
                } else if (input.trim() && allowSending) {
                  onSent(input, file);
                  setFile(null)
                  scrollToBottom();
                }
              }}
              src={stopIcon ? assets.stop_button : assets.send_icon}
              alt="" className="utility_icon"
            />
          </div>
          </div>
        </div>
      </div>
      <div className="transparent"></div>
      <div ref={chatEndRef}></div>
    </div>
  );
};

export default Main;

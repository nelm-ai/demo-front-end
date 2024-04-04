"use client";
import React, { useState, useEffect } from "react";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket("wss://chat.petals.dev/api/v2/generate");

    newWs.onopen = () => {
      console.log("WebSocket connection established");
    };

    newWs.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.ok) {
        if (response.outputs) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: response.outputs },
          ]);
        }
      } else {
        console.error("Error:", response.traceback);
      }
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim() && ws) {
      ws.send(
        JSON.stringify({
          type: "open_inference_session",
          model: "stabilityai/StableBeluga2",
          max_length: 30,
        })
      );

      ws.send(
        JSON.stringify({
          type: "generate",
          inputs: inputValue.trim(),
          max_length: 30,
          do_sample: 1,
          temperature: 0.6,
          top_p: 0.9,
        })
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: inputValue.trim() },
      ]);

      setInputValue("");
    }
  };

  return (
    <div>
      {/* Render the messages */}
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.sender}: </strong>
          {message.text}
        </div>
      ))}

      {/* Render the input form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Home;

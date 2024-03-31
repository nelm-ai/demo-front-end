"use client"; // This is a client component 👈🏽
import React, { useState } from "react";
import SubscribeBanner from "@/Components/SubscribeBanner";
import ModelButtons from "@/Components/ModelButton";

const Model1: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([{ sender: "bot", text: "Hello, how can I help you?" }]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        { sender: "user", text: inputValue.trim() },
        { sender: "bot", text: inputValue.trim() },
      ]);
      setInputValue("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <ModelButtons />
      <div className="flex-grow flex justify-center items-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800 text-white py-2 px-4 rounded-t-md">
            <h2 className="text-lg font-semibold">Model 1</h2>
            <p className="text-sm">For now I'm just a repeating bot</p>
          </div>
          <div className="flex flex-col h-96 overflow-y-auto p-4 bg-gray-200 rounded-t-md">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-md ${
                  message.sender === "user"
                    ? "bg-gray-300"
                    : "bg-gray-400 text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-4 bg-gray-100 rounded-b-md"
          >
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter your prompt"
              className="flex-grow mr-4 p-2 border border-gray-300 rounded text-black"
              rows={3}
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Model1;

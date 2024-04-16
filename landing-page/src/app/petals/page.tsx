"use client"; // This is a client component 👈🏽
import React, { useState, useEffect, useRef } from "react";
import SubscribeBanner from "@/Components/SubscribeBanner";
import ModelButtons from "@/Components/ModelButton";

const Petals: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([{ sender: "bot", text: "Hello, how can I help you?" }]);
  const [inputValue, setInputValue] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionOpened, setSessionOpened] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [forceStop, setForceStop] = useState(false);
  //const [currentText, setCurrentText] = useState("");
  //const stop_seq = ".?/n!" || "/n" || "</s>" || "!" || "?";
  const stop_seq = [".", "/n", "</s>", "!", "?"];

  const dialogueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Setting up WebSocket connection");
    const newWs = new WebSocket("wss://chat.petals.dev/api/v2/generate");
    newWs.onopen = () => {
      console.log("WebSocket connection established");
    };

    let lastMessageTime: number | null = null;
    let currentText = "";
    let isGenerating = false; // Flag variable

    const startGeneration = (inputs: string) => {
      if (isGenerating) return; // Don't start a new generation if one is already in progress

      isGenerating = true;
      lastMessageTime = null;
      currentText = "";

      newWs.send(
        JSON.stringify({
          type: "generate",
          inputs: inputs,
          max_new_tokens: 1,
          do_sample: 1,
          stop_sequence: stop_seq,
        })
      );
    };

    newWs.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log("Received message from WebSocket:", event.data);
      if (!response.ok) {
        console.log(response.traceback);
        isGenerating = false;
        return;
      }

      if (lastMessageTime != null) {
        setTotalElapsed(
          (prevElapsed) => prevElapsed + performance.now() - lastMessageTime
        );
        setTokenCount((prevCount) => prevCount + response.token_count);
      }
      lastMessageTime = performance.now();

      currentText += response.outputs;
      console.log("Updating messages with bot response", response.outputs);
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage.sender === "bot") {
          return [
            ...prevMessages.slice(0, -1),
            { sender: "bot", text: lastMessage.text + response.outputs },
          ];
        } else {
          return [...prevMessages, { sender: "bot", text: "" }];
        }
      });

      if (response.stop) {
        console.log("Stop generating");
        isGenerating = false;
      } else if (tokenCount >= 1) {
        const speed = tokenCount / (totalElapsed / 1000);
        console.log(`Speed: ${speed.toFixed(1)} tokens/sec`);
        console.log("Generate called inside onmessage");
        newWs.send(
          JSON.stringify({
            type: "generate",
            max_new_tokens: 1,
            do_sample: 1,
            stop_sequence: stop_seq,
          })
        );
      }
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setWs(newWs);

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.close();
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() && ws) {
      console.log("Updating messages with user input: ", inputValue);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: inputValue.trim() },
      ]);
      if (!sessionOpened) {
        console.log("Sending open_inference_session message");
        ws.send(
          JSON.stringify({
            type: "open_inference_session",
            model: "stabilityai/StableBeluga2",
            max_length: 500,
            stop_sequence: stop_seq,
          })
        );
        setSessionOpened(true);
      }
      console.log("Sending generate message with: ", inputValue.trim());
      ws.send(
        JSON.stringify({
          type: "generate",
          inputs: inputValue.trim(),
          max_new_tokens: 1,
          do_sample: 1,
          stop_sequence: ".",
          extra_stop_sequences: "?",
          // extra_stop_sequences: "\n",
        })
      );
      setInputValue("");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <ModelButtons />
      <div className="flex-grow flex justify-center items-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800 text-white py-2 px-4 rounded-t-md">
            <h2 className="text-lg font-semibold">Petals</h2>
            <p className="text-sm">
              We are connecting to the Petal network to run these inferences
              using the Stable Beluga2 model.
            </p>
          </div>
          <div
            ref={dialogueRef}
            className="flex flex-col h-96 overflow-y-auto p-4 bg-gray-200 rounded-t-md"
          >
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

export default Petals;

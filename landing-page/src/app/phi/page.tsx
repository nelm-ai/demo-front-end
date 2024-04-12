"use client";

import ModelButtons from "@/Components/ModelButton";
import SubscribeBanner from "@/Components/SubscribeBanner";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const MODELS = {
    phi_1_5_q4k: {
      base_url: "https://huggingface.co/lmz/candle-quantized-phi/resolve/main/",
      model: "model-q4k.gguf",
      tokenizer: "tokenizer.json",
      config: "phi-1_5.json",
      quantized: true,
      seq_len: 10,
      size: "800 MB",
    },
  };

  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([{ sender: "bot", text: "Hello, how can I help you?" }]);
  const [inputValue, setInputValue] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [outputCounter, setOutputCounter] = useState("");

  const dialogueRef = useRef<HTMLDivElement>(null);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../workers/phiWorker.js", import.meta.url),
        {
          type: "module",
        }
      );
    }

    const onMessageReceived = (e: MessageEvent) => {
      switch (e.data.status) {
        case "loading":
          setStatus("Loading...");
          break;
        case "generating":
          setStatus("Generating...");
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.sender === "bot") {
              return [
                ...prevMessages.slice(0, -1),
                { sender: "bot", text: lastMessage.text + e.data.token },
              ];
            } else {
              return [
                ...prevMessages,
                { sender: "bot", text: e.data.token.replace(/^A: /, "") },
              ];
            }
          });
          setOutputCounter(`${e.data.tokensSec.toFixed(2)} tokens/sec`);
          break;
        case "complete":
          setStatus("Generation completed");
          setIsRunning(false);
          break;
        case "aborted":
          setStatus("Generation aborted");
          setIsRunning(false);
          break;
        default:
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () => {
      worker.current?.removeEventListener("message", onMessageReceived);
    };
  }, []);

  const generate = useCallback(
    (prompt: string) => {
      if (worker.current && !isRunning) {
        setIsRunning(true);
        setOutputCounter("");
        worker.current.postMessage({
          command: "start",
          weightsURL: MODELS.phi_1_5_q4k.base_url + MODELS.phi_1_5_q4k.model,
          modelID: "phi_1_5_q4k",
          tokenizerURL:
            MODELS.phi_1_5_q4k.base_url + MODELS.phi_1_5_q4k.tokenizer,
          configURL: MODELS.phi_1_5_q4k.base_url + MODELS.phi_1_5_q4k.config,
          quantized: MODELS.phi_1_5_q4k.quantized,
          prompt,
          temp: 0.9,
          top_p: 0.95,
          repeatPenalty: 1.0,
          seed: 42,
          maxSeqLen: MODELS.phi_1_5_q4k.seq_len,
          maxTokens: 20,
        });
      }
    },
    [isRunning]
  );

  const stopGeneration = useCallback(() => {
    if (worker.current && isRunning) {
      worker.current.postMessage({ command: "abort" });
    }
  }, [isRunning]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setMessages([...messages, { sender: "user", text: inputValue.trim() }]);
      generate(inputValue.trim());
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
            <h2 className="text-lg font-semibold">Phi 1.5</h2>
            <p className="text-sm">Rust/Wasm Demo</p>
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              disabled={isRunning}
            >
              Send
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={stopGeneration}
              disabled={!isRunning}
            >
              Stop
            </button>
          </form>
          <div className="mt-4 text-center">
            {status} {outputCounter}
          </div>
        </div>
      </div>
    </div>
  );
}

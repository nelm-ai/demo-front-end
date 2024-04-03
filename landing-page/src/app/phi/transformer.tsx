"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const MODELS = {
    phi_1_5_q4k: {
      base_url: "https://huggingface.co/lmz/candle-quantized-phi/resolve/main/",
      model: "model-q4k.gguf",
      tokenizer: "tokenizer.json",
      config: "phi-1_5.json",
      quantized: true,
      seq_len: 2048,
      size: "800 MB",
    },
  };
  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
  const [modelID, setModelID] = useState("phi_1_5_q4k");
  const [outputStatus, setOutputStatus] = useState("No output yet");
  const [outputGeneration, setOutputGeneration] = useState("");
  const [outputCounter, setOutputCounter] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");

  // Create a reference to the worker object.
  const worker = useRef(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("../phiWorker.js", import.meta.url), {
        type: "module",
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "loading":
          setReady(false);
          break;
        case "generating":
          setOutputStatus("Generating...");
          setOutputGeneration((prev) => prev + e.data.token);
          setOutputCounter(`${e.data.tokensSec.toFixed(2)} tokens/sec`);
          break;
        case "complete":
          setResult(e.data.output);
          setOutputStatus("Generation completed");
          setIsRunning(false);
          break;
        case "aborted":
          setOutputStatus("Generation aborted");
          setIsRunning(false);
          break;
        default:
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback((text) => {
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-2 text-center">Transformers.js</h1>
      <h2 className="text-2xl mb-4 text-center">Next.js template</h2>

      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        onInput={(e) => {
          classify(e.target.value);
        }}
      />

      {ready !== null && (
        <pre className="bg-gray-100 p-2 rounded">
          {!ready || !result ? "Loading..." : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}

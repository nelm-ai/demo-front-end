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
      maxTokens: 20,
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
          setOutputStatus("Loading...");
          console.log("Loading");
          setReady(false);
          break;
        case "generating":
          setOutputStatus("Generating...");
          // setOutputGeneration((prev) => prev + e.data.token);
          setOutputGeneration((prev) => prev + e.data.token);
          setOutputCounter(`${e.data.tokensSec.toFixed(2)} tokens/sec`);
          console.log("generating...");
          console.log(e.data);
          break;
        case "complete":
          setResult(e.data.output);
          setOutputStatus("Generation completed");
          setIsRunning(false);
          console.log("complete");
          break;
        case "aborted":
          setOutputStatus("Generation aborted");
          setIsRunning(false);
          console.log("abort");
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
  }, []);

  const generate = useCallback(
    (prompt) => {
      if (worker.current && !isRunning) {
        setIsRunning(true);
        setOutputGeneration("");
        setOutputCounter("");
        console.log("Calling postMessage on: ", prompt);
        worker.current.postMessage({
          command: "start",
          weightsURL: MODELS[modelID].base_url + MODELS[modelID].model,
          modelID,
          tokenizerURL: MODELS[modelID].base_url + MODELS[modelID].tokenizer,
          configURL: MODELS[modelID].base_url + MODELS[modelID].config,
          quantized: MODELS[modelID].quantized,
          prompt,
          temp: 0.9,
          top_p: 0.95,
          repeatPenalty: 1.0,
          seed: 42,
          maxSeqLen: MODELS[modelID].seq_len,
          maxTokens: 20,
        });
        console.log("Calling generate");
      }
    },
    [isRunning, modelID]
  );
  const stopGeneration = useCallback(() => {
    if (worker.current && isRunning) {
      worker.current.postMessage({ command: "abort" });
    }
  }, [isRunning]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-2 text-center">Phi 1.5</h1>
      <h2 className="text-2xl mb-4 text-center">Rust/Wasm Demo</h2>
      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4 text-black"
        type="text"
        placeholder="Enter prompt here"
        value={inputPrompt}
        onChange={(e) => setInputPrompt(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => generate(inputPrompt)}
        disabled={isRunning}
      >
        Generate
      </button>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        onClick={stopGeneration}
        disabled={!isRunning}
      >
        Stop Generation
      </button>
      <pre className="bg-gray-100 p-2 rounded mb-4 text-black">
        {outputStatus}
      </pre>
      <pre className="bg-gray-100 p-2 rounded mb-4 text-black">
        {outputCounter}
      </pre>
      <pre className="bg-gray-100 p-2 rounded text-black">
        {outputGeneration}
      </pre>
      <pre className="bg-gray-100 p-2 rounded text-black">{result}</pre>
    </main>
  );
}

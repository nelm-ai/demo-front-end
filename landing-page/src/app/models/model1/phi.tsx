"use client"; // This is a client component 👈🏽
import React, { useState, useRef } from "react";
import SubscribeBanner from "@/Components/SubscribeBanner";
import ModelButtons from "@/Components/ModelButton";

const Model1: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([{ sender: "bot", text: "Hello, how can I help you?" }]);
  const [inputValue, setInputValue] = useState("");
  const phiWorkerRef = useRef(null);
  const modelSelectRef = useRef(null);
  const promptRef = useRef(null);
  const clearBtnRef = useRef(null);
  const runBtnRef = useRef(null);
  const promptTemplatesRef = useRef(null);

  const phiWorker = new Worker("/PhiWorker.ts", {
    type: "module",
  });
  async function generateSequence(controller) {
    const getValue = (id) => document.querySelector(`#${id}`).value;
    const modelID = getValue("model");
    const model = MODELS[modelID];
    const weightsURL =
      model.model instanceof Array
        ? model.model.map((m) => model.base_url + m)
        : model.base_url + model.model;
    const tokenizerURL = model.base_url + model.tokenizer;
    const configURL = model.base_url + model.config;

    const prompt = getValue("prompt").trim();
    const temperature = getValue("temperature");
    const topP = getValue("top-p");
    const repeatPenalty = getValue("repeat_penalty");
    const seed = getValue("seed");
    const maxSeqLen = getValue("max-seq");

    function updateStatus(data) {
      const outStatus = document.querySelector("#output-status");
      const outGen = document.querySelector("#output-generation");
      const outCounter = document.querySelector("#output-counter");

      switch (data.status) {
        case "loading":
          outStatus.hidden = false;
          outStatus.textContent = data.message;
          outGen.hidden = true;
          outCounter.hidden = true;
          break;
        case "generating":
          const { message, prompt, sentence, tokensSec, totalTime } = data;
          outStatus.hidden = true;
          outCounter.hidden = false;
          outGen.hidden = false;
          outGen.innerHTML = snarkdown(prompt + sentence);
          outCounter.innerHTML = `${(totalTime / 1000).toFixed(
            2
          )}s (${tokensSec.toFixed(2)} tok/s)`;
          hljs.highlightAll();
          break;
        case "complete":
          outStatus.hidden = true;
          outGen.hidden = false;
          break;
      }
    }

    return new Promise((resolve, reject) => {
      phiWorker.postMessage({
        weightsURL,
        modelID,
        tokenizerURL,
        configURL,
        quantized: model.quantized,
        prompt,
        temp: temperature,
        top_p: topP,
        repeatPenalty,
        seed: seed,
        maxSeqLen,
        command: "start",
      });

      const handleAbort = () => {
        phiWorker.postMessage({ command: "abort" });
      };
      const handleMessage = (event) => {
        const { status, error, message, prompt, sentence } = event.data;
        if (status) updateStatus(event.data);
        if (error) {
          phiWorker.removeEventListener("message", handleMessage);
          reject(new Error(error));
        }
        if (status === "aborted") {
          phiWorker.removeEventListener("message", handleMessage);
          resolve(event.data);
        }
        if (status === "complete") {
          phiWorker.removeEventListener("message", handleMessage);
          resolve(event.data);
        }
      };

      controller.signal.addEventListener("abort", handleAbort);
      phiWorker.addEventListener("message", handleMessage);
    });
  }

  const form = document.querySelector("#form");
  const prompt = document.querySelector("#prompt");
  const clearBtn = document.querySelector("#clear-btn");
  const runBtn = document.querySelector("#run");
  const modelSelect = document.querySelector("#model");
  const promptTemplates = document.querySelector("#prompt-templates");
  let runController = new AbortController();
  let isRunning = false;

  document.addEventListener("DOMContentLoaded", () => {
    for (const [id, model] of Object.entries(MODELS)) {
      const option = document.createElement("option");
      option.value = id;
      option.innerText = `${id} (${model.size})`;
      modelSelect.appendChild(option);
    }
    const query = new URLSearchParams(window.location.search);
    const modelID = query.get("model");
    if (modelID) {
      modelSelect.value = modelID;
    } else {
      modelSelect.value = "phi_1_5_q4k";
    }

    for (const [i, { title, prompt }] of TEMPLATES.entries()) {
      const div = document.createElement("div");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "task";
      input.id = `templates-${i}`;
      input.classList.add("font-light", "cursor-pointer");
      input.value = prompt;
      const label = document.createElement("label");
      label.htmlFor = `templates-${i}`;
      label.classList.add("cursor-pointer");
      label.innerText = title;
      div.appendChild(input);
      div.appendChild(label);
      promptTemplates.appendChild(div);
    }
  });

  promptTemplates.addEventListener("change", (e) => {
    const template = e.target.value;
    prompt.value = template;
    prompt.style.height = "auto";
    prompt.style.height = prompt.scrollHeight + "px";
    runBtn.disabled = false;
    clearBtn.classList.remove("invisible");
  });
  modelSelect.addEventListener("change", (e) => {
    const query = new URLSearchParams(window.location.search);
    query.set("model", e.target.value);
    window.history.replaceState({}, "", `${window.location.pathname}?${query}`);
    window.parent.postMessage({ queryString: "?" + query }, "*");
    const model = MODELS[e.target.value];
    document.querySelector("#max-seq").max = model.seq_len;
    document.querySelector("#max-seq").nextElementSibling.value = 200;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isRunning) {
      stopRunning();
    } else {
      startRunning();
      await generateSequence(runController);
      stopRunning();
    }
  });

  function startRunning() {
    isRunning = true;
    runBtn.textContent = "Stop";
  }

  function stopRunning() {
    runController.abort();
    runController = new AbortController();
    runBtn.textContent = "Run";
    isRunning = false;
  }
  clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    prompt.value = "";
    clearBtn.classList.add("invisible");
    runBtn.disabled = true;
    stopRunning();
  });
  prompt.addEventListener("input", (e) => {
    runBtn.disabled = false;
    if (e.target.value.length > 0) {
      clearBtn.classList.remove("invisible");
    } else {
      clearBtn.classList.add("invisible");
    }
  });

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

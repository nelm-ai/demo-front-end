"use client"; // This is a client component 👈🏽

import React, { useRef, useState, useEffect } from "react";
import SubscribeBanner from "@/Components/SubscribeBanner";
import ModelButtons from "@/Components/ModelButton";

const Yolo: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const MODEL_BASEURL =
    "https://huggingface.co/lmz/candle-yolo-v8/resolve/main/";

  const MODELS = {
    yolov8n: {
      model_size: "n",
      url: "yolov8n.safetensors",
    },
    yolov8s: {
      model_size: "s",
      url: "yolov8s.safetensors",
    },
    yolov8m: {
      model_size: "m",
      url: "yolov8m.safetensors",
    },
    yolov8l: {
      model_size: "l",
      url: "yolov8l.safetensors",
    },
    yolov8x: {
      model_size: "x",
      url: "yolov8x.safetensors",
    },
    yolov8n_pose: {
      model_size: "n",
      url: "yolov8n-pose.safetensors",
    },
    yolov8s_pose: {
      model_size: "s",
      url: "yolov8s-pose.safetensors",
    },
    yolov8m_pose: {
      model_size: "m",
      url: "yolov8m-pose.safetensors",
    },
    yolov8l_pose: {
      model_size: "l",
      url: "yolov8l-pose.safetensors",
    },
    yolov8x_pose: {
      model_size: "x",
      url: "yolov8x-pose.safetensors",
    },
  };

  const COCO_PERSON_SKELETON = [
    [4, 0], // head
    [3, 0],
    [16, 14], // left lower leg
    [14, 12], // left upper leg
    [6, 12], // left torso
    [6, 5], // top torso
    [6, 8], // upper arm
    [8, 10], // lower arm
    [1, 2], // head
    [1, 3], // right head
    [2, 4], // left head
    [3, 5], // right neck
    [4, 6], // left neck
    [5, 7], // right upper arm
    [7, 9], // right lower arm
    [5, 11], // right torso
    [11, 12], // bottom torso
    [11, 13], // right upper leg
    [13, 15], // right lower leg
  ];

  const [image, setImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [modelID, setModelID] = useState("yolov8n");
  const [confidence, setConfidence] = useState(0.25);
  const [iouThreshold, setIouThreshold] = useState(0.45);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasResultRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../workers/yoloWorker.js", import.meta.url),
        {
          type: "module",
        }
      );
    }

    const onMessageReceived = (e: MessageEvent) => {
      if (e.data.status === "complete") {
        setGeneratedImage(e.data.imageURL);
        console.log("new image generated");
        setIsDetecting(false);
        setHasImage(false);
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () => {
      worker.current?.removeEventListener("message", onMessageReceived);
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("file", event.target.files);
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
      drawImageCanvas(URL.createObjectURL(event.target.files[0]));
      setHasImage(true); // Move this line here
    }
  };

  const handleDetect = async () => {
    if (!hasImage || isDetecting) {
      return;
    }

    setIsDetecting(true);

    const modelURL = MODEL_BASEURL + MODELS[modelID].url;
    const modelSize = MODELS[modelID].model_size;

    const canvasInput = canvasRef.current;
    const canvas = canvasResultRef.current;
    if (!canvasInput || !canvas) {
      return;
    }

    canvas.width = canvasInput.width;
    canvas.height = canvasInput.height;
    const scale = canvas.width / canvas.offsetWidth;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.drawImage(canvasInput, 0, 0);
    const imageURL = canvas.toDataURL();
    const results = await await classifyImage(
      imageURL,
      modelID,
      modelURL,
      modelSize,
      confidence,
      iouThreshold
    );
    console.log("results", results);
    const { output } = results;

    ctx.lineWidth = 1 + 2 * scale;
    ctx.strokeStyle = "#3c8566";
    ctx.fillStyle = "#0dff9a";
    const fontSize = 14 * scale;
    ctx.font = `${fontSize}px sans-serif`;
    for (const detection of output) {
      // check keypoint for pose model data
      let xmin, xmax, ymin, ymax, label, confidence, keypoints;
      if ("keypoints" in detection) {
        xmin = detection.xmin;
        xmax = detection.xmax;
        ymin = detection.ymin;
        ymax = detection.ymax;
        confidence = detection.confidence;
        keypoints = detection.keypoints;
      } else {
        const [_label, bbox] = detection;
        label = _label;
        xmin = bbox.xmin;
        xmax = bbox.xmax;
        ymin = bbox.ymin;
        ymax = bbox.ymax;
        confidence = bbox.confidence;
      }
      const [x, y, w, h] = [xmin, ymin, xmax - xmin, ymax - ymin];

      const text = `${label ? label + " " : ""}${confidence.toFixed(2)}`;
      const width = ctx.measureText(text).width;
      ctx.fillStyle = "#3c8566";
      ctx.fillRect(x - 2, y - fontSize, width + 4, fontSize);
      ctx.fillStyle = "#e3fff3";

      ctx.strokeRect(x, y, w, h);
      ctx.fillText(text, x, y - 2);
      if (keypoints) {
        ctx.save();
        ctx.fillStyle = "magenta";
        ctx.strokeStyle = "yellow";

        for (const keypoint of keypoints) {
          const { x, y } = keypoint;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.beginPath();
        for (const [xid, yid] of COCO_PERSON_SKELETON) {
          //draw line between skeleton keypoitns
          if (keypoints[xid] && keypoints[yid]) {
            ctx.moveTo(keypoints[xid].x, keypoints[xid].y);
            ctx.lineTo(keypoints[yid].x, keypoints[yid].y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // worker.current?.postMessage({
    //   imageURL,
    //   modelID,
    //   modelURL,
    //   modelSize,
    //   confidence,
    //   iouThreshold,
    //   updateStatus,
    // });
  };
  async function classifyImage(
    imageURL: string, // URL of image to classify
    modelID: string, // ID of model to use
    modelURL: string, // URL to model file
    modelSize: any, // size of model
    confidence: number, // confidence threshold
    iou_threshold: number // IoU threshold
  ) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("../workers/yoloWorker.js", import.meta.url),
        { type: "module" }
      );
      worker.postMessage({
        imageURL,
        modelID,
        modelURL,
        modelSize,
        confidence,
        iou_threshold,
      });
      console.log("jere");
      function handleMessage(event) {
        console.log("message", event.data);
        if ("status" in event.data) {
          updateStatus(event.data.status);
        }
        if ("error" in event.data) {
          worker.removeEventListener("message", handleMessage);
          reject(new Error(event.data.error));
        }
        if (event.data.status === "complete") {
          worker.removeEventListener("message", handleMessage);
          resolve(event.data);
        }
      }
      worker.addEventListener("message", handleMessage);
    });
  }

  const drawImageCanvas = (imgURL: string) => {
    const canvas = canvasRef.current;
    const canvasResult = canvasResultRef.current;
    if (!canvas || !canvasResult) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const ctxResult = canvasResult.getContext("2d");
    if (!ctx || !ctxResult) {
      return;
    }

    ctxResult.clearRect(0, 0, canvasResult.width, canvasResult.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHasImage(false);
    canvas.parentElement!.style.height = "auto";

    if (imgURL && imgURL !== "") {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.parentElement!.style.height = canvas.offsetHeight + "px";
        setHasImage(true);
      };

      img.src = imgURL;
    }
  };

  const updateStatus = (statusMessage: string) => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }

    if (statusMessage === "detecting") {
      button.disabled = true;
      button.classList.add("bg-blue-700");
      button.classList.remove("bg-blue-950");
      button.textContent = "Predicting...";
    } else if (statusMessage === "complete") {
      button.disabled = false;
      button.classList.add("bg-blue-950");
      button.classList.remove("bg-blue-700");
      button.textContent = "Predict";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <ModelButtons />
      <div className="flex-grow flex justify-center items-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800 text-white py-2 px-4 rounded-t-md">
            <h2 className="text-lg font-semibold">YOLOv8</h2>
            <p className="text-sm">Object detection in images.</p>
          </div>
          <div className="flex flex-col p-4 bg-gray-200 rounded-b-md">
            <div className="relative max-w-lg">
              <div className="py-1">
                <button
                  className="text-xs text-black bg-white rounded-md disabled:opacity-50 flex gap-1 items-center ml-auto"
                  onClick={() => {
                    drawImageCanvas("");
                    setImage(null);
                    setHasImage(false);
                    if (fileInputRef && fileInputRef.value) {
                      fileInputRef.value = "";
                    }
                  }}
                >
                  <svg
                    className=""
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 13 12"
                    height="1em"
                  >
                    <path
                      d="M1.6.7 12 11.1M12 .7 1.6 11.1"
                      stroke="#2E3036"
                      strokeWidth="2"
                    />
                  </svg>
                  Clear image
                </button>
              </div>
              <div
                id="drop-area"
                className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-xl relative aspect-video w-full overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center space-y-1 text-center">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 24.3a3 3 0 0 1-1.9-.8c-.5-.5-.8-1.2-.8-1.9V2.9c0-.7.3-1.3.8-1.9.6-.5 1.2-.7 2-.7h18.6c.7 0 1.3.2 1.9.7.5.6.7 1.2.7 2v18.6c0 .7-.2 1.4-.7 1.9a3 3 0 0 1-2 .8H3.6Zm0-2.7h18.7V2.9H3.5v18.7Zm2.7-2.7h13.3c.3 0 .5 0 .6-.3v-.7l-3.7-5a.6.6 0 0 0-.6-.2c-.2 0-.4 0-.5.3l-3.5 4.6-2.4-3.3a.6.6 0 0 0-.6-.3c-.2 0-.4.1-.5.3l-2.7 3.6c-.1.2-.2.4 0 .7.1.2.3.3.6.3Z"
                      fill="#000"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-950 hover:text-blue-700"
                    >
                      <span>Drag and drop your image here</span>
                      <span className="block text-xs">or</span>
                      <span className="block text-xs">Click to upload</span>
                    </label>
                  </div>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    ref={(input) => setFileInputRef(input)}
                  />
                </div>
                <canvas
                  ref={canvasRef}
                  id="canvas"
                  className="absolute pointer-events-none w-full"
                ></canvas>
                <canvas
                  ref={canvasResultRef}
                  id="canvas-result"
                  className="absolute pointer-events-none w-full"
                ></canvas>
              </div>
            </div>
            <div className="mt-4 text-black">
              <label htmlFor="model" className="font-medium">
                Models Options:{" "}
              </label>
              <select
                id="model"
                className="border-2 border-gray-500 rounded-md text-black"
                value={modelID}
                onChange={(e) => setModelID(e.target.value)}
              >
                <option value="yolov8n">yolov8n (6.37 MB)</option>
                <option value="yolov8s">yolov8s (22.4 MB)</option>
                <option value="yolov8m">yolov8m (51.9 MB)</option>
                <option value="yolov8l">yolov8l (87.5 MB)</option>
                <option value="yolov8x">yolov8x (137 MB)</option>
                <option value="yolov8n_pose">yolov8n_pose (6.65 MB)</option>
                <option value="yolov8s_pose">yolov8s_pose (23.3 MB)</option>
                <option value="yolov8m_pose">yolov8m_pose (53 MB)</option>
                <option value="yolov8l_pose">yolov8l_pose (89.1 MB)</option>
                <option value="yolov8x_pose">yolov8x_pose (139 MB)</option>
              </select>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-3 max-w-md items-center gap-3 text-black">
                <label className="text-sm font-medium" htmlFor="confidence">
                  Confidence Threshold
                </label>
                <input
                  type="range"
                  id="confidence"
                  name="confidence"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                />
                <output className="text-xs font-light px-1 py-1 border border-gray-700 rounded-md w-min">
                  {confidence.toFixed(2)}
                </output>

                <label className="text-sm font-medium" htmlFor="iou_threshold">
                  IoU Threshold
                </label>
                <input
                  type="range"
                  id="iou_threshold"
                  name="iou_threshold"
                  min="0"
                  max="1"
                  step="0.01"
                  value={iouThreshold}
                  onChange={(e) => setIouThreshold(Number(e.target.value))}
                />
                <output className="font-extralight text-xs px-1 py-1 border border-gray-700 rounded-md w-min">
                  {iouThreshold.toFixed(2)}
                </output>
              </div>
            </div>
            <div className="mt-4">
              <button
                ref={buttonRef}
                className="bg-gray-700 hover:bg-gray-800 text-black font-normal py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleDetect}
                disabled={!hasImage || isDetecting}
              >
                Predict
              </button>
            </div>
            {generatedImage && (
              <img
                src={generatedImage}
                alt="Generated"
                className="max-w-full h-auto"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Yolo;

// pages/index.tsx
"use client"; // This is a client component 👈🏽
import React, { useRef, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import SubscribeBanner from "@/Components/SubscribeBanner";
import ModelButtons from "@/Components/ModelButton";

const Home: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const [hasImage, setHasImage] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [currentImageURL, setCurrentImageURL] = useState("");
  const [pointArr, setPointArr] = useState<[number, number, boolean][]>([]);
  const [bgPointMode, setBgPointMode] = useState(false);
  const [copyMaskURL, setCopyMaskURL] = useState<string | null>(null);
  const [copyImageURL, setCopyImageURL] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const ctxCanvasRef = useRef<CanvasRenderingContext2D | null>(null);
  const ctxMaskRef = useRef<CanvasRenderingContext2D | null>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const dropButtonsRef = useRef<HTMLDivElement>(null);
  const imagesExamplesRef = useRef<HTMLDivElement>(null);
  const modelSelectionRef = useRef<HTMLSelectElement>(null);
  const statusOutputRef = useRef<HTMLSpanElement>(null);
  const MODEL_BASEURL = "https://huggingface.co/lmz/candle-sam/resolve/main/";
  const MODELS = {
    sam_mobile_tiny: {
      url: "mobile_sam-tiny-vitt.safetensors",
    },
    sam_base: {
      url: "sam_vit_b_01ec64.safetensors",
    },
  };

  const samWorker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!samWorker.current) {
      samWorker.current = new Worker(
        new URL("../workers/segmentAnythingWorker.js", import.meta.url),
        {
          type: "module",
        }
      );
    }
    ctxCanvasRef.current = canvasRef.current.getContext("2d");
    ctxMaskRef.current = maskRef.current.getContext("2d");
  }, []);

  const segmentPoints = async (modelURL, modelID, imageURL, points) => {
    return new Promise((resolve, reject) => {
      const samWorker = new Worker(
        new URL("../workers/segmentAnythingWorker.js", import.meta.url),
        {
          type: "module",
        }
      );
      function messageHandler(event) {
        console.log(event.data);
        if ("status" in event.data) {
          updateStatus(event.data);
        }
        if ("error" in event.data) {
          samWorker.removeEventListener("message", messageHandler);
          reject(new Error(event.data.error));
        }
        if (event.data.status === "complete-embedding") {
          samWorker.removeEventListener("message", messageHandler);
          resolve();
        }
        if (event.data.status === "complete") {
          samWorker.removeEventListener("message", messageHandler);
          resolve(event.data.output);
        }
      }
      samWorker.addEventListener("message", messageHandler);
      samWorker.postMessage({
        modelURL,
        modelID,
        imageURL,
        points,
      });
    });
  };

  const updateStatus = (statusMessage) => {
    statusOutputRef.current.innerText = statusMessage.message;
  };

  const clearImageCanvas = () => {
    ctxCanvasRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    ctxMaskRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHasImage(false);
    setIsEmbedding(false);
    setIsSegmenting(false);
    setCurrentImageURL("");
    setPointArr([]);
    setCopyMaskURL(null);
    setCopyImageURL(null);
    dropButtonsRef.current.classList.remove("invisible");
  };

  const drawMask = (maskURL, points) => {
    return new Promise((resolve, reject) => {
      if (!maskURL) {
        reject(new Error("No mask URL provided"));
        return;
      }

      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      img.onload = () => {
        maskRef.current.width = canvasRef.current.width;
        maskRef.current.height = canvasRef.current.height;
        ctxMaskRef.current.save();
        ctxMaskRef.current.drawImage(canvasRef.current, 0, 0);
        ctxMaskRef.current.globalCompositeOperation = "source-atop";
        ctxMaskRef.current.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctxMaskRef.current.fillRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        ctxMaskRef.current.globalCompositeOperation = "destination-in";
        ctxMaskRef.current.drawImage(img, 0, 0);
        ctxMaskRef.current.globalCompositeOperation = "source-over";
        for (const pt of points) {
          if (pt[2]) {
            ctxMaskRef.current.fillStyle = "rgba(0, 255, 255, 1)";
          } else {
            ctxMaskRef.current.fillStyle = "rgba(255, 255, 0, 1)";
          }
          ctxMaskRef.current.beginPath();
          ctxMaskRef.current.arc(
            pt[0] * canvasRef.current.width,
            pt[1] * canvasRef.current.height,
            3,
            0,
            2 * Math.PI
          );
          ctxMaskRef.current.fill();
        }
        ctxMaskRef.current.restore();
        resolve(); // Resolve the Promise once the mask has been drawn
      };

      img.onerror = () => {
        reject(new Error("Failed to load mask image"));
      };

      img.src = maskURL;
    });
  };

  const drawImageCanvas = (imgURL) => {
    if (!imgURL) {
      throw new Error("No image URL provided");
    }

    ctxCanvasRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    ctxCanvasRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      ctxCanvasRef.current.drawImage(img, 0, 0);
      setHasImage(true);
      dropButtonsRef.current.classList.add("invisible");
    };
    img.src = imgURL;
  };

  const togglePointMode = (mode) => {
    setBgPointMode(mode === undefined ? !bgPointMode : mode);
  };

  const getSegmentationMask = async (points) => {
    const modelID = modelSelectionRef.current.value;
    const modelURL = MODEL_BASEURL + MODELS[modelID].url;
    const imageURL = currentImageURL;
    const { maskURL } = await segmentPoints(
      modelURL,
      modelID,
      imageURL,
      points
    );
    return { maskURL };
  };

  const setImageEmbeddings = async (imageURL) => {
    if (isEmbedding) {
      return;
    }
    canvasRef.current.classList.remove("cursor-pointer");
    canvasRef.current.classList.add("cursor-wait");
    const modelID = modelSelectionRef.current.value;
    const modelURL = MODEL_BASEURL + MODELS[modelID].url;
    setIsEmbedding(true);
    await segmentPoints(modelURL, modelID, imageURL);
    canvasRef.current.classList.remove("cursor-wait");
    canvasRef.current.classList.add("cursor-pointer");
    setIsEmbedding(false);
    setCurrentImageURL(imageURL);
  };

  const undoPoint = async () => {
    if (!hasImage || isEmbedding || isSegmenting) {
      return;
    }
    if (pointArr.length === 0) {
      return;
    }
    const updatedPoints = [...pointArr];
    updatedPoints.pop();
    setPointArr(updatedPoints);
    if (updatedPoints.length === 0) {
      ctxMaskRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      return;
    }
    setIsSegmenting(true);
    const { maskURL } = await getSegmentationMask(updatedPoints);
    setIsSegmenting(false);
    setCopyMaskURL(maskURL);
    await drawMask(maskURL, updatedPoints);
  };

  const handleCanvasClick = async (event) => {
    if (!hasImage || isEmbedding || isSegmenting) {
      return;
    }
    const backgroundMode = event.shiftKey
      ? bgPointMode ^ event.shiftKey
      : bgPointMode;
    const targetBox = event.target.getBoundingClientRect();
    const x = (event.clientX - targetBox.left) / targetBox.width;
    const y = (event.clientY - targetBox.top) / targetBox.height;
    const ptsToRemove = [];
    for (const [idx, pts] of pointArr.entries()) {
      const d = Math.sqrt((pts[0] - x) ** 2 + (pts[1] - y) ** 2);
      if (d < 6 / targetBox.width) {
        ptsToRemove.push(idx);
      }
    }
    let updatedPoints;
    if (ptsToRemove.length > 0) {
      updatedPoints = pointArr.filter((_, idx) => !ptsToRemove.includes(idx));
    } else {
      updatedPoints = [...pointArr, [x, y, !backgroundMode]];
    }
    setPointArr(updatedPoints);
    if (updatedPoints.length === 0) {
      ctxMaskRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      return;
    }
    setIsSegmenting(true);
    const { maskURL } = await getSegmentationMask(updatedPoints);
    setIsSegmenting(false);
    setCopyMaskURL(maskURL);
    drawMask(maskURL, updatedPoints);
  };

  const handleFileUpload = (event) => {
    const target = event.target;
    if (target.files.length > 0) {
      const href = URL.createObjectURL(target.files[0]);
      clearImageCanvas();
      setCopyImageURL(href);
      drawImageCanvas(href);
      setImageEmbeddings(href);
      togglePointMode(false);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    dropAreaRef.current.classList.add("border-blue-700");
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dropAreaRef.current.classList.remove("border-blue-700");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dropAreaRef.current.classList.remove("border-blue-700");
    const url = event.dataTransfer.getData("text/uri-list");
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const href = URL.createObjectURL(files[0]);
      clearImageCanvas();
      setCopyImageURL(href);
      drawImageCanvas(href);
      setImageEmbeddings(href);
      togglePointMode(false);
    } else if (url) {
      clearImageCanvas();
      setCopyImageURL(url);
      drawImageCanvas(url);
      setImageEmbeddings(url);
      togglePointMode(false);
    }
  };

  const handleImageExamplesClick = (event) => {
    if (isEmbedding || isSegmenting) {
      return;
    }
    const target = event.target;
    if (target.nodeName === "IMG") {
      const href = target.src;
      clearImageCanvas();
      setCopyImageURL(href);
      drawImageCanvas(href);
      setImageEmbeddings(href);
    }
  };

  const handleDownload = async () => {
    const loadImageAsync = (imageURL) => {
      return new Promise((resolve) => {
        // const img = new HTMLImageElement();
        const img = document.createElement("img");
        img.onload = () => {
          resolve(img);
        };
        img.crossOrigin = "anonymous";
        img.src = imageURL;
      });
    };
    const originalImage = await loadImageAsync(copyImageURL);
    const maskImage = await loadImageAsync(copyMaskURL);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(maskImage, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(originalImage, 0, 0);

    const blobPromise = new Promise((resolve) => {
      canvas.toBlob(resolve);
    });
    const blob = await blobPromise;
    const resultURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = resultURL;
    link.download = "cutout.png";
    link.click();
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <SubscribeBanner mailListUrl={mailListUrl} />
        <ModelButtons />
        <main className="flex-grow flex justify-center items-center">
          <div className="max-w-2xl w-full">
            <div className="bg-gray-800 text-white py-2 px-4 rounded-t-md">
              <h1 className="text-lg font-semibold flex items-center">
                Segment Anything
              </h1>
              <h2 className="text-sm">
                Segment any part of the image and cut it out.
              </h2>
            </div>
            <div className="flex flex-col p-4 bg-gray-200 rounded-b-md text-black">
              <div className="mb-4">
                <label htmlFor="model" className="block text-sm font-medium">
                  Models Options:{" "}
                </label>
                <select
                  id="model"
                  ref={modelSelectionRef}
                  defaultValue="sam_mobile_tiny"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="sam_mobile_tiny">
                    Mobile SAM Tiny (40.6 MB)
                  </option>
                  <option value="sam_base">SAM Base (375 MB)</option>
                </select>
              </div>
              <div className="mb-4 text-xs italic">
                <p>
                  <b>Note:</b> The model's first run may take a few seconds as
                  it loads and caches the model in the browser, and then creates
                  the image embeddings. Any subsequent clicks on points will be
                  significantly faster.
                </p>
              </div>
              <div className="relative mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="px-2 rounded-md inline text-xs">
                    <span
                      ref={statusOutputRef}
                      className="m-auto font-light"
                    ></span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="mask-btn"
                      title="Toggle Mask Point and Background Point"
                      className="text-xs bg-white rounded-md disabled:opacity-50 flex gap-1 items-center"
                      onClick={() => togglePointMode()}
                    >
                      <span>Mask Point</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512"
                      >
                        <path
                          id="mask-circle"
                          d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z"
                        />
                        <path
                          id="unmask-circle"
                          hidden
                          d="M464 256a208 208 0 1 0-416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1-512 0z"
                        />
                      </svg>
                    </button>
                    <button
                      id="undo-btn"
                      disabled
                      title="Undo Last Point"
                      className="text-xs bg-white rounded-md disabled:opacity-50 flex gap-1 items-center"
                      onClick={undoPoint}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512"
                      >
                        <path d="M48.5 224H40a24 24 0 0 1-24-24V72a24 24 0 0 1 41-17l41.6 41.6a224 224 0 1 1-1 317.8 32 32 0 0 1 45.3-45.3 160 160 0 1 0 1-227.3L185 183a24 24 0 0 1-17 41H48.5z" />
                      </svg>
                    </button>
                    <button
                      id="clear-btn"
                      disabled
                      title="Clear Image"
                      className="text-xs bg-white rounded-md disabled:opacity-50 flex gap-1 items-center"
                      onClick={clearImageCanvas}
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
                    </button>
                  </div>
                </div>
                <div
                  ref={dropAreaRef}
                  className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-xl relative p-20 w-full overflow-hidden"
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div
                    ref={dropButtonsRef}
                    className="flex flex-col items-center justify-center space-y-1 text-center relative z-10"
                  >
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
                      ref={fileUploadRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="absolute w-full"
                    onClick={handleCanvasClick}
                  ></canvas>
                  <canvas
                    ref={maskRef}
                    className="pointer-events-none absolute w-full"
                  ></canvas>
                </div>
                <div className="text-right py-2">
                  <button
                    id="share-btn"
                    className="bg-white rounded-md hover:outline outline-orange-200 disabled:opacity-50 invisible"
                  >
                    <Image
                      src="https://huggingface.co/datasets/huggingface/badges/raw/main/share-to-community-sm.svg"
                      alt="Share to Community"
                      width={100}
                      height={30}
                    />
                  </button>
                  <button
                    id="download-btn"
                    title="Copy result (.png)"
                    disabled={!copyMaskURL}
                    className="p-1 px-2 text-xs font-medium bg-white rounded-2xl outline outline-gray-200 hover:outline-orange-200 disabled:opacity-50"
                    onClick={handleDownload}
                  >
                    Download Cut-Out
                  </button>
                </div>
              </div>
              <div>
                <div
                  ref={imagesExamplesRef}
                  className="flex gap-3 items-center overflow-x-scroll"
                  onClick={handleImageExamplesClick}
                >
                  <h3 className="font-medium">Examples:</h3>
                  <Image
                    src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/candle/examples/sf.jpg"
                    alt="Image Example 1"
                    width={96}
                    height={96}
                    className="cursor-pointer w-24 h-24 object-cover"
                  />
                  <Image
                    src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/candle/examples/bike.jpeg"
                    alt="Image Example 2"
                    width={96}
                    height={96}
                    className="cursor-pointer w-24 h-24 object-cover"
                  />
                  <Image
                    src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/candle/examples/000000000077.jpg"
                    alt="Image Example 3"
                    width={96}
                    height={96}
                    className="cursor-pointer w-24 h-24 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Home;

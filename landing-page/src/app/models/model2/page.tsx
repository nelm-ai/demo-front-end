// pages/models/model2.tsx
"use client"; // This is a client component 👈🏽

import React, { useState } from "react";
import SubscribeBanner from "@/Components/SubscribeBanner";

const Model2: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPrompt(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
    }
  };

  const handleGenerate = () => {
    if (image) {
      const reader = new FileReader();
      reader.onload = () => {
        setGeneratedImage(reader.result as string);
      };
      reader.readAsDataURL(image);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <div className="flex-grow flex justify-center items-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800 text-white py-2 px-4 rounded-t-md">
            <h2 className="text-lg font-semibold">Model 2</h2>
            <p className="text-sm">Generate an image from your prompt</p>
          </div>
          <div className="flex flex-col p-4 bg-gray-200 rounded-b-md">
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter your prompt"
              className="mb-4 p-2 border border-gray-300 rounded text-black"
              rows={3}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-4 px-2 py-1 border border-gray-300 rounded"
            />
            <button
              onClick={handleGenerate}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 mb-4"
            >
              Generate
            </button>
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

export default Model2;

"use client"; // This is a client component 👈🏽

import React, { useState } from "react";
import Link from "next/link";
import SubscribeBanner from "@/Components/SubscribeBanner";

const TryFree: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";
  const [selectedModel, setSelectedModel] = useState("");

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <div className="flex-grow flex justify-center items-center flex-col">
        <h1 className="text-4xl font-bold mb-4">Choose model</h1>
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="mb-8 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:bg-white focus:border-black border-black text-black"
          //className="block appearance-none w-full bg-white border border-black text-black py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-black"
        >
          <option value="" disabled>
            Select a model
          </option>
          <option value="model1">Model 1</option>
          <option value="model2">Model 2</option>
          <option value="model3">Model 3</option>
        </select>
        {selectedModel && (
          <Link
            href={`/models/${selectedModel}`}
            className="bg-gray-800 text-white px-6 py-3 rounded-md text-lg hover:bg-gray-700"
          >
            View Model Details
          </Link>
        )}
        <div className="text-center">
          {/* Add your try-free page content here */}
        </div>
      </div>
    </div>
  );
};

export default TryFree;

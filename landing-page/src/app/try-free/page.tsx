// pages/try-free.tsx
import React from "react";
import Link from "next/link";
import SubscribeBanner from "@/Components/SubscribeBanner";

const TryFree: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <div className="flex-grow flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Choose Model</h1>
          <select className="block appearance-none w-full bg-white border border-black text-black py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-black">
            <option value="">Select a model</option>
            <option value="model1">Model 1</option>
            <option value="model2">Model 2</option>
            <option value="model3">Model 3</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TryFree;

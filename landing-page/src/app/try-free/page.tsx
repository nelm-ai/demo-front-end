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
      <div className="flex-grow flex justify-center items-center flex-col">
        <h1 className="text-4xl font-bold mb-8">Choose a Model</h1>
        <div className="flex gap-4 mb-8">
          <Link
            href="/models/model1"
            className="bg-gray-800 text-white px-6 py-3 rounded-md  hover:bg-gray-700 "
          >
            <div className="text-center">
              <span> Model 1</span>
            </div>
            <span className="text-sm">text-to-image</span>
          </Link>
          <Link
            href="/models/model2"
            className="bg-gray-800 text-white px-6 py-3 rounded-md  hover:bg-gray-700"
          >
            <div className="text-center">Model 2</div>
            <span className="text-sm">text-to-img</span>
          </Link>
        </div>
        <div className="text-center">
          {/* Add your try-free page content here */}
        </div>
      </div>
    </div>
  );
};

export default TryFree;

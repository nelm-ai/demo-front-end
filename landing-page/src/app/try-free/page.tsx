// pages/try-free.tsx
import React from "react";
import SubscribeBanner from "@/Components/SubscribeBanner";

const TryFree: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";

  return (
    <div className="min-h-screen flex flex-col">
      <SubscribeBanner mailListUrl={mailListUrl} />
      <div className="flex-grow flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Try Our Product for Free</h1>
          {/* Add your try-free page content here */}
        </div>
      </div>
    </div>
  );
};

export default TryFree;

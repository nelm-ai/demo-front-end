import React from "react";
import Link from "next/link";
import SubscribeBanner from "../Components/SubscribeBanner";
import WaveAnimation from "@/Components/WaveLength";
const Home: React.FC = () => {
  const mailListUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link";

  return (
    // <div style={{ position: "relative" }}>

    <div className="min-h-screen flex flex-col">
      <WaveAnimation />
      <SubscribeBanner mailListUrl={mailListUrl} />
      <main className="flex-grow flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-2">NELM</h1>
        <p className="text-lg mb-8">Bring Dark Compute to Light</p>
        <Link
          href="/try-free"
          className="bg-gray-800 text-white px-6 py-3 rounded-md text-lg hover:bg-gray-700 mb-14"
        >
          Try for Free
        </Link>
        <p className="text-base mb-4">
          At NELM, we pool compute resources from all over the world.
        </p>
      </main>
    </div>
    // </div>
  );
};

export default Home;

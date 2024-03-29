import React from "react";
import Link from "next/link";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className=" py-4 px-6 flex justify-end">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScDUUi878bC2WxMHkMmNm5_T-CZNuHK1zQeYoihjYlIlQhnBg/viewform?usp=sf_link"
          className="text-white hover:text-gray-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe to NELM Mailing List
        </a>
      </header>
      <main className="flex-grow flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-2">NELM</h1>
        <p className="text-lg mb-8">Bring Dark Compute to Light</p>
        <Link
          href="/try-free"
          className="bg-gray-800 text-white px-6 py-3 rounded-md text-lg hover:bg-gray-700"
        >
          Try for Free
        </Link>
      </main>
    </div>
  );
};

export default Home;

// components/SubscribeBanner.tsx
import React from "react";

interface SubscribeBannerProps {
  mailListUrl: string;
}

const SubscribeBanner: React.FC<SubscribeBannerProps> = ({ mailListUrl }) => {
  return (
    <header className=" py-4 px-6 flex justify-end">
      <a
        href={mailListUrl}
        className="text-white hover:text-gray-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        Subscribe to NELM Mailing List
      </a>
    </header>
  );
};

export default SubscribeBanner;

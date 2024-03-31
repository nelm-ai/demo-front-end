import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ModelButtons = () => {
  const pathname = usePathname();
  const router = useRouter();

  const getButtonStyle = (path) => {
    return pathname === path
      ? "bg-gray-600 text-white px-4 py-2 rounded mr-4 hover:bg-gray-500"
      : "bg-gray-800 text-white px-4 py-2 rounded mr-4 hover:bg-gray-700";
  };

  return (
    <div className="flex justify-center mt-4">
      <Link href="/models/model1">
        <button className={getButtonStyle("/models/model1")}>Model 1</button>
      </Link>
      <Link href="/models/model2">
        <button className={getButtonStyle("/models/model2")}>Model 2</button>
      </Link>
    </div>
  );
};

export default ModelButtons;

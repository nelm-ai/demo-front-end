import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ModelButtons = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-center mt-4 space-x-4">
      <Link href="/models/model1">
        <button
          className={`bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === "/models/model1" ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={pathname === "/models/model1"}
        >
          Model 1
        </button>
      </Link>
      <Link href="/models/model2">
        <button
          className={`bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === "/models/model2" ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={pathname === "/models/model2"}
        >
          Model 2
        </button>
      </Link>
      <Link href="/phi">
        <button
          className={`bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === "/phi" ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={pathname === "/phi"}
        >
          Phi
        </button>
      </Link>
      <Link href="/petals">
        <button
          className={`bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === "/petals" ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={pathname === "/petals"}
        >
          Petals
        </button>
      </Link>
    </div>
  );
};

export default ModelButtons;

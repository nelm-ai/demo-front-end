import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ModelButtons = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-center mt-4 space-x-4">
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
      <Link href="/yolo">
        <button
          className={`bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === "/yolo" ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={pathname === "/yolo"}
        >
          Yolo
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
      <Link href="/segmentAnything">
        <button
          className={`bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === "/segmentAnything"
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
          disabled={pathname === "/segmentAnything"}
        >
          Segment Anything
        </button>
      </Link>
    </div>
  );
};

export default ModelButtons;

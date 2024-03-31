import React from "react";
import Link from "next/link";

const ModelButtons = () => {
  return (
    <div className="flex justify-center mt-4">
      <Link href="/models/model1">
        <button className="bg-gray-800 text-white px-4 py-2 rounded mr-4 hover:bg-gray-700">
          Model 1
        </button>
      </Link>
      <Link href="/models/model2">
        <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
          Model 2
        </button>
      </Link>
    </div>
  );
};

export default ModelButtons;

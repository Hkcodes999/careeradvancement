import React from "react";
import { FiLoader } from "react-icons/fi";

const GlobalLoader = () => {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#00171F] flex items-center justify-center">
      <FiLoader className="animate-spin text-[#00A8E8]" size={48} />
    </div>
  );
};

export default GlobalLoader;

import React from "react";

export function Button({ children, className = "", variant = "default", ...props }) {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-400 text-gray-800 bg-white hover:bg-gray-100",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      className={`px-4 py-2 rounded ${variants[variant] || ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


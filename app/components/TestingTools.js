"use client";

import { useState, useEffect } from "react";

export default function TestingTools() {
  const [testMode, setTestMode] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if test mode is enabled
    const storedTestMode = localStorage.getItem("useTestMode") === "true";
    setTestMode(storedTestMode);
  }, []);

  const toggleTestMode = () => {
    const newMode = !testMode;
    localStorage.setItem("useTestMode", newMode.toString());
    setTestMode(newMode);
    setMessage(
      `Test mode ${newMode ? "enabled" : "disabled"}. Payments will ${
        newMode ? "bypass" : "use"
      } Stripe checkout.`
    );
  };

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development mode
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="text-lg font-bold mb-2">Developer Tools</h3>

      <div className="flex items-center mb-2">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={testMode}
              onChange={toggleTestMode}
            />
            <div
              className={`w-10 h-5 ${
                testMode ? "bg-green-500" : "bg-gray-600"
              } rounded-full shadow-inner transition-colors`}
            ></div>
            <div
              className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                testMode ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </div>
          <div className="ml-3 text-sm">Test Payment Mode</div>
        </label>
      </div>

      {message && <div className="text-xs mt-2 text-green-300">{message}</div>}

      <div className="text-xs mt-2 text-gray-400">
        {testMode
          ? "Payments will bypass Stripe and update user directly"
          : "Payments will go through Stripe Checkout"}
      </div>
    </div>
  );
}

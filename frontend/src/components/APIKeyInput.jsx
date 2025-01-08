import React, {useState} from "react";
import { Input } from '@/components/ui/input';
import {EyeIcon, EyeOffIcon} from "lucide-react";

export default function APIKeyInput({ value, onChange }) {
  const [showKey, setShowKey] = useState(false);

  const toggleVisibility = () => {
    setShowKey(!showKey);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        API Key
      </label>
      <div className="relative">
        <Input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          placeholder="Enter your Groq API key"
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showKey ? (
            <EyeOffIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
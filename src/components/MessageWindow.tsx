import React, { useState } from "react";

interface MessageWindowProps {
  targetInstance: string;
  onClose: () => void;
  onSend: (code: string) => void;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({
  targetInstance,
  onClose,
  onSend,
}) => {
  const [code, setCode] = useState("");

  const handleSend = () => {
    onSend(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-[90vw] p-6">
        <div className="mb-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSend}
            disabled={!code.trim()}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

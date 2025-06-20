import React, { useState } from 'react';

interface MessageWindowProps {
  targetInstance: string;
  onClose: () => void;
  onSend: (code: string) => void;
}

export const MessageWindow: React.FC<MessageWindowProps> = ({
  targetInstance,
  onClose,
  onSend
}) => {
  const [code, setCode] = useState('');

  const handleSend = () => {
    onSend(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-[90vw] p-6">
        <h2 className="text-lg font-semibold mb-4">
          Send Message to {targetInstance}
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objax Code (it = {targetInstance})
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Objax code here...
Example: set field 'title' of it to 'Hello'"
            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
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
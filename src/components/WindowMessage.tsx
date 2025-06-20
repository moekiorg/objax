import React, { useState } from 'react';

interface WindowMessageProps {
  targetInstance: string;
  onSend: (code: string) => void;
}

export const WindowMessage: React.FC<WindowMessageProps> = ({
  targetInstance,
  onSend
}) => {
  const [code, setCode] = useState('');

  const handleSend = () => {
    onSend(code);
  };

  return (
    <div className="window-message" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '12px' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objax Code (it = {targetInstance})
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Objax code here...
Example: set field 'title' of it to 'Hello'"
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ flex: 1, minHeight: '100px' }}
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
  );
};
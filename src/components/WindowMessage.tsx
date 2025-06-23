import React, { useState } from "react";

interface WindowMessageProps {
  targetInstance: string;
  onSend: (code: string) => void;
}

export const WindowMessage: React.FC<WindowMessageProps> = ({
  targetInstance,
  onSend,
}) => {
  const [code, setCode] = useState("");

  const handleSend = () => {
    onSend(code);
    setCode(""); // Clear after sending
  };

  const isDisabled = !code || code.trim().length === 0;

  return (
    <div
      className="window-message"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          marginBottom: "12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            flex: 1,
            minHeight: "100px",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            resize: "none",
            outline: "none",
            fontFamily: "monospace",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          onClick={handleSend}
          disabled={isDisabled}
          style={{
            padding: "8px 16px",
            backgroundColor: isDisabled ? "#9ca3af" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

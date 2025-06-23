import { useState } from "react";

interface ClassMessageWindowProps {
  className: string;
  onSend: (className: string, message: string) => void;
}

export function ClassMessageWindow({
  className,
  onSend,
}: ClassMessageWindowProps) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(className, message);
      setHistory((prev) => [...prev, message]);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="class-message-window">
      <div className="class-message-content">
        <div className="class-message-input-area">
          <textarea
            className="class-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
          />
          <div className="class-message-input-footer">
            <button
              type="button"
              className="class-message-send-btn"
              onClick={handleSend}
              disabled={!message.trim()}
            >
              送信
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="class-message-history">
          <div className="class-message-history-title">送信履歴:</div>
          <div className="class-message-history-list">
            {history.slice(-5).map((msg, index) => (
              <div key={`msg-${index}-${msg.slice(0,10)}`} className="class-message-history-item">
                <code>{msg}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

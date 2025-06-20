import { useObjaxStore } from '../stores/objaxStore';

interface Instance {
  id: string;
  name: string;
  className: string;
  page: string;
  [key: string]: any;
}

interface InstanceBrowserProps {
  pageName: string;
  instances: Instance[];
  onInspect?: (instance: Instance) => void;
  onMessage?: (instance: Instance) => void;
}

export function InstanceBrowser({ pageName, instances, onInspect, onMessage }: InstanceBrowserProps) {
  const pageInstances = instances.filter(instance => instance.page === pageName);

  const handleInspect = (instance: Instance) => {
    if (onInspect) {
      onInspect(instance);
    }
  };

  const handleMessage = (instance: Instance, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering inspect when clicking message button
    if (onMessage) {
      onMessage(instance);
    }
  };

  return (
    <div className="instance-browser">
      <div className="instance-browser-header">
        <h3>ページ: {pageName}</h3>
      </div>
      
      <div className="instance-browser-content">
        {pageInstances.length === 0 ? (
          <div className="instance-browser-empty">
            このページにインスタンスはありません
          </div>
        ) : (
          <div className="instance-browser-list">
            {pageInstances.map(instance => (
              <div 
                key={instance.id} 
                className="instance-browser-item"
                style={{ cursor: 'default' }}
              >
                <div className="instance-browser-item-header">
                  <div className="instance-browser-item-name">{instance.name}</div>
                  <div className="instance-browser-item-type">{instance.className}</div>
                </div>
                <div className="instance-browser-item-actions" style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleInspect(instance)}
                    className="instance-browser-inspect-btn"
                    style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="インスペクターを開く"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={(e) => handleMessage(instance, e)}
                    className="instance-browser-message-btn"
                    style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      backgroundColor: '#007ACC',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="メッセージを送る"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
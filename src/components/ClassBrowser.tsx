import { useState } from 'react';
import type { ObjaxClass } from '../types';

interface ClassBrowserProps {
  classes: ObjaxClass[];
}

export function ClassBrowser({ classes }: ClassBrowserProps) {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const toggleClass = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className);
  };
  return (
    <div className="page-editor-panel">
      <h2 className="page-editor-panel-title">クラスブラウザ</h2>
      
      {classes.length === 0 ? (
        <p className="class-browser-empty">まだクラスが定義されていません。Objaxコードでクラスを定義するとここに表示されます。</p>
      ) : (
        <div className="class-browser-items">
          {classes.map((cls) => {
            const isExpanded = expandedClass === cls.name;
            
            return (
              <div key={cls.name} className="class-browser-item">
                <div 
                  className="class-browser-item-header"
                  onClick={() => toggleClass(cls.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleClass(cls.name);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="class-browser-item-header-content">
                    <h3 className="class-browser-item-title">{cls.name}</h3>
                    <div className="class-browser-item-meta">
                      <span className="class-browser-item-count">
                        {cls.fields.length}個のフィールド, {cls.methods.length}個のメソッド
                      </span>
                      <span className={`class-browser-item-arrow ${isExpanded ? 'expanded' : ''}`}>
                        ▶
                      </span>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="class-browser-item-details">
                    <div className="class-browser-item-details-grid">
                      <div>
                        <h4 className="class-browser-section-title">フィールド</h4>
                        {cls.fields.length === 0 ? (
                          <p className="class-browser-section-empty">フィールドなし</p>
                        ) : (
                          <ul className="class-browser-field-list">
                            {cls.fields.map((field) => (
                              <li key={field.name} className="class-browser-field-item">
                                <span className="class-browser-field-name">{field.name}</span>
                                {field.default !== undefined && (
                                  <span className="class-browser-field-default"> = {String(field.default)}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="class-browser-section-title">メソッド</h4>
                        {cls.methods.length === 0 ? (
                          <p className="class-browser-section-empty">メソッドなし</p>
                        ) : (
                          <ul className="class-browser-method-list">
                            {cls.methods.map((method) => (
                              <li key={method.name} className="class-browser-method-item">
                                <span className="class-browser-method-name">{method.name}()</span>
                                {method.body && (
                                  <div className="class-browser-method-body">
                                    {method.body}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
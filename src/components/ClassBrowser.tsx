import type { ObjaxClass } from "../types";

interface ClassBrowserProps {
  classes: ObjaxClass[];
  onClassClick: (className: string) => void;
}

export function ClassBrowser({ classes, onClassClick }: ClassBrowserProps) {
  return (
    <div className="page-editor-panel">
      {classes.length === 0 ? (
        <p className="class-browser-empty">
          まだクラスが定義されていません。Objaxコードでクラスを定義するとここに表示されます。
        </p>
      ) : (
        <div className="class-browser-items">
          {classes.map((cls) => (
            <div key={cls.name} className="class-browser-item">
              <div
                className="class-browser-item-header-content"
                onClick={() => onClassClick(cls.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onClassClick(cls.name);
                  }
                }}
              >
                <h3 className="class-browser-item-title">{cls.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

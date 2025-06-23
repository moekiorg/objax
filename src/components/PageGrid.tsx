import { useObjaxStore } from "../stores/objaxStore";

export function PageGrid() {
  const { pages, setCurrentPageWithHistory, addPage } = useObjaxStore();

  return (
    <div className="page-grid">
      <div className="page-grid-container">
        {pages.length === 0 ? (
          <div className="page-grid-empty">
            <p className="page-grid-empty-text">
              まだページが作成されていません
            </p>
            <button
              type="button"
              onClick={() => {
                const pageName = prompt("ページ名を入力してください:");
                if (pageName) {
                  addPage({ name: pageName.trim() });
                }
              }}
              className="btn-primary"
            >
              最初のページを作成
            </button>
          </div>
        ) : (
          <>
            <div className="page-create">
              <button
                type="button"
                onClick={() => {
                  const pageName = prompt("ページ名を入力してください:");
                  if (pageName) {
                    addPage({ name: pageName.trim() });
                  }
                }}
                className="btn-success"
              >
                新しいページを追加
              </button>
            </div>
            <div className="page-grid-items">
              {pages.map((page) => (
                <button
                  key={page.name}
                  onClick={() => setCurrentPageWithHistory(page.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setCurrentPageWithHistory(page.name);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="page-grid-item"
                >
                  {page.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

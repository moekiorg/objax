import { useObjaxStore } from '../stores/objaxStore';

export function PageGrid() {
  const { pages, setCurrentPageWithHistory, addPage } = useObjaxStore();

  return (
    <div className="page-grid">
      <div className="page-grid-container">
        <h1 className="page-grid-title">Objax ページ</h1>

        {pages.length === 0 ? (
          <div className="page-grid-empty">
            <p className="page-grid-empty-text">まだページが作成されていません</p>
            <button
              type="button"
              onClick={() => {
                const pageName = prompt('ページ名を入力してください:');
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
            <div className="page-grid-items">
              {pages.map((page) => (
                <div
                  key={page.name}
                  onClick={() => setCurrentPageWithHistory(page.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setCurrentPageWithHistory(page.name);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="page-grid-item"
                >
                  <h2 className="page-grid-item-title">
                    {page.name}
                  </h2>
                  <p className="page-grid-item-subtitle">クリックしてページを開く</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => {
                  const pageName = prompt('ページ名を入力してください:');
                  if (pageName) {
                    addPage({ name: pageName.trim() });
                  }
                }}
                className="btn-success"
              >
                新しいページを追加
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

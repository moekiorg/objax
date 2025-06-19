import { useObjaxStore } from '../stores/objaxStore';

export function PageGrid() {
  const { pages, setCurrentPage } = useObjaxStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Objax Pages</h1>

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No pages created yet</p>
            <button
              onClick={() => {
                // TODO: Add new page dialog
                console.log('Add new page');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create First Page
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pages.map((page) => (
              <div
                key={page.name}
                onClick={() => setCurrentPage(page.name)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {page.name}
                </h2>
                <p className="text-gray-600 text-sm">Click to open page</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { PageGrid } from './components/PageGrid';
import { useObjaxStore } from './stores/objaxStore';

function App() {
  const { currentPage } = useObjaxStore();

  if (currentPage) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold">Page: {currentPage}</h1>
          <p className="text-gray-600">Page editor will be implemented here</p>
          <button
            onClick={() => useObjaxStore.getState().setCurrentPage(null)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  return <PageGrid />;
}

export default App;

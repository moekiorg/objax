import { useEffect } from 'react';
import { PageGrid } from './components/PageGrid';
import { CanvasView } from './components/CanvasView';
import { useObjaxStore } from './stores/objaxStore';

function App() {
  const { currentPage, setCurrentPage } = useObjaxStore();

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || null;
      console.log('Browser navigation detected, switching to page:', page);
      setCurrentPage(page);
    };

    // Initialize page from URL on first load
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = urlParams.get('page');
    if (pageFromUrl && pageFromUrl !== currentPage) {
      console.log('Initializing page from URL:', pageFromUrl);
      setCurrentPage(pageFromUrl);
    }

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setCurrentPage, currentPage]);

  if (currentPage) {
    return <CanvasView pageName={currentPage} />;
  }

  return <PageGrid />;
}

export default App;

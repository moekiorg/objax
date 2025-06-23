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

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setCurrentPage]);

  // Separate effect for URL initialization (only run once)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = urlParams.get('page');
    if (pageFromUrl) {
      console.log('Initializing page from URL:', pageFromUrl);
      setCurrentPage(pageFromUrl);
    }
  }, []); // Empty dependency array - only run once on mount

  if (currentPage) {
    return <CanvasView pageName={currentPage} />;
  }

  return <PageGrid />;
}

export default App;

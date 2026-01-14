import { useState, useEffect } from 'react';
import { Study } from './components/Study';
import { CardManagement } from './components/CardManagement';
import { DeckSelection } from './components/DeckSelection';
import { setSelectedDeck, clearSelectedDeck, DeckId, getDeckInfo } from './utils/deckStorage';

type Route = 
  | { type: 'deck-selection' }
  | { type: 'study'; deckId: DeckId }
  | { type: 'manage'; deckId: DeckId };

/**
 * Parse the current URL path into a route
 */
function parseRoute(pathname: string): Route {
  const path = pathname.trim() || '/';
  
  if (path === '/' || path === '') {
    return { type: 'deck-selection' };
  }

  // Match /study/:deckId or /manage/:deckId
  const studyMatch = path.match(/^\/study\/(aidd|aiddgen)$/);
  if (studyMatch) {
    return { type: 'study', deckId: studyMatch[1] as DeckId };
  }

  const manageMatch = path.match(/^\/manage\/(aidd|aiddgen)$/);
  if (manageMatch) {
    return { type: 'manage', deckId: manageMatch[1] as DeckId };
  }

  // Default to deck selection for unknown paths
  return { type: 'deck-selection' };
}

/**
 * Get the URL path for a route
 */
function getRoutePath(route: Route): string {
  if (route.type === 'deck-selection') {
    return '/';
  } else if (route.type === 'study') {
    return `/study/${route.deckId}`;
  } else {
    return `/manage/${route.deckId}`;
  }
}

function App() {
  const [route, setRouteState] = useState<Route>(() => parseRoute(window.location.pathname));

  // Sync localStorage with initial URL on mount
  useEffect(() => {
    const initialRoute = parseRoute(window.location.pathname);
    if (initialRoute.type !== 'deck-selection') {
      setSelectedDeck(initialRoute.deckId);
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const updateRouteFromURL = () => {
      const newRoute = parseRoute(window.location.pathname);
      setRouteState(newRoute);
      // Sync selected deck in localStorage when route has a deck
      if (newRoute.type !== 'deck-selection') {
        setSelectedDeck(newRoute.deckId);
      } else {
        clearSelectedDeck();
      }
    };

    window.addEventListener('popstate', updateRouteFromURL);

    return () => {
      window.removeEventListener('popstate', updateRouteFromURL);
    };
  }, []);

  // Navigate to a route and update browser history
  const navigate = (newRoute: Route, replace = false) => {
    const path = getRoutePath(newRoute);
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    setRouteState(newRoute);
  };

  const handleDeckSelect = (deckId: DeckId) => {
    setSelectedDeck(deckId);
    navigate({ type: 'study', deckId });
  };

  const handleDeckSwitch = () => {
    clearSelectedDeck();
    navigate({ type: 'deck-selection' });
  };

  const handleViewSwitch = (view: 'study' | 'management', deckId: DeckId) => {
    if (view === 'study') {
      navigate({ type: 'study', deckId });
    } else {
      navigate({ type: 'manage', deckId });
    }
  };

  // Show deck selection if route is deck-selection
  if (route.type === 'deck-selection') {
    return (
      <div>
        <header style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <h1>Aiddgen Flashcard App</h1>
          <p>Learn with spaced repetition</p>
        </header>
        <main>
          <DeckSelection onDeckSelect={handleDeckSelect} />
        </main>
      </div>
    );
  }

  const deckId = route.deckId;
  const deckInfo = getDeckInfo(deckId);
  const currentView = route.type === 'study' ? 'study' : 'management';

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1>Aiddgen Flashcard App</h1>
        <p>Studying: {deckInfo.name}</p>
        <nav style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => handleViewSwitch('study', deckId)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentView === 'study' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Study
          </button>
          <button
            onClick={() => handleViewSwitch('management', deckId)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentView === 'management' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Manage Cards
          </button>
          <button
            onClick={handleDeckSwitch}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              marginLeft: '1rem',
            }}
            title="Switch to a different deck"
          >
            Switch Deck
          </button>
        </nav>
      </header>
      <main>
        {currentView === 'study' ? (
          <Study deckId={deckId} />
        ) : (
          <CardManagement deckId={deckId} />
        )}
      </main>
    </div>
  );
}

export default App;

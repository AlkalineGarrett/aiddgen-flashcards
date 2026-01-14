import { useState, useEffect } from 'react';
import { Study } from './components/Study';
import { CardManagement } from './components/CardManagement';
import { useCardStorage } from './utils/useStorage';
import { generateAiddgenFlashcards } from './utils/flashcardGenerator';

type View = 'study' | 'management';

function App() {
  const { cards, setAllCards, isLoading } = useCardStorage();
  const [view, setView] = useState<View>('study');

  // Initialize cards if none exist
  useEffect(() => {
    if (!isLoading && cards.length === 0) {
      const initialCards = generateAiddgenFlashcards();
      setAllCards(initialCards);
    }
  }, [cards.length, isLoading, setAllCards]);

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1>Aiddgen Flashcard App</h1>
        <p>Learn aiddgen/ with spaced repetition</p>
        <nav style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => setView('study')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'study' ? '#007bff' : '#6c757d',
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
            onClick={() => setView('management')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'management' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Manage Cards
          </button>
        </nav>
      </header>
      <main>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : view === 'study' ? (
          <Study />
        ) : (
          <CardManagement />
        )}
      </main>
    </div>
  );
}

export default App;

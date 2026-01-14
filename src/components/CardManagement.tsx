import { useState, useMemo } from 'react';
import { Card } from '../types/card';
import { useCardStorage } from '../utils/useStorage';
import { createInitialCardState } from '../utils/fsrs';
import { getCardStatus, getStatusColor, getStatusLabel, filterCardsByStatus, filterCardsByTag, searchCards } from '../utils/cardStatus';
import { getAvailableTags } from '../utils/flashcardGenerator';
import { calculateStatistics } from '../utils/statistics';
import { CardList } from './CardList';
import { CardDetail } from './CardDetail';
import { Statistics } from './Statistics';
import { Filters } from './Filters';

type View = 'list' | 'detail';

export function CardManagement() {
  const { cards, updateCard, removeCard, isLoading } = useCardStorage();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learning' | 'review' | 'mastered'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const availableTags = useMemo(() => getAvailableTags(), []);

  // Filter cards
  const filteredCards = useMemo(() => {
    let result = cards;
    result = filterCardsByStatus(result, statusFilter);
    result = filterCardsByTag(result, tagFilter);
    result = searchCards(result, searchText);
    return result;
  }, [cards, statusFilter, tagFilter, searchText]);

  const statistics = useMemo(() => calculateStatistics(cards), [cards]);

  const selectedCard = selectedCardId
    ? cards.find((c) => c.id === selectedCardId)
    : null;

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
    setView('detail');
  };

  const handleResetCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const resetCard: Card = {
      ...card,
      state: createInitialCardState(),
    };
    updateCard(resetCard);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedCardId(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (view === 'detail' && selectedCard) {
    return (
      <CardDetail
        card={selectedCard}
        onBack={handleBackToList}
        onReset={() => handleResetCard(selectedCard.id)}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Card Management</h2>
        <Statistics stats={statistics} />
      </div>

      <Filters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        tagFilter={tagFilter}
        onTagChange={setTagFilter}
        availableTags={availableTags}
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      <div style={{ marginTop: '1rem' }}>
        <CardList
          cards={filteredCards}
          onCardSelect={handleCardSelect}
        />
      </div>
    </div>
  );
}


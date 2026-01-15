import { useState, useMemo, useEffect } from 'react';
import { Card } from '../types/card';
import { useCardStorage } from '../utils/useStorage';
import { createInitialCardState } from '../utils/fsrs';
import { filterCardsByStatus, filterCardsByTag, searchCards } from '../utils/cardStatus';
import { getAvailableTags } from '../utils/flashcardGenerator';
import { calculateStatistics } from '../utils/statistics';
import { CardList } from './CardList';
import { CardDetail } from './CardDetail';
import { Statistics } from './Statistics';
import { Filters } from './Filters';
import { DeckId, getDeckInfo } from '../utils/deckStorage';
import './components.css';

type View = 'list' | 'detail';

interface CardManagementProps {
  deckId: DeckId;
}

export function CardManagement({ deckId }: CardManagementProps) {
  const { cards, updateCard, removeCard, isLoading } = useCardStorage(deckId);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learning' | 'review' | 'mastered'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const deckInfo = useMemo(() => getDeckInfo(deckId), [deckId]);
  const availableTags = useMemo(() => getAvailableTags(deckId), [deckId]);

  // Reset filters and selection when deck changes
  useEffect(() => {
    setSelectedCardId(null);
    setView('list');
    setStatusFilter('all');
    setTagFilter('all');
    setSearchText('');
  }, [deckId]);

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
    <div className="card-management-container">
      <div className="card-management-header">
        <div className="card-management-title-row">
          <h2 className="card-management-title">Card Management</h2>
          <span className="card-management-deck-name">
            ({deckInfo.name})
          </span>
        </div>
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

      <div className="card-management-list">
        <CardList
          cards={filteredCards}
          onCardSelect={handleCardSelect}
        />
      </div>
    </div>
  );
}


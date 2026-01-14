import { useState, useEffect, useMemo } from 'react';
import { Card, ReviewQuality } from '../types/card';
import { useCardStorage } from '../utils/useStorage';
import { updateCardState } from '../utils/fsrs';
import {
  buildReviewQueue,
  loadQueueConfig,
  incrementNewCardsStudied,
  getQueueStats,
} from '../utils/reviewQueue';
import { CardDisplay } from './CardDisplay';
import { RatingButtons } from './RatingButtons';
import { StudyStats } from './StudyStats';
import { StudySettings } from './StudySettings';

interface StudySession {
  startTime: number;
  cardsReviewed: number;
  timeSpent: number; // in seconds
}

export function Study() {
  const { cards, updateCard, isLoading } = useCardStorage();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Build review queue with proper prioritization and daily limits
  const queue = useMemo(() => {
    if (isLoading) return null;
    return buildReviewQueue(cards);
  }, [cards, isLoading]);

  const queueConfig = useMemo(() => loadQueueConfig(), []);
  const queueStats = useMemo(() => {
    if (!queue) return null;
    return getQueueStats(queue, queueConfig);
  }, [queue, queueConfig]);

  const dueCards = queue?.allCards || [];

  // Initialize session when starting
  useEffect(() => {
    if (!isLoading && dueCards.length > 0 && !session) {
      setSession({
        startTime: Date.now(),
        cardsReviewed: 0,
        timeSpent: 0,
      });
    }
  }, [dueCards.length, isLoading, session]);

  // Update session time
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      setSession((prev) => prev ? { ...prev, timeSpent: elapsed } : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Reset index if out of bounds
  useEffect(() => {
    if (dueCards.length > 0 && currentCardIndex >= dueCards.length) {
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  }, [dueCards.length, currentCardIndex]);

  const currentCard = dueCards[currentCardIndex];

  const handleRating = (quality: ReviewQuality) => {
    if (!currentCard) return;

    // Track if this was a new card
    const wasNewCard = currentCard.state.reviewCount === 0;

    // Update card state using FSRS (this updates next review date)
    const result = updateCardState(currentCard, quality);
    updateCard(result.card);

    // Increment new cards studied if applicable
    if (wasNewCard) {
      incrementNewCardsStudied();
    }

    // Update session stats
    setSession((prev) =>
      prev
        ? {
            ...prev,
            cardsReviewed: prev.cardsReviewed + 1,
          }
        : null
    );

    // Move to next card
    setShowAnswer(false);
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Finished all cards in current queue, reset to start
      // The queue will recalculate on next render
      setCurrentCardIndex(0);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (dueCards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>🎉 All Done!</h2>
        <p>No cards are due for review right now.</p>
        {session && (
          <div style={{ marginTop: '1rem' }}>
            <StudyStats session={session} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {showSettings && <StudySettings onClose={() => setShowSettings(false)} />}
      
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>Card {currentCardIndex + 1} of {dueCards.length}</strong>
          {queueStats && (
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              New: {queueStats.newCardsInQueue} | Review: {queueStats.reviewCardsInQueue}
              {queueStats.remainingNewCardSlots > 0 && (
                <span> | {queueStats.remainingNewCardSlots} new slots remaining</span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {session && <StudyStats session={session} />}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
            title="Study Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {currentCard && (
        <>
          <CardDisplay
            card={currentCard}
            showAnswer={showAnswer}
            onShowAnswer={() => setShowAnswer(true)}
          />

          {showAnswer && (
            <div style={{ marginTop: '2rem' }}>
              <RatingButtons onRate={handleRating} />
            </div>
          )}
        </>
      )}
    </div>
  );
}


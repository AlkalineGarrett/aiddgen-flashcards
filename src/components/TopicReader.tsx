import { useState, useEffect, useMemo } from 'react';
import { generateTopicContent } from '../utils/topicContent';
import { useCardStorage } from '../utils/useStorage';
import { DeckId, getDeckInfo } from '../utils/deckStorage';
import { Topic } from '../types/topic';
import {
  getConfirmedTopics,
  confirmTopic,
  isTopicConfirmed,
  getCardsForTopic,
} from '../utils/topicConfirmation';

interface TopicReaderProps {
  deckId: DeckId;
}

export function TopicReader({ deckId }: TopicReaderProps) {
  const { cards, isLoading, addCard } = useCardStorage(deckId);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [readTopics, setReadTopics] = useState<Set<string>>(new Set());
  const [confirmedTopics, setConfirmedTopics] = useState<Set<string>>(new Set());
  const [lastAddedCount, setLastAddedCount] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const deckInfo = useMemo(() => getDeckInfo(deckId), [deckId]);

  // Load topic content (only topics with cards not yet in storage)
  const topicContent = useMemo(() => {
    if (isLoading) return null;
    return generateTopicContent(deckId, cards);
  }, [deckId, cards, isLoading]);

  // Load read topics from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`read-topics-${deckId}`);
    if (stored) {
      try {
        const readTopicsArray = JSON.parse(stored) as string[];
        setReadTopics(new Set(readTopicsArray));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [deckId]);

  // Load confirmed topics from localStorage on mount
  useEffect(() => {
    const confirmed = getConfirmedTopics(deckId);
    setConfirmedTopics(confirmed);
  }, [deckId]);

  // Resume from last read topic
  useEffect(() => {
    if (!topicContent || topicContent.topics.length === 0) return;
    
    const lastTopicId = localStorage.getItem(`last-read-topic-${deckId}`);
    if (lastTopicId) {
      const topicIndex = topicContent.topics.findIndex((t) => t.id === lastTopicId);
      if (topicIndex !== -1) {
        setCurrentTopicIndex(topicIndex);
      }
    }
  }, [topicContent, deckId]);

  // Save read topics to localStorage
  useEffect(() => {
    if (readTopics.size > 0) {
      localStorage.setItem(
        `read-topics-${deckId}`,
        JSON.stringify(Array.from(readTopics))
      );
    }
  }, [readTopics, deckId]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setLastAddedCount(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const currentTopic: Topic | null = topicContent?.topics[currentTopicIndex] || null;

  const handleMarkAsRead = () => {
    if (currentTopic) {
      setReadTopics((prev) => new Set([...prev, currentTopic.id]));
      // Save last read topic
      localStorage.setItem(`last-read-topic-${deckId}`, currentTopic.id);
    }
  };

  const handleConfirmAndAddFlashcards = () => {
    if (!currentTopic) return;

    // Get cards for this topic that don't already exist
    const cardsToAdd = getCardsForTopic(deckId, currentTopic.id, cards);
    
    if (cardsToAdd.length === 0) {
      // No new cards to add, just confirm the topic
      confirmTopic(deckId, currentTopic.id);
      setConfirmedTopics((prev) => new Set([...prev, currentTopic.id]));
      // Save last read topic
      localStorage.setItem(`last-read-topic-${deckId}`, currentTopic.id);
      return;
    }

    // Add all cards
    cardsToAdd.forEach((card) => {
      addCard(card);
    });

    // Confirm the topic
    confirmTopic(deckId, currentTopic.id);
    setConfirmedTopics((prev) => new Set([...prev, currentTopic.id]));

    // Save last read topic
    localStorage.setItem(`last-read-topic-${deckId}`, currentTopic.id);

    // Show success feedback
    setLastAddedCount(cardsToAdd.length);
    setShowSuccessMessage(true);
  };

  const handleNext = () => {
    if (topicContent && currentTopicIndex < topicContent.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      setCurrentTopicIndex(nextIndex);
      // Update last read topic
      if (topicContent.topics[nextIndex]) {
        localStorage.setItem(`last-read-topic-${deckId}`, topicContent.topics[nextIndex].id);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      setCurrentTopicIndex(prevIndex);
      // Update last read topic
      if (topicContent && topicContent.topics[prevIndex]) {
        localStorage.setItem(`last-read-topic-${deckId}`, topicContent.topics[prevIndex].id);
      }
    }
  };

  const handleTopicSelect = (index: number) => {
    setCurrentTopicIndex(index);
    // Update last read topic when user manually selects a topic
    if (topicContent && topicContent.topics[index]) {
      localStorage.setItem(`last-read-topic-${deckId}`, topicContent.topics[index].id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!topicContent || topicContent.topics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>🎉 All Topics Read!</h2>
        <p>All available topics have been read in {deckInfo.name}</p>
      </div>
    );
  }

  const isRead = currentTopic ? readTopics.has(currentTopic.id) : false;
  const isConfirmed = currentTopic ? isTopicConfirmed(deckId, currentTopic.id) : false;
  const readCount = readTopics.size;
  const confirmedCount = confirmedTopics.size;
  const totalTopics = topicContent.topics.length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      {/* Header with progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          Reading: <strong>{deckInfo.name}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Topic {currentTopicIndex + 1} of {totalTopics}</strong>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              {readCount} read | {confirmedCount} confirmed
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isRead && (
              <div style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}>
                ✓ Read
              </div>
            )}
            {isConfirmed && (
              <div style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#28a745', 
                color: 'white', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}>
                ✓ Confirmed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic selection (compact view) */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', fontWeight: '500' }}>
            Topics ({totalTopics} total):
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Progress: {Math.round(((readCount + confirmedCount) / (totalTopics * 2)) * 100)}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {topicContent.topics.map((topic, index) => {
            const topicIsRead = readTopics.has(topic.id);
            const topicIsConfirmed = isTopicConfirmed(deckId, topic.id);
            const isCurrent = index === currentTopicIndex;
            let bgColor = '#e0e0e0';
            if (isCurrent) {
              bgColor = '#007bff';
            } else if (topicIsConfirmed) {
              bgColor = '#28a745';
            } else if (topicIsRead) {
              bgColor = '#17a2b8';
            }
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(index)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: bgColor,
                  color: isCurrent ? 'white' : '#333',
                  border: isCurrent ? '2px solid #0056b3' : 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isCurrent ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                title={`${topic.displayName} - ${topic.cards.length} card${topic.cards.length !== 1 ? 's' : ''}${topicIsConfirmed ? ' (Confirmed)' : topicIsRead ? ' (Read)' : ' (Unread)'}`}
              >
                <span>{topic.displayName}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  ({topic.cards.length})
                </span>
                {topicIsConfirmed && <span>✓</span>}
                {topicIsRead && !topicIsConfirmed && <span>○</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current topic content */}
      {currentTopic && (
        <div>
          <div style={{ 
            border: '2px solid #007bff', 
            borderRadius: '8px', 
            padding: '2rem',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#007bff' }}>
              {currentTopic.displayName}
            </h2>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
              {currentTopic.cards.length} card{currentTopic.cards.length !== 1 ? 's' : ''} in this topic
            </div>

            {/* Display all cards as readable content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {currentTopic.cards.map((card, index) => (
                <div
                  key={card.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#666', 
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}>
                    Card {index + 1}
                  </div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    marginBottom: '1rem',
                    fontWeight: '500',
                    color: '#333',
                  }}>
                    {card.front}
                  </div>
                  <div style={{
                    borderTop: '1px solid #eee',
                    paddingTop: '1rem',
                    fontSize: '1rem',
                    color: '#555',
                    lineHeight: '1.6',
                  }}>
                    {card.back}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success message */}
          {showSuccessMessage && lastAddedCount !== null && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              color: '#155724',
            }}>
              ✓ Successfully added {lastAddedCount} flashcard{lastAddedCount !== 1 ? 's' : ''} to your deck!
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handlePrevious}
                disabled={currentTopicIndex === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: currentTopicIndex === 0 ? '#ccc' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentTopicIndex === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentTopicIndex >= topicContent.topics.length - 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: currentTopicIndex >= topicContent.topics.length - 1 ? '#ccc' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentTopicIndex >= topicContent.topics.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleMarkAsRead}
                disabled={isRead}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: isRead ? '#17a2b8' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRead ? 'default' : 'pointer',
                }}
              >
                {isRead ? '✓ Read' : 'Mark as Read'}
              </button>
              <button
                onClick={handleConfirmAndAddFlashcards}
                disabled={isConfirmed}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: isConfirmed ? '#28a745' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isConfirmed ? 'default' : 'pointer',
                  fontWeight: '500',
                }}
              >
                {isConfirmed ? '✓ Confirmed' : 'Confirm & Add Flashcards'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


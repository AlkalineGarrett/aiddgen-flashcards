import { useState, useEffect, useMemo } from 'react';
import { generateTopicContent, getCardPrimaryTopic, formatTopicName } from '../utils/topicContent';
import { useCardStorage } from '../utils/useStorage';
import { DeckId, getDeckInfo } from '../utils/deckStorage';
import { Topic } from '../types/topic';
import { Card } from '../types/card';
import {
  getConfirmedTopics,
  confirmTopic,
  isTopicConfirmed,
  getCardsForTopic,
  getReadTopics,
  saveReadTopics,
  markTopicAsRead,
  isTopicRead,
  getLastReadTopic,
  setLastReadTopic,
} from '../utils/topicConfirmation';
import { getDeckGenerator } from '../utils/flashcardGenerator';
import { generateTopicProse } from '../utils/topicProse';
import { saveQuizResults, getIncorrectCardIdsFromQuiz } from '../utils/quizUtils';
import { Quiz, QuizResult } from './Quiz';
import { QuizSummary } from './QuizSummary';
import './components.css';

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
  const [quizMode, setQuizMode] = useState<'idle' | 'in-progress' | 'completed'>('idle');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [previousIncorrectCardIds, setPreviousIncorrectCardIds] = useState<Set<string>>(new Set());
  const [quizInitialCards, setQuizInitialCards] = useState<Card[] | undefined>(undefined);
  const [quizTopicId, setQuizTopicId] = useState<string | undefined>(undefined);

  const deckInfo = useMemo(() => getDeckInfo(deckId), [deckId]);

  // Load topic content (only topics with cards not yet in storage)
  // But also include confirmed topics even if they have no new cards (so they can be re-read)
  const topicContent = useMemo(() => {
    if (isLoading) return null;
    const generated = generateTopicContent(deckId, cards);
    
    // Add back confirmed topics that were filtered out (have no new cards)
    if (confirmedTopics.size > 0) {
      const generator = getDeckGenerator(deckId);
      const allCards = generator();
      const topicMap = new Map<string, Card[]>();
      
      // Group all cards by topic
      allCards.forEach(card => {
        const primaryTopic = getCardPrimaryTopic(card);
        if (primaryTopic) {
          if (!topicMap.has(primaryTopic)) {
            topicMap.set(primaryTopic, []);
          }
          topicMap.get(primaryTopic)!.push(card);
        }
      });
      
      // For each confirmed topic, check if it's already in generated topics
      confirmedTopics.forEach(topicId => {
        const exists = generated.topics.some(t => t.id === topicId);
        if (!exists && topicMap.has(topicId)) {
          // Topic was filtered out but is confirmed - add it back with empty cards array
          const prose = generateTopicProse(topicId, deckId);
          generated.topics.push({
            id: topicId,
            name: topicId,
            displayName: formatTopicName(topicId),
            cards: [], // No new cards, but keep it visible
            prose,
          });
        }
      });
      
      // Re-sort after adding confirmed topics
      generated.topics.sort((a, b) => a.displayName.localeCompare(b.displayName));
      generated.totalTopics = generated.topics.length;
    }
    
    return generated;
  }, [deckId, cards, isLoading, confirmedTopics]);

  // Load read topics from localStorage on mount
  useEffect(() => {
    const readTopicsSet = getReadTopics(deckId);
    setReadTopics(readTopicsSet);
  }, [deckId]);

  // Load confirmed topics from localStorage on mount
  useEffect(() => {
    const confirmed = getConfirmedTopics(deckId);
    setConfirmedTopics(confirmed);
  }, [deckId]);

  // Resume from last read topic
  useEffect(() => {
    if (!topicContent || topicContent.topics.length === 0) return;
    
    const lastTopicId = getLastReadTopic(deckId);
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
      saveReadTopics(deckId, readTopics);
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

  // Ensure currentTopicIndex is within bounds when topicContent changes
  useEffect(() => {
    if (topicContent && topicContent.topics.length > 0) {
      if (currentTopicIndex >= topicContent.topics.length) {
        // Index out of bounds, reset to first topic
        setCurrentTopicIndex(0);
        if (topicContent.topics[0]) {
          setLastReadTopic(deckId, topicContent.topics[0].id);
        }
      }
    }
  }, [topicContent, currentTopicIndex, deckId]);

  const currentTopic: Topic | null = topicContent?.topics[currentTopicIndex] || null;

  // Load previous quiz results for re-quiz functionality
  useEffect(() => {
    if (!currentTopic) return;
    
    const incorrectIds = getIncorrectCardIdsFromQuiz(deckId, currentTopic.id);
    setPreviousIncorrectCardIds(new Set(incorrectIds));
  }, [deckId, currentTopic?.id]);

  const handleQuiz = () => {
    if (!currentTopic) return;

    // Mark topic as read
    markTopicAsRead(deckId, currentTopic.id);
    setReadTopics((prev) => new Set([...prev, currentTopic.id]));

    // Get cards for this topic that don't already exist
    const cardsToAdd = getCardsForTopic(deckId, currentTopic.id, cards);
    
    // Add all cards if any need to be added
    if (cardsToAdd.length > 0) {
      cardsToAdd.forEach((card) => {
        addCard(card);
      });
      setLastAddedCount(cardsToAdd.length);
      setShowSuccessMessage(true);
    }

    // Confirm the topic
    confirmTopic(deckId, currentTopic.id);
    setConfirmedTopics((prev) => new Set([...prev, currentTopic.id]));

    // Save last read topic
    setLastReadTopic(deckId, currentTopic.id);

    // Prepare cards to pass to quiz (current cards + newly added cards)
    // This ensures quiz sees the cards immediately even before state updates
    const allCardsForQuiz = [...cards, ...cardsToAdd];
    setQuizInitialCards(allCardsForQuiz);
    // Store the topic ID used when starting the quiz (in case currentTopic changes)
    setQuizTopicId(currentTopic.id);

    // Start quiz session
    setQuizMode('in-progress');
    setQuizResult(null);
  };

  const handleQuizComplete = (result: QuizResult) => {
    // Save quiz results
    if (currentTopic) {
      saveQuizResults(deckId, currentTopic.id, result);
    }
    
    setQuizResult(result);
    setQuizMode('completed');
    
    // Update incorrect card IDs for next re-quiz
    // If all cards were correct, clear the incorrect list
    if (result.incorrectCards === 0) {
      setPreviousIncorrectCardIds(new Set());
    } else {
      setPreviousIncorrectCardIds(new Set(result.incorrectCardIds));
    }
  };

  const handleNextAfterQuiz = () => {
    setQuizMode('idle');
    setQuizResult(null);
    setQuizInitialCards(undefined);
    setQuizTopicId(undefined);
    handleNext();
  };

  const handleReadAgain = () => {
    // Store the topic ID before clearing quiz state
    const topicIdToRestore = quizTopicId;
    
    setQuizMode('idle');
    setQuizResult(null);
    setQuizInitialCards(undefined);
    setQuizTopicId(undefined);
    
    // Restore the topic by finding it in topicContent
    if (topicIdToRestore && topicContent) {
      const topicIndex = topicContent.topics.findIndex(t => t.id === topicIdToRestore);
      if (topicIndex !== -1) {
        // Topic found, set the index
        setCurrentTopicIndex(topicIndex);
        setLastReadTopic(deckId, topicIdToRestore);
      } else {
        // Topic was filtered out (all cards in storage)
        // Reset to first topic since the quiz topic is no longer available
        if (topicContent.topics.length > 0) {
          setCurrentTopicIndex(0);
          setLastReadTopic(deckId, topicContent.topics[0].id);
        }
      }
    }
  };

  const handleNext = () => {
    if (topicContent && currentTopicIndex < topicContent.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      setCurrentTopicIndex(nextIndex);
      // Update last read topic
      if (topicContent.topics[nextIndex]) {
        setLastReadTopic(deckId, topicContent.topics[nextIndex].id);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      setCurrentTopicIndex(prevIndex);
      // Update last read topic
      if (topicContent && topicContent.topics[prevIndex]) {
        setLastReadTopic(deckId, topicContent.topics[prevIndex].id);
      }
    }
  };

  const handleTopicSelect = (index: number) => {
    setCurrentTopicIndex(index);
    // Update last read topic when user manually selects a topic
    if (topicContent && topicContent.topics[index]) {
      setLastReadTopic(deckId, topicContent.topics[index].id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!topicContent || topicContent.topics.length === 0) {
    return (
      <div className="topic-reader-empty">
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

  const handleCancelQuiz = () => {
    setQuizMode('idle');
    setQuizResult(null);
    setQuizInitialCards(undefined);
    setQuizTopicId(undefined);
    // Stay on current topic when canceling quiz
  };

  // Show quiz if in progress
  if (quizMode === 'in-progress' && quizTopicId) {
    const shouldFilterIncorrect = previousIncorrectCardIds.size > 0;
    
    // Use the topic ID that was stored when quiz started (quizTopicId)
    // This prevents issues if currentTopic changes due to topicContent regeneration
    const topicIdForQuiz = quizTopicId;
    
    // Calculate cards for quiz: use quizInitialCards if set, otherwise compute from stored topic
    let cardsToPass: Card[] | undefined;
    if (quizInitialCards !== undefined && quizInitialCards.length > 0) {
      cardsToPass = quizInitialCards;
    } else {
      // Fallback: get cards for the stored topic directly
      const cardsForTopic = getCardsForTopic(deckId, topicIdForQuiz, cards);
      const allCards = [...cards, ...cardsForTopic];
      // Deduplicate by card ID just in case
      const uniqueCards = Array.from(
        new Map(allCards.map(card => [card.id, card])).values()
      );
      cardsToPass = uniqueCards.length > 0 ? uniqueCards : undefined;
    }
    
    return (
      <Quiz
        deckId={deckId}
        topicId={topicIdForQuiz}
        onComplete={handleQuizComplete}
        onCancel={handleCancelQuiz}
        filterIncorrectOnly={shouldFilterIncorrect}
        previousIncorrectCardIds={Array.from(previousIncorrectCardIds)}
        initialCards={cardsToPass}
      />
    );
  }

  // Show quiz summary if completed
  if (quizMode === 'completed' && quizResult && quizTopicId) {
    // Find current topic index for navigation purposes
    const currentTopicIndexForNavigation = topicContent?.topics.findIndex(t => t.id === quizTopicId) ?? currentTopicIndex;
    const canGoToNext = topicContent && currentTopicIndexForNavigation < topicContent.topics.length - 1;
    return (
      <QuizSummary
        result={quizResult}
        onReadAgain={handleReadAgain}
        onNextTopic={handleNextAfterQuiz}
        canGoToNext={canGoToNext}
      />
    );
  }

  return (
    <div className="topic-reader-container">
      {/* Header with progress */}
      <div className="topic-reader-header">
        <div className="topic-reader-header-text">
          Reading: <strong>{deckInfo.name}</strong>
        </div>
        <div className="topic-reader-header-main">
          <div>
            <strong>Topic {currentTopicIndex + 1} of {totalTopics}</strong>
            <div className="topic-reader-header-stats">
              {readCount} read | {confirmedCount} confirmed
            </div>
          </div>
          <div className="topic-reader-badges">
            {isRead && (
              <div className="topic-reader-badge topic-reader-badge-read">
                ✓ Read
              </div>
            )}
            {isConfirmed && (
              <div className="topic-reader-badge topic-reader-badge-confirmed">
                ✓ Confirmed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic selection (compact view) */}
      <div className="topic-reader-selection">
        <div className="topic-reader-selection-header">
          <div className="topic-reader-selection-title">
            Topics ({totalTopics} total):
          </div>
          <div className="topic-reader-selection-progress">
            Progress: {Math.round(((readCount + confirmedCount) / (totalTopics * 2)) * 100)}%
          </div>
        </div>
        <div className="topic-reader-selection-list">
          {topicContent.topics.map((topic, index) => {
            const topicIsRead = isTopicRead(deckId, topic.id);
            const topicIsConfirmed = isTopicConfirmed(deckId, topic.id);
            const isCurrent = index === currentTopicIndex;
            let buttonClass = 'topic-reader-topic-button topic-reader-topic-button-default';
            if (isCurrent) {
              buttonClass = 'topic-reader-topic-button topic-reader-topic-button-current';
            } else if (topicIsConfirmed) {
              buttonClass = 'topic-reader-topic-button topic-reader-topic-button-confirmed';
            } else if (topicIsRead) {
              buttonClass = 'topic-reader-topic-button topic-reader-topic-button-read';
            }
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(index)}
                className={buttonClass}
                title={`${topic.displayName} - ${topic.cards.length} card${topic.cards.length !== 1 ? 's' : ''}${topicIsConfirmed ? ' (Confirmed)' : topicIsRead ? ' (Read)' : ' (Unread)'}`}
              >
                <span>{topic.displayName}</span>
                <span className="topic-reader-topic-count">
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
          <div className="topic-reader-content-card">
            <h2 className="topic-reader-content-title">
              {currentTopic.displayName}
            </h2>
            
            <div className="topic-reader-content-info">
              {currentTopic.cards.length} flashcard{currentTopic.cards.length !== 1 ? 's' : ''} will be generated when you confirm this topic
            </div>

            {/* Display prose content */}
            <div className="topic-reader-content-prose">
              {(() => {
                const paragraphs = currentTopic.prose.split('\n\n').filter(p => p.trim());
                const elements: JSX.Element[] = [];
                
                paragraphs.forEach((paragraph, pIndex) => {
                  const lines = paragraph.split('\n').map(l => l.trim()).filter(l => l);
                  const parts: JSX.Element[] = [];
                  let currentList: string[] = [];
                  let currentParagraph: string[] = [];
                  
                  const flushParagraph = () => {
                    if (currentParagraph.length > 0) {
                      const text = currentParagraph.join(' ');
                      if (text.trim()) {
                        parts.push(
                          <p key={`para-${pIndex}-${parts.length}`} className="topic-reader-prose-paragraph">
                            {text}
                          </p>
                        );
                      }
                      currentParagraph = [];
                    }
                  };
                  
                  const flushList = () => {
                    if (currentList.length > 0) {
                      parts.push(
                        <ul key={`list-${pIndex}-${parts.length}`} className="topic-reader-prose-list">
                          {currentList.map((item, itemIndex) => (
                            <li key={itemIndex} className="topic-reader-prose-list-item">
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                      currentList = [];
                    }
                  };
                  
                  lines.forEach((line) => {
                    // Check if line is a list item (starts with dash, asterisk, or bullet)
                    if (line.match(/^[-*•]\s+/)) {
                      flushParagraph();
                      const itemText = line.replace(/^[-*•]\s+/, '').trim();
                      if (itemText) {
                        currentList.push(itemText);
                      }
                    } else {
                      flushList();
                      if (line.trim()) {
                        currentParagraph.push(line);
                      }
                    }
                  });
                  
                  // Flush remaining content
                  flushParagraph();
                  flushList();
                  
                  elements.push(...parts);
                });
                
                return elements;
              })()}
            </div>
          </div>

          {/* Success message */}
          {showSuccessMessage && lastAddedCount !== null && (
            <div className="topic-reader-success-message">
              ✓ Successfully added {lastAddedCount} flashcard{lastAddedCount !== 1 ? 's' : ''} to your deck!
            </div>
          )}

          {/* Action buttons */}
          <div className="topic-reader-actions">
            <div className="topic-reader-nav-buttons">
              <button
                onClick={handlePrevious}
                disabled={currentTopicIndex === 0}
                className={`topic-reader-nav-button topic-reader-nav-button-primary ${currentTopicIndex === 0 ? 'topic-reader-nav-button-disabled' : ''}`}
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentTopicIndex >= topicContent.topics.length - 1}
                className={`topic-reader-nav-button topic-reader-nav-button-primary ${currentTopicIndex >= topicContent.topics.length - 1 ? 'topic-reader-nav-button-disabled' : ''}`}
              >
                Next →
              </button>
            </div>
            <div className="topic-reader-action-buttons">
              <button
                onClick={handleQuiz}
                className="topic-reader-action-button"
              >
                Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Simple test file to verify FSRS implementation
import {
  createInitialCardState,
  updateCardState,
  isCardDue,
  getCardPriority,
  sortCardsByPriority,
  getDueCards,
} from './fsrs';
import { Card, ReviewQuality } from '../types/card';

// Test helper to create a test card
function createTestCard(id: string, front: string, back: string): Card {
  return {
    id,
    front,
    back,
    state: createInitialCardState(),
    createdAt: Date.now(),
  };
}

// Example usage and verification
export function testFSRS() {
  console.log('Testing FSRS implementation...');
  
  // Create a test card
  const card = createTestCard('1', 'What is FSRS?', 'Free Spaced Repetition Scheduler');
  console.log('Initial card state:', card.state);
  
  // Simulate a review with "Good" rating (quality 4)
  const result1 = updateCardState(card, 4);
  console.log('After Good review:', result1.card.state);
  
  // Simulate another review with "Perfect" rating (quality 5)
  const result2 = updateCardState(result1.card, 5);
  console.log('After Perfect review:', result2.card.state);
  
  // Test due date checking
  const now = Date.now();
  const isDue = isCardDue(result2.card, now);
  console.log('Is card due now?', isDue);
  
  // Test priority sorting
  const cards = [
    createTestCard('1', 'Card 1', 'Answer 1'),
    createTestCard('2', 'Card 2', 'Answer 2'),
    createTestCard('3', 'Card 3', 'Answer 3'),
  ];
  
  // Make one card overdue
  cards[0].state.dueDate = now - 1000 * 60 * 60 * 24; // 1 day ago
  cards[1].state.dueDate = now + 1000 * 60 * 60 * 24; // 1 day from now
  cards[2].state.dueDate = now - 1000 * 60 * 60 * 48; // 2 days ago
  
  const sorted = sortCardsByPriority(cards, now);
  console.log('Sorted by priority:', sorted.map(c => ({ id: c.id, priority: getCardPriority(c, now) })));
  
  const dueCards = getDueCards(cards, now);
  console.log('Due cards:', dueCards.map(c => c.id));
}


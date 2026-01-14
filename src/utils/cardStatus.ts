import { Card } from '../types/card';
import { isCardDue } from './fsrs';

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

/**
 * Determine card status based on review count and state
 */
export function getCardStatus(card: Card, now: number = Date.now()): CardStatus {
  const { reviewCount, stability } = card.state;
  
  if (reviewCount === 0) {
    return 'new';
  }
  
  if (reviewCount < 3) {
    return 'learning';
  }
  
  if (stability >= 30) {
    return 'mastered';
  }
  
  return 'review';
}

/**
 * Get status color for display
 */
export function getStatusColor(status: CardStatus): string {
  switch (status) {
    case 'new':
      return '#6c757d'; // gray
    case 'learning':
      return '#ffc107'; // yellow
    case 'review':
      return '#007bff'; // blue
    case 'mastered':
      return '#28a745'; // green
    default:
      return '#6c757d';
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: CardStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Filter cards by status
 */
export function filterCardsByStatus(
  cards: Card[],
  status: CardStatus | 'all',
  now: number = Date.now()
): Card[] {
  if (status === 'all') return cards;
  return cards.filter((card) => getCardStatus(card, now) === status);
}

/**
 * Filter cards by tag
 */
export function filterCardsByTag(
  cards: Card[],
  tag: string | 'all'
): Card[] {
  if (tag === 'all') return cards;
  return cards.filter((card) => card.tags?.includes(tag));
}

/**
 * Search cards by text (searches front and back)
 */
export function searchCards(
  cards: Card[],
  searchText: string
): Card[] {
  if (!searchText.trim()) return cards;
  const lowerSearch = searchText.toLowerCase();
  return cards.filter(
    (card) =>
      card.front.toLowerCase().includes(lowerSearch) ||
      card.back.toLowerCase().includes(lowerSearch)
  );
}


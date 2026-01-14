import { Card } from '../types/card';
import { Topic, TopicContent } from '../types/topic';
import { getDeckGenerator } from './flashcardGenerator';
import { DeckId } from './deckStorage';
import { generateTopicProse } from './topicProse';

/**
 * Extract primary topic from a tag
 * Primary topics are single words or the first part of compound tags
 * Examples: 'commands' from 'commands', 'choice' from 'choice-hierarchy'
 */
function extractPrimaryTopic(tag: string): string | null {
  // Ignore deck tags
  if (tag === 'aidd' || tag === 'aiddgen') {
    return null;
  }

  // If tag contains a dash, take the first part (e.g., 'choice' from 'choice-hierarchy')
  // Otherwise, use the whole tag
  const parts = tag.split('-');
  return parts[0] || null;
}

/**
 * Get the primary topic for a card
 * Uses the first non-deck tag as the primary topic
 */
function getCardPrimaryTopic(card: Card): string | null {
  if (!card.tags || card.tags.length === 0) {
    return null;
  }

  // Find the first tag that's not a deck tag
  for (const tag of card.tags) {
    const primaryTopic = extractPrimaryTopic(tag);
    if (primaryTopic) {
      return primaryTopic;
    }
  }

  return null;
}

/**
 * Group cards by primary topic
 * Each card is assigned to one primary topic (the first non-deck tag)
 */
function groupCardsByTopic(cards: Card[]): Map<string, Card[]> {
  const topicMap = new Map<string, Card[]>();
  
  cards.forEach((card) => {
    const primaryTopic = getCardPrimaryTopic(card);
    if (primaryTopic) {
      if (!topicMap.has(primaryTopic)) {
        topicMap.set(primaryTopic, []);
      }
      topicMap.get(primaryTopic)!.push(card);
    }
  });
  
  return topicMap;
}

/**
 * Format topic name for display
 */
function formatTopicName(topicId: string): string {
  // Convert kebab-case or snake_case to Title Case
  return topicId
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate topic content from cards for a given deck
 */
export function generateTopicContent(deckId: DeckId, existingCards: Card[] = []): TopicContent {
  const generator = getDeckGenerator(deckId);
  const allCards = generator();
  
  // Group cards by primary topic
  const topicMap = groupCardsByTopic(allCards);
  
  // Convert to Topic objects
  const topics: Topic[] = Array.from(topicMap.entries())
    .map(([topicId, cards]) => {
      // Filter out cards that already exist
      const existingCardIds = new Set(existingCards.map((c) => c.id));
      const newCards = cards.filter((card) => !existingCardIds.has(card.id));
      
      // Generate prose for this topic
      const prose = generateTopicProse(topicId, deckId);
      
      return {
        id: topicId,
        name: topicId,
        displayName: formatTopicName(topicId),
        cards: newCards,
        prose,
      };
    })
    .filter((topic) => topic.cards.length > 0) // Only include topics with cards
    .sort((a, b) => a.displayName.localeCompare(b.displayName)); // Sort alphabetically
  
  return {
    topics,
    totalTopics: topics.length,
  };
}

/**
 * Get a specific topic by ID
 */
export function getTopicById(deckId: DeckId, topicId: string, existingCards: Card[] = []): Topic | null {
  const content = generateTopicContent(deckId, existingCards);
  return content.topics.find((t) => t.id === topicId) || null;
}

/**
 * Get all available topic IDs for a deck
 */
export function getAvailableTopicIds(deckId: DeckId, existingCards: Card[] = []): string[] {
  const content = generateTopicContent(deckId, existingCards);
  return content.topics.map((t) => t.id);
}


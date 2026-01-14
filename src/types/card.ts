export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface CardState {
  difficulty: number; // 0-1, how hard the card is
  stability: number; // days until next review
  lastReview: number; // timestamp
  dueDate: number; // timestamp
  reviewCount: number;
  easeFactor: number;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  tags?: string[];
  state: CardState;
  createdAt: number;
}

export interface ReviewResult {
  card: Card;
  quality: ReviewQuality;
  reviewedAt: number;
  nextReview: number;
}


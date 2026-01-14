import { Card } from './card';

export interface Topic {
  id: string;
  name: string;
  displayName: string;
  cards: Card[];
  description?: string;
}

export interface TopicContent {
  topics: Topic[];
  totalTopics: number;
}


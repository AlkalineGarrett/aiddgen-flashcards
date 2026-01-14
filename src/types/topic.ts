import { Card } from './card';

export interface Topic {
  id: string;
  name: string;
  displayName: string;
  cards: Card[];
  prose: string;
}

export interface TopicContent {
  topics: Topic[];
  totalTopics: number;
}


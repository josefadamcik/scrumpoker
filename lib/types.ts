export type Card = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '?' | '☕';

export interface Participant {
  id: string;
  nickname: string;
  vote: Card | null;
  joinedAt: number;
  isConnected?: boolean;
  lastSeen?: number;
}

export interface VoteRecord {
  participantId: string;
  nickname: string;
  vote: Card;
}

export interface RoundHistory {
  roundNumber: number;
  revealedAt: number;
  votes: VoteRecord[];
}

export interface Session {
  id: string;
  createdAt: number;
  participants: Record<string, Participant>;
  revealed: boolean;
  creatorId: string;
  voteHistory?: RoundHistory[];
}

export const CARDS: Card[] = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

export const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

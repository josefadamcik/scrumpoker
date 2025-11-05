import { customAlphabet } from 'nanoid';

// Generate URL-safe session IDs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

export function generateSessionId(): string {
  return nanoid();
}

export function generateParticipantId(): string {
  return nanoid();
}

const ADJECTIVES = [
  'Happy', 'Clever', 'Brave', 'Swift', 'Wise', 'Kind', 'Bold', 'Calm',
  'Eager', 'Friendly', 'Gentle', 'Jolly', 'Keen', 'Lively', 'Merry', 'Noble',
];

const NOUNS = [
  'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Owl', 'Bear', 'Wolf',
  'Hawk', 'Lion', 'Falcon', 'Otter', 'Rabbit', 'Deer', 'Penguin', 'Koala',
];

export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}${noun}`;
}

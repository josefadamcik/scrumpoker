import { kv } from '@vercel/kv';
import type { Session } from './types';

export const redis = kv;

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const session = await redis.get<Session>(`session:${sessionId}`);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(sessionId: string, session: Session, ttl: number = 24 * 60 * 60): Promise<void> {
  try {
    await redis.set(`session:${sessionId}`, session, { ex: ttl });
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await redis.del(`session:${sessionId}`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

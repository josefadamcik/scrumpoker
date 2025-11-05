import { NextResponse } from 'next/server';
import { generateSessionId, generateParticipantId } from '@/lib/utils';
import { setSession } from '@/lib/redis';
import type { Session } from '@/lib/types';
import { SESSION_TTL } from '@/lib/types';

export async function POST() {
  try {
    const sessionId = generateSessionId();
    const creatorId = generateParticipantId();

    const session: Session = {
      id: sessionId,
      createdAt: Date.now(),
      participants: {},
      revealed: false,
      creatorId,
    };

    await setSession(sessionId, session, SESSION_TTL);

    return NextResponse.json({
      sessionId,
      creatorId,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

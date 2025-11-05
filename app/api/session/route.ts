import { NextResponse } from 'next/server';
import { generateSessionId, generateParticipantId, generateRandomNickname } from '@/lib/utils';
import { setSession } from '@/lib/redis';
import type { Session, Participant } from '@/lib/types';
import { SESSION_TTL } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { nickname } = body;

    const sessionId = generateSessionId();
    const creatorId = generateParticipantId();
    const finalNickname = nickname?.trim() || generateRandomNickname();

    // Create the creator as a participant
    const creatorParticipant: Participant = {
      id: creatorId,
      nickname: finalNickname,
      vote: null,
      joinedAt: Date.now(),
    };

    const session: Session = {
      id: sessionId,
      createdAt: Date.now(),
      participants: {
        [creatorId]: creatorParticipant,
      },
      revealed: false,
      creatorId,
    };

    await setSession(sessionId, session, SESSION_TTL);

    return NextResponse.json({
      sessionId,
      participantId: creatorId,
      nickname: finalNickname,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

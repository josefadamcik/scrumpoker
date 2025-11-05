import { NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/redis';
import { generateParticipantId, generateRandomNickname } from '@/lib/utils';
import type { Participant } from '@/lib/types';
import { SESSION_TTL } from '@/lib/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { nickname } = body;

    const session = await getSession(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const participantId = generateParticipantId();
    const finalNickname = nickname?.trim() || generateRandomNickname();

    const participant: Participant = {
      id: participantId,
      nickname: finalNickname,
      vote: null,
      joinedAt: Date.now(),
    };

    session.participants[participantId] = participant;
    await setSession(id, session, SESSION_TTL);

    return NextResponse.json({ participantId, nickname: finalNickname });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

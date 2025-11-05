import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getSession, setSession } from '@/lib/supabase';
import { generateParticipantId, generateRandomNickname } from '@/lib/utils';
import type { Participant } from '@/lib/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check for bot traffic
    const { isBot } = await checkBotId();
    if (isBot) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

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
    await setSession(id, session);

    return NextResponse.json({ participantId, nickname: finalNickname });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

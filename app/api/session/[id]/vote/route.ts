import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getSession, setSession } from '@/lib/supabase';
import type { Card } from '@/lib/types';
import { CARDS } from '@/lib/types';

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
    const { participantId, vote } = body;

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID required' },
        { status: 400 }
      );
    }

    if (vote !== null && !CARDS.includes(vote as Card)) {
      return NextResponse.json(
        { error: 'Invalid vote' },
        { status: 400 }
      );
    }

    const session = await getSession(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.participants[participantId]) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    session.participants[participantId].vote = vote;
    await setSession(id, session);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}

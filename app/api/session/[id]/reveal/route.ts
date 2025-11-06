import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getSession, setSession } from '@/lib/supabase';
import { VoteRecord, RoundHistory } from '@/lib/types';

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
    const session = await getSession(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Save current round to history before revealing
    const votes: VoteRecord[] = Object.entries(session.participants)
      .filter(([_, participant]) => participant.vote !== null)
      .map(([participantId, participant]) => ({
        participantId,
        nickname: participant.nickname,
        vote: participant.vote!,
      }));

    // Only add to history if there are votes
    if (votes.length > 0) {
      const voteHistory = session.voteHistory || [];
      const roundNumber = voteHistory.length + 1;

      const newRound: RoundHistory = {
        roundNumber,
        revealedAt: Date.now(),
        votes,
      };

      session.voteHistory = [...voteHistory, newRound];
    }

    session.revealed = true;
    await setSession(id, session);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revealing votes:', error);
    return NextResponse.json(
      { error: 'Failed to reveal votes' },
      { status: 500 }
    );
  }
}

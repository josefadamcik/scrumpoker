import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { getSession, setSession } from '@/lib/supabase';

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

    // Reset all votes and hide results
    Object.keys(session.participants).forEach(participantId => {
      session.participants[participantId].vote = null;
    });
    session.revealed = false;

    await setSession(id, session);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting votes:', error);
    return NextResponse.json(
      { error: 'Failed to reset votes' },
      { status: 500 }
    );
  }
}

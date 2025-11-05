import { NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/redis';
import { SESSION_TTL } from '@/lib/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    session.revealed = true;
    await setSession(id, session, SESSION_TTL);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revealing votes:', error);
    return NextResponse.json(
      { error: 'Failed to reveal votes' },
      { status: 500 }
    );
  }
}

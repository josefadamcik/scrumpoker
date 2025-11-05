import { NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/supabase';

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

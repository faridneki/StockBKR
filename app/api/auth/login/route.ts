import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const result = await loginUser(email, password);

    if (result.success) {
      return NextResponse.json(
        { success: true, user: result.user },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
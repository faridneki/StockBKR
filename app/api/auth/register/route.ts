import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, nom, prenom } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const result = await registerUser(email, password, nom, prenom, 'user', false);

    if (result.success) {
      return NextResponse.json(
        { success: true, user: result.user },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
"use server";

import { PrismaClient } from '@prisma/client';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-secret-jwt-tres-long-min-32-caracteres!'
);

export interface UserSession {
  id: number;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  // Transformer le payload JWT en objet UserSession
  const userSession: UserSession = {
    id: payload.id as number,
    email: payload.email as string,
    nom: payload.nom as string,
    prenom: payload.prenom as string,
    role: payload.role as string,
  };
  return userSession;
}catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    console.error('Erreur getSession:', error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function loginUser(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  
  try {
    const user = await prisma.utilisateurs.findUnique({
      where: { email },
    });

    if (!user ) {
      return { success: false, error: 'Email incorrect' };
    }
   

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Mot de passe incorrect' };
    }
     if (!user.actif) {
      return { success: false, error: "Votre compte n'est pas activé" };
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    // CRÉER LE TOKEN ET LE COOKIE UNIQUEMENT ICI
    const token = await createToken(session);
    await setAuthCookie(token);

    return { success: true, user: session };

  } catch (error) {
    console.error('Erreur loginUser:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export async function registerUser(
email: string, password: string, nom?: string, prenom?: string, role?: string, actif?: boolean): Promise<{ success: boolean; user?: Omit<UserSession, 'role'>; error?: string }> {
  
  try {
   

    const hashed = await hashPassword(password);
    const user = await prisma.utilisateurs.create({
      data: { email, password: hashed, nom, prenom, role: role || 'user', actif: actif || false },
    });

    // NE PAS créer de token ni de cookie ici !

    const userWithoutRole = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
    };

    return { success: true, user: userWithoutRole };

  } catch (error) {
    console.error('Erreur register:', error);
    return { success: false, error: 'Erreur inscription' };
  }
}
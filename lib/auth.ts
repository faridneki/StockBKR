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
  tokenId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: UserSession): Promise<string> {
  const tokenId = crypto.randomUUID();
  return new SignJWT({ ...user, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userSession: UserSession = {
      id: payload.id as number,
      email: payload.email as string,
      nom: payload.nom as string,
      prenom: payload.prenom as string,
      role: payload.role as string,
      tokenId: payload.tokenId as string,
    };
    return userSession;
  } catch {
    return null;
  }
}

async function cleanupExpiredTokens(userId: number) {
  const user = await prisma.utilisateurs.findUnique({
    where: { id: userId },
    select: { activeTokens: true }
  });

  if (!user || !user.activeTokens) return;

  const validTokens: string[] = [];
  
  for (const token of user.activeTokens) {
    try {
      await jwtVerify(token, JWT_SECRET);
      validTokens.push(token);
    } catch {
      // Token expiré, on ne le garde pas
    }
  }

  if (validTokens.length !== user.activeTokens.length) {
    await prisma.utilisateurs.update({
      where: { id: userId },
      data: { activeTokens: validTokens }
    });
  }
}

export async function loginUser(
  email: string, 
  password: string,
  ipAddress?: string
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  
  try {
    const user = await prisma.utilisateurs.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Email incorrect' };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Mot de passe incorrect' };
    }
    
    if (!user.actif) {
      return { success: false, error: "Votre compte n'est pas activé" };
    }

    await cleanupExpiredTokens(user.id);

    const currentTokens = user.activeTokens || [];
    
    if (currentTokens.length >= (user.maxSessions || 2)) {
      return { 
        success: false, 
        error: `Vous avez déjà ${currentTokens.length} session(s) active(s). Maximum autorisé: ${user.maxSessions || 2}. Déconnectez-vous d'un autre appareil.` 
      };
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    const token = await createToken(session);
    
    const payload = await verifyToken(token);
    const tokenId = payload?.tokenId;

    const updatedTokens = [...currentTokens, token];
    
    await prisma.utilisateurs.update({
      where: { id: user.id },
      data: { 
        activeTokens: updatedTokens,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null
      }
    });

    await setAuthCookie(token);

    return { success: true, user: session };

  } catch (error) {
    console.error('Erreur loginUser:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export async function registerUser(
  email: string, 
  password: string, 
  nom?: string, 
  prenom?: string, 
  role?: string, 
  actif?: boolean
): Promise<{ success: boolean; user?: Omit<UserSession, 'role'>; error?: string }> {
  
  try {
    const hashed = await hashPassword(password);
    const user = await prisma.utilisateurs.create({
      data: { 
        email, 
        password: hashed, 
        nom, 
        prenom, 
        role: role || 'user', 
        actif: actif || false,
        activeTokens: []
      },
    });

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

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    
    const session = await verifyToken(token);
    if (!session) return null;

    const user = await prisma.utilisateurs.findUnique({
      where: { id: session.id },
      select: { activeTokens: true }
    });

    if (!user || !user.activeTokens?.includes(token)) {
      await clearAuthCookie();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Erreur getSession:', error);
    return null;
  }
}

export async function logoutUser() {
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (session && token) {
      const user = await prisma.utilisateurs.findUnique({
        where: { id: session.id }
      });

      if (user) {
        const updatedTokens = (user.activeTokens || []).filter(t => t !== token);
        
        await prisma.utilisateurs.update({
          where: { id: session.id },
          data: { activeTokens: updatedTokens }
        });
      }
    }

    await clearAuthCookie();
    return { success: true };
  } catch (error) {
    console.error('Erreur logout:', error);
    return { success: false };
  }
}

export async function logoutAllDevices() {
  try {
    const session = await getSession();
    
    if (session) {
      await prisma.utilisateurs.update({
        where: { id: session.id },
        data: { activeTokens: [] }
      });
    }

    await clearAuthCookie();
    return { success: true };
  } catch (error) {
    console.error('Erreur logout all:', error);
    return { success: false };
  }
}

export async function getSessionCount(): Promise<number> {
  try {
    const session = await getSession();
    if (!session) return 0;

    const user = await prisma.utilisateurs.findUnique({
      where: { id: session.id },
      select: { activeTokens: true }
    });

    return user?.activeTokens?.length || 0;
  } catch (error) {
    console.error('Erreur getSessionCount:', error);
    return 0;
  }
}
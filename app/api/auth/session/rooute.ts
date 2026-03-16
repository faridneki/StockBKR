
// app/api/auth/session/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ 
        active: false, 
        reason: 'Aucun token trouvé',
        user: null 
      })
    }

    // Vérifier le token JWT
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ 
        active: false, 
        reason: 'Token invalide ou expiré',
        user: null 
      })
    }

    // Vérifier dans la base de données
    const user = await prisma.utilisateurs.findUnique({
      where: { id: session.id },
      select: { 
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        activeTokens: true,
        actif: true 
      }
    })

    if (!user) {
      return NextResponse.json({ 
        active: false, 
        reason: 'Utilisateur non trouvé',
        user: null 
      })
    }

    if (!user.actif) {
      return NextResponse.json({ 
        active: false, 
        reason: 'Compte désactivé',
        user: null 
      })
    }

    if (!user.activeTokens?.includes(token)) {
      return NextResponse.json({ 
        active: false, 
        reason: 'Session révoquée',
        user: null 
      })
    }

    // Session valide
    return NextResponse.json({ 
      active: true, 
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      },
      reason: null 
    })

  } catch (error) {
    console.error('Erreur vérification session:', error)
    return NextResponse.json({ 
      active: false, 
      reason: 'Erreur serveur',
      user: null 
    }, { status: 500 })
  }
}
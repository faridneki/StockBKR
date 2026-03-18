"use server";

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function getUsers() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Non autorisé' }
    }

    const users = await prisma.utilisateurs.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        maxSessions: true,
        created_at: true,
        lastLoginAt: true,
        lastLoginIp: true,
        activeTokens: true,
      }
    })

    return { success: true, users }
  } catch (error) {
    console.error('Erreur getUsers:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function toggleUserStatus(userId: number, actif: boolean) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Non autorisé' }
    }

    if (userId === session.id) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre compte' }
    }

    await prisma.utilisateurs.update({
      where: { id: userId },
      data: { actif }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function deleteUser(userId: number) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Non autorisé' }
    }

    if (userId === session.id) {
      return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' }
    }

    await prisma.utilisateurs.delete({
      where: { id: userId }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur deleteUser:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}

export async function changeUserRole(userId: number, role: string) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Non autorisé' }
    }

    if (userId === session.id) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' }
    }

    if (role !== 'admin' && role !== 'user') {
      return { success: false, error: 'Rôle invalide' }
    }

    await prisma.utilisateurs.update({
      where: { id: userId },
      data: { role }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur changeUserRole:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
export async function disconnectUserSessions(userId: number) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return { success: false, error: 'Non autorisé' }
    }

    // Empêcher l'admin de se déconnecter lui-même
    if (userId === session.id) {
      return { success: false, error: 'Vous ne pouvez pas déconnecter vos propres sessions' }
    }

    // Réinitialiser les tokens actifs de l'utilisateur
    await prisma.utilisateurs.update({
      where: { id: userId },
      data: { 
        activeTokens: [],
        lastLoginAt: null // Optionnel : réinitialiser aussi la dernière connexion
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur disconnectUserSessions:', error)
    return { success: false, error: 'Erreur serveur' }
  }
}
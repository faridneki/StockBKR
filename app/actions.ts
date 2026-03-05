"use server"

import prisma from "@/lib/prisma"

import { StockData } from "@/type"

import { stock} from "@prisma/client"

export async function getStocks() {
  try {
    

    const stocks = await prisma.stock.findMany({
      
      orderBy: {
        Reference: 'asc'
      }
    });

    return stocks;
  } catch (error) {
    console.error("Erreur getStocks:", error);
    return [];
  }
}






interface StkAtWithPricing {
  Ref_at: string;
  Designation_at: string | null;
  Loc_at: string | null;
  EnStock_at: string | null;
  Quantite_at: number | null;
  Stk_min_at: number | null;
  Stk_in_at: number | null;
  PMatiere: number | null;
  Marge: number | null;
  Taxe: number | null;
  PrixHT: number | null;
  PrixTTC: number | null;
}

export async function getStkAtWithPricing(): Promise<StkAtWithPricing[]> {
  try {
    // Récupérer tous les articles de stk_at
    const stkAtItems = await prisma.$queryRaw`
      SELECT 
        Ref_at,
        Designation_at,
        Loc_at,
        EnStock_at,
        Quantite_at,
        Stk_min_at,
        Stk_in_at
      FROM stk_at
    `;

    // Récupérer les données de stock pour calculer les prix
    const stockItems = await prisma.stock.findMany({
      select: {
        Reference: true,
        Designation: true,
        PMatiere: true,
        Marge: true,
        Taxe: true,
      },
    });

    // Créer une map pour un accès rapide aux données stock par référence
    const stockMap = new Map(
      stockItems.map((s) => [
        s.Reference,
        {
          Designation: s.Designation,
          PMatiere: s.PMatiere,
          Marge: s.Marge,
          Taxe: s.Taxe,
        },
      ])
    );

    // Fusionner les données et calculer les prix
    const result: StkAtWithPricing[] = (stkAtItems as any[]).map((item) => {
      const stockData = stockMap.get(item.Ref_at);
      
      let prixHT: number | null = null;
      let prixTTC: number | null = null;

      if (stockData && stockData.PMatiere !== null && stockData.Marge !== null) {
        // Calcul Prix HT = PMatiere + (PMatiere * Marge / 100)
        prixHT = stockData.PMatiere + (stockData.PMatiere * stockData.Marge / 100);
        
        if (stockData.Taxe !== null) {
          // Calcul Prix TTC = Prix HT + (Prix HT * Taxe / 100)
          prixTTC = prixHT + (prixHT * stockData.Taxe / 100);
        }
      }

      return {
        Ref_at: item.Ref_at,
        Designation_at: item.Designation_at,
        Designation_stock: stockData?.Designation ?? null,
        Loc_at: item.Loc_at,
        EnStock_at: item.EnStock_at,
        Quantite_at: item.Quantite_at,
        Stk_min_at: item.Stk_min_at,
        Stk_in_at: item.Stk_in_at,
        PMatiere: stockData?.PMatiere ?? null,
        Marge: stockData?.Marge ?? null,
        Taxe: stockData?.Taxe ?? null,
        PrixHT: prixHT,
        PrixTTC: prixTTC,
      };
    });

    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération des données stk_at:", error);
    throw new Error("Impossible de récupérer les données avec tarification");
  }
}
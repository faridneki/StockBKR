"use server"

import prisma from "@/lib/prisma"

import { StockData } from "@/type"

import { Stock} from "@prisma/client"

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


// Dans votre page, remplacez l'interface par :
interface StockRestant {
  Reference: string;
  Designation: string;
  Emplacement_principal: string;
  EnStock: string;
  RefCategorie: string;
  PMatiere: number;
  Marge: number;
  Taxe: number;
  Quantite_stock: number;
  Quantite_stk_at: number;
  Quantite_restante: number;
  Seuil: number;
  Emplacement_bejaia: string | null;  // Correction : enlever le 't' à la fin
  Seuil_bejaia: number | null;        // Ajouter si nécessaire
  Designation_bejaia: string | null;  // Ajouter si nécessaire
  EnStock_bejaia: string | null;      // Ajouter si nécessaire
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
      *  
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
export async function getStockRestant() {
  try {
    // Récupérer tous les stocks
    const stocks = await prisma.stock.findMany();
    
    // Récupérer tous les stk_at
    const stkAtItems = await prisma.stk_at.findMany();
    
    // Créer un map pour les données stk_at par référence
    const stkAtMap = new Map();
    stkAtItems.forEach(item => {
      stkAtMap.set(item.Ref_at, {
        quantite_at: item.Quantite_at || 0,
        loc_at: item.Loc_at,
        stk_min_at: item.Stk_min_at,
        stk_in_at: item.Stk_in_at,
        designation_at: item.Designation_at,
        enstock_at: item.EnStock_at
      });
    });
    
    // Fusionner les données
    const formattedResult = stocks.map(stock => {
      const stkAtData = stkAtMap.get(stock.Reference);
      
      const quantiteStkAt = stkAtData?.quantite_at || 0;
      const quantiteStock = stock.Quantite || 0;
      
      return {
        Reference: stock.Reference || '',
        Designation: stock.Designation || '',
        Emplacement_principal: stock.Emplacement || '',
        EnStock: stock.EnStock || '',
        RefCategorie: stock.RefCategorie || '',
        PMatiere: stock.PMatiere || 0,
        Marge: stock.Marge || 0,
        Taxe: stock.Taxe || 0,
        Quantite_stock: quantiteStock,
        Quantite_stk_at: quantiteStkAt,
        Quantite_restante: quantiteStock - quantiteStkAt,
        Seuil: stock.Seuil || 0,
        Emplacement_bejaia: stkAtData?.loc_at || null,
        Seuil_bejaia: stkAtData?.stk_min_at || null,
        Designation_bejaia: stkAtData?.designation_at || null,
        EnStock_bejaia: stkAtData?.enstock_at || null
      };
    });
    
    return formattedResult;
  } catch (error) {
    console.error("Erreur dans getStockRestant:", error);
    throw new Error("Impossible de récupérer les données du stock restant");
  }
}
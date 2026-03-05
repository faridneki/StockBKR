import { Stock as Prismastock } from "@prisma/client";
import {stk_at as Prismastk_at } from "@prisma/client";

export interface Stock extends Prismastock {}
export interface Stk_at extends Prismastk_at {}
export interface StockData {
  Reference: String;
  Designation: String;
  Emplacement: String;
  EnStock: String;
  RefCategorie: String;
  PMatiere: Number;
  Marge: Number;
  Taxe: Number;
  Quantite: Number;
  Seuil: Number;
}
export interface StockAtData {
  Ref_at: String;
  Designation_at: String;
  Loc_at: String;
  EnStock_at: String;
  Quantite_at: Number;
  Stk_min_at: Number;
  Stk_in_at: Number;
}

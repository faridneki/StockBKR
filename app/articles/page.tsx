"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  Box,
} from "lucide-react";
import Wrapper from "../components/Wrapper";
import { useAuth } from "../context/AuthContext";
import { getStkAtWithPricing } from "@/app/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface StkAtWithPricing {
  Designation_stock: string;
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

const StkAtPricingPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<StkAtWithPricing[]>([]);
  const [filteredItems, setFilteredItems] = useState<StkAtWithPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState<string>("tous");
  const [stockFilter, setStockFilter] = useState<string>("tous");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const searchOptions = [
    { value: "tous", label: "Tous les critères" },
    { value: "reference", label: "Référence" },
    { value: "designation", label: "Désignation" },
    { value: "emplacement", label: "Emplacement" },
  ];

  const stockOptions = [
    { value: "tous", label: "Tous les articles" },
    { value: "avec_prix", label: "Avec prix de vente" },
    { value: "sans_prix", label: "Sans prix (non trouvé dans stock)" },
    { value: "en_stock", label: "En stock (EnStock_at = 1)" },
  ];

  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = items;

    if (searchTerm.trim()) {
      const value = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        switch (searchFilter) {
          case "reference":
            return item.Ref_at?.toLowerCase().includes(value);
          case "designation":
            return item.Designation_at?.toLowerCase().includes(value);
          case "emplacement":
            return item.Loc_at?.toLowerCase().includes(value);
          case "tous":
          default:
            return (
              item.Ref_at?.toLowerCase().includes(value) ||
              item.Designation_at?.toLowerCase().includes(value) ||
              item.Loc_at?.toLowerCase().includes(value)
            );
        }
      });
    }

    

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, searchFilter, stockFilter, items]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getStkAtWithPricing();
      setItems(data as StkAtWithPricing[]);
setFilteredItems(data as StkAtWithPricing[]);
    } catch (error) {
      console.error("Erreur chargement stk_at:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchFilter("tous");
    setStockFilter("tous");
    setFilteredItems(items);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedItems = filteredItems.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatPrix = (prix: number | null) => {
    if (prix === null || prix === undefined) return "-";
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(prix);
  };

  const calculerPrixHT = (pMatiere: number | null, marge: number | null) => {
    if (pMatiere === null || marge === null) return null;
    return pMatiere + (pMatiere * marge) / 100;
  };

  const calculerPrixTTC = (prixHT: number | null, taxe: number | null) => {
    if (prixHT === null || taxe === null) return null;
    return prixHT + (prixHT * taxe) / 100;
  };

  const stats = {
    total: items.length,
    avecPrix: items.filter((i) => i.PrixTTC !== null).length,
    sansPrix: items.filter((i) => i.PrixTTC === null).length,
    valeurStock: items.reduce((acc, item) => {
      const prix = item.PrixTTC || 0;
      const qte = item.Quantite_at || 0;
      return acc + prix * qte;
    }, 0),
  };

  // Afficher loading pendant la vérification auth
  if (authLoading || !user) {
    return (
      <Wrapper>
        <div className="loading-screen">
          <div className="loading-content">
            <RefreshCw className="spinner" />
            <p className="loading-text">
              Chargement des données stk_at avec tarification...
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <div className="stkat-page">
        <div className="stkat-header">
          <h1 className="stkat-title">
            <ArrowLeftRight size={32} />
            Vue sur Stock Béjaia
          </h1>

          <p className="stock-subtitle">
            {filteredItems.length} Article(s) trouvé(s)
          </p>
        </div>

        <div className="search-bar">
          <div className="search-row">
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="search-select"
            >
              {searchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={`Rechercher...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={resetSearch} className="search-clear">
                  <X size={20} />
                </button>
              )}
            </div>

            

            <button onClick={loadData} className="btn">
              <RefreshCw size={16} />
              Actualiser
            </button>
          </div>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Désignation</th>
                  <th style={{ textAlign: "center", color: "var(--green)" }}>
                    Qté
                  </th>
                  <th style={{ textAlign: "left", color: "var(--pink)" }}>
                    Localisation
                  </th>

                  <th style={{ textAlign: "center" }}>Seuil Min</th>
                  <th style={{ textAlign: "right" }}>Prix Matière</th>
                  <th style={{ textAlign: "center" }}>Marge %</th>
                  <th style={{ textAlign: "center" }}>Taxe %</th>
                  <th style={{ textAlign: "right", color: "var(--green)" }}>
                    Prix HT
                  </th>
                  <th style={{ textAlign: "right", color: "var(--pink)" }}>
                    Prix TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.length > 0 ? (
                  displayedItems.map((item) => {
                    const prixHT = calculerPrixHT(item.PMatiere, item.Marge);
                    const prixTTC = calculerPrixTTC(prixHT, item.Taxe);
                    const hasPricing = item.PMatiere !== null;
                    const isLowStock =
                      (item.Quantite_at || 0) < (item.Stk_min_at || 0);

                    return (
                      <tr
                        key={item.Ref_at}
                        className={!hasPricing ? "row-dimmed" : ""}
                      >
                        <td className="cell-ref-at">{item.Ref_at}</td>
                        <td
                          className="cell-designation"
                          title={item.Designation_stock || ""}
                        >
                          {item.Designation_stock || "-"}
                        </td>
                        <td
                          className={`cell-qty-at ${isLowStock ? "low" : "normal"}`}
                        >
                          {item.Quantite_at || 0}
                        </td>

                       <td className="cell-price-ttc" style={{ textAlign: "center" }}>
                          <span className="price-ttc-badge ">
                            {item.Loc_at || "-"}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                          }}
                        >
                          {item.Stk_min_at || "-"}
                        </td>
                        <td className="cell-pm">{formatPrix(item.PMatiere)}</td>
                        <td className="cell-marge">
                          {item.Marge ? `${item.Marge}%` : "-"}
                        </td>
                        <td className="cell-taxe">
                          {item.Taxe ? `${item.Taxe}%` : "-"}
                        </td>
                        <td className="cell-price-ht">{formatPrix(prixHT)}</td>
                        <td className="cell-price-ttc">
                          <span className="price-ttc-badge">
                            {formatPrix(prixTTC)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">
                        <Search className="empty-icon" />
                        <p className="empty-title">Aucun article trouvé</p>
                        <p className="empty-subtitle">
                          Essayez de modifier vos critères de recherche
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Affichage de <strong>{startIndex + 1}</strong> à{" "}
                <strong>{Math.min(endIndex, filteredItems.length)}</strong> sur{" "}
                <strong>{filteredItems.length}</strong> résultats
              </div>
              <div className="pagination-nav">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="page-indicator">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </Wrapper>
  );
};

export default StkAtPricingPage;

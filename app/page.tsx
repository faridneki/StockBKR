"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Warehouse,
  AlertTriangle,
  TrendingDown,
  Package,
} from "lucide-react";
import Wrapper from "@/app/components/Wrapper";
import { useAuth } from "@/app/context/AuthContext";
import { getStockRestant } from "@/app/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Types
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
 Emplacement_bejaia: string | null;
  Seuil_secondaire: number |  null;
  Designation_at: string | null;
  EnStock_at: string | null;
}

const StocksPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stocks, setStocks] = useState<StockRestant[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockRestant[]>([]);
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

  const filterOptions = [
    { value: "tous", label: "Tous les articles" },
    { value: "alerte", label: "Stock Global en alerte" },
    { value: "stockminbejaia", label: "Stock Béjaia en alerte" },
    { value: "disponible", label: "Articles dispo Global" },
    { value: "epuise", label: "Articles Non dispo Global" },
    { value: "transfert", label: "Articles dispo Béjaia" },
    
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
    let filtered = [...stocks];

    // Filtre par recherche
    if (searchTerm.trim()) {
      const value = searchTerm.toLowerCase();
      filtered = filtered.filter((stock) => {
        switch (searchFilter) {
          case "reference":
            return stock.Reference?.toLowerCase().includes(value);
          case "designation":
            return stock.Designation?.toLowerCase().includes(value);
          case "emplacement":
            return (
              stock.Emplacement_principal?.toLowerCase().includes(value) ||
              stock.Emplacement_bejaia?.toLowerCase().includes(value)
            );
          case "tous":
          default:
            return (
              stock.Reference?.toLowerCase().includes(value) ||
              stock.Designation?.toLowerCase().includes(value) ||
              stock.Emplacement_principal?.toLowerCase().includes(value) ||
              stock.Emplacement_bejaia?.toLowerCase().includes(value)
            );
        }
      });
    }

    // Filtre par état du stock
    switch (stockFilter) {
      case "alerte":
        filtered = filtered.filter(
          (stock) => stock.Quantite_stock < stock.Seuil
        );
        break;
      case "disponible":
        filtered = filtered.filter((stock) => stock.Quantite_stock > 0);
        break;
      case "epuise":
        filtered = filtered.filter((stock) => stock.Quantite_stock === 0);
        break;
      case "transfert":
        filtered = filtered.filter((stock) => stock.Quantite_stk_at > 0);
        break;
      case "stockminbejaia":
        filtered = filtered.filter((stock) => stock.Quantite_stk_at < stock.Seuil_bejaia !); 
        break;  
      default:
        break;
    }

    setFilteredStocks(filtered);
    setCurrentPage(1);
  }, [searchTerm, searchFilter, stockFilter, stocks]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getStockRestant();
      setStocks(data as any[]);
      setFilteredStocks(data as any[]);
    } catch (error) {
      console.error("Erreur chargement stock restant:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchFilter("tous");
    setStockFilter("tous");
    setFilteredStocks(stocks);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredStocks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedStocks = filteredStocks.slice(startIndex, endIndex);

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

  const calculerPrixHT = (pMatiere: number | null, marge: number | null) => {
    if (pMatiere === null || marge === null) return null;
    return pMatiere + (pMatiere * marge) / 100;
  };

  const calculerPrixTTC = (prixHT: number | null, taxe: number | null) => {
    if (prixHT === null || taxe === null) return null;
    return prixHT + (prixHT * taxe) / 100;
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(prix || 0);
  };

  const getStockStatus = (restant: number, seuil: number) => {
    if (restant <= 0) return { class: "epuise", text: "Épuisé" };
    if (restant < seuil) return { class: "alerte", text: "Stock bas" };
    return { class: "normal", text: "Normal" };
  };

  // Calcul des statistiques
  const stats = {
    total: stocks.length,
    valeurTotale: stocks.reduce((acc, stock) => {
      const prixHT = calculerPrixHT(stock.PMatiere, stock.Marge);
      const prixTTC = calculerPrixTTC(prixHT, stock.Taxe);
      return acc + (prixTTC || 0) * stock.Quantite_restante;
    }, 0),
    enAlerte: stocks.filter((s) => s.Quantite_restante < s.Seuil).length,
    transferes: stocks.filter((s) => s.Quantite_stk_at > 0).length,
    quantiteTotale: stocks.reduce((acc, s) => acc + s.Quantite_restante, 0),
  };

  // Afficher loading pendant la vérification auth
  if (authLoading || !user) {
    return (
      <Wrapper>
        <div className="loading-screen">
          <div className="loading-content">
            <RefreshCw className="spinner" />
            <p className="loading-text">Chargement du stock restant...</p>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="stock-restant-page">
         <div className="logo-wrapper">
            
              
              
                              
                <span className="logo-subtitle"style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#50fa7b" }} >
                  ⴰⵏⵚⵓⴼ ⵢⵉⵙ ⵡⴻⵏ
                </span>
                <span className="stock-subtitle" style={{ alignContent: "right" }}> {filteredStocks.length} Article(s) trouvé(s)</span>
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
                placeholder="Rechercher..."
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

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="search-select filter-select"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

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
                  <th style={{ textAlign: "center", color: "var(--red)", fontWeight: "bold" }}>
                  Référence</th>
                  <th style={{ textAlign: "center", color: "var(--purple)" }}>
                    Désignation</th>
                  <th style={{ textAlign: "center", color: "var(--blue)" }}>
                    Qté Globale
                  </th>
                   <th style={{ textAlign: "center", color: "var(--green)" }}>
                    Qté Takarietz
                  </th>
                  <th style={{ textAlign: "center", color: "var(--orange)" }}>
                    Qté Béjaia
                  </th>
                 
                  
                  <th style={{ textAlign: "center", color: "#e61089" }}>Takarietz Loc.</th>
                  <th style={{ textAlign: "center", color: "#e0f406" }}>Béjaia Loc.</th>                 
                  <th style={{ textAlign: "right", color: "var(--green)" }}>
                    Prix HT
                  </th>
                  <th style={{ textAlign: "right", color: "#e61089" }}>
                    Prix TTC
                  </th>
                  <th style={{ textAlign: "center" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {displayedStocks.length > 0 ? (
                  displayedStocks.map((stock) => {
                    const prixHT = calculerPrixHT(stock.PMatiere, stock.Marge);
                    const prixTTC = calculerPrixTTC(prixHT, stock.Taxe);
                    const hasPricing = stock.PMatiere !== null;
                    const status = getStockStatus(
                      stock.Quantite_restante,
                      stock.Seuil
                    );

                    return (
                      <tr
                        key={stock.Reference}
                        className={
                          !hasPricing
                            ? "row-dimmed"
                            : status.class === "alerte"
                            ? "row-warning"
                            : status.class === "epuise"
                            ? "row-danger"
                            : ""
                        }
                      >
                        <td className="price-ttc-badge">{stock.Reference}</td>
                        <td
                          className="cell-designation"
                          title={stock.Designation || ""}
                        >
                          {stock.Designation || "-"}
                        </td>
                         <td className="cell-qty" >
                          <span className="badge-qty">
                            {stock.Quantite_stock || 0}
                          </span>
                        </td>
                         <td
                          className="cell-qty-restant"
                          style={{ textAlign: "center" }}
                        >
                          <span
                            className={`badge-restant ${status.class}`}
                            title={`Seuil: ${stock.Seuil}`}
                          >
                            {stock.Quantite_restante || 0}
                          </span>
                        </td>


                        <td className="cell-qty-at" style={{ textAlign: "center" }}>
                          <span
                            className={`badge-qty ${stock.Quantite_stk_at > 0 ? "transfered" : ""}`}
                          >
                            {stock.Quantite_stk_at || 0}
                          </span>
                        </td>
                       
                        
                        <td style={{ textAlign: "center" }}>
                          <span className="location-badge">
                            {stock.Emplacement_principal || "-"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="location-badge secondary">
                            {stock.Emplacement_bejaia || "-"}
                          </span>
                        </td>
                       
                        <td className="cell-price-ht">
                          {formatPrix(prixHT || 0)}
                        </td>
                        <td className="cell-price-ttc">
                          <span className="price-ttc-badge">
                            {formatPrix(prixTTC || 0)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13}>
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
                <strong>{Math.min(endIndex, filteredStocks.length)}</strong> sur{" "}
                <strong>{filteredStocks.length}</strong> résultats
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

export default StocksPage;
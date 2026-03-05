"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
} from "lucide-react";
import Wrapper from "@/app/components/Wrapper";
import { useAuth } from "@/app/context/AuthContext";
import { getStocks } from "@/app/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Types
interface Stock {
  Reference: string;
  Designation: string;
  Emplacement: string;
  EnStock: string;
  RefCategorie: string;
  PMatiere: number;
  Marge: number;
  Taxe: number;
  Quantite: number;
  Seuil: number;
}

const StocksPage = () => {
  const { user, isLoading: authLoading } = useAuth(); // Remplace useUser de Clerk
  const router = useRouter();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState<string>("tous");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const searchOptions = [
    { value: "tous", label: "Tous les critères" },
    { value: "reference", label: "Référence" },
    { value: "designation", label: "Désignation" },
  ];

  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadStocks();
    }
  }, [user]);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await getStocks();
      setStocks(data as Stock[]);
setFilteredStocks(data as Stock[]);
    } catch (error) {
      console.error("Erreur chargement stocks:", error);
      toast.error("Erreur lors du chargement des stocks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1);

    if (!value.trim()) {
      setFilteredStocks(stocks);
      return;
    }

    const filtered = stocks.filter((stock) => {
      switch (searchFilter) {
        case "reference":
          return stock.Reference?.toLowerCase().includes(value);
        case "designation":
          return stock.Designation?.toLowerCase().includes(value);
        case "tous":
        default:
          return (
            stock.Reference?.toLowerCase().includes(value) ||
            stock.Designation?.toLowerCase().includes(value)
          );
      }
    });

    setFilteredStocks(filtered);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setFilteredStocks(stocks);
    setCurrentPage(1);
    setSearchFilter("tous");
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(prix || 0);
  };

  // Afficher loading pendant la vérification auth
  if (authLoading || !user) {
    return (
      <Wrapper>
        <div className="loading-screen">
          <div className="loading-content">
            <RefreshCw className="spinner" />
            <p className="loading-text">Chargement...</p>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="stock-page">
        <div className="stock-header">
          <h1 className="stock-title">
            <Package size={32} />
            Vue sur Stock Général
          </h1>
          <p className="stock-subtitle">
            {filteredStocks.length} Article(s) trouvé(s)
          </p>
        </div>

        <div className="search-bar">
          <div className="search-row">
            <select
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setSearchTerm("");
                setFilteredStocks(stocks);
              }}
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
                placeholder={`Rechercher par ${searchOptions.find((opt) => opt.value === searchFilter)?.label.toLowerCase()}...`}
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={resetSearch} className="search-clear">
                  <X size={20} />
                </button>
              )}
            </div>

            <button onClick={loadStocks} className="btn">
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
                  <th style={{ textAlign: "center", color: "var(--pink)" }}>
                    Localisation
                  </th>
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
                {displayedStocks.length > 0 ? (
                  displayedStocks.map((stock) => {
                    const prixHT = calculerPrixHT(stock.PMatiere, stock.Marge);
                    const prixTTC = calculerPrixTTC(prixHT, stock.Taxe);
                    const hasPricing = stock.PMatiere !== null;

                    return (
                      <tr
                        key={stock.Reference}
                        className={!hasPricing ? "row-dimmed" : ""}
                      >
                        <td className="cell-ref-at">{stock.Reference}</td>
                        <td
                          className="cell-designation"
                          title={stock.Designation || ""}
                        >
                          {stock.Designation || "-"}
                        </td>
                        <td className="cell-qty" >
                          <span className="badge-qty">
                            {stock.Quantite || 0}
                          </span>
                        </td>
                        <td className="cell-price-ttc" style={{ textAlign: "center" }}>
                          <span className="price-ttc-badge ">
                            {stock.Emplacement || "-"}
                          </span>
                        </td>
                        <td className="cell-pm">
                          {formatPrix(stock.PMatiere)}
                        </td>
                        <td className="cell-marge">
                          {stock.Marge ? `${stock.Marge}%` : "-"}
                        </td>
                        <td className="cell-taxe">
                          {stock.Taxe ? `${stock.Taxe}%` : "-"}
                        </td>
                        <td className="cell-price-ht">
                          {formatPrix(prixHT || 0)}
                        </td>
                        <td className="cell-price-ttc">
                          <span className="price-ttc-badge">
                            {formatPrix(prixTTC || 0)}
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

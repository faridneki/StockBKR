"use client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileSpreadsheet } from 'lucide-react';
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
  LogOut,
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
  Seuil_secondaire: number | null;
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
  const [sessionError, setSessionError] = useState<string | null>(null);

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

  // Vérifier si l'utilisateur est toujours authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      setSessionError("Session expirée");
    } else {
      setSessionError(null);
    }
  }, [user, authLoading]);

  // Rediriger vers login si non authentifié après un délai
  useEffect(() => {
    if (sessionError) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 5000); // Redirection après 5 secondes
      return () => clearTimeout(timer);
    }
  }, [sessionError, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await getStockRestant();
      setStocks(data as any[]);
      setFilteredStocks(data as any[]);
    } catch (error: any) {
      console.error("Erreur chargement stock restant:", error);
      
      // Si l'erreur est liée à l'authentification
      if (error.message?.includes('token') || error.message?.includes('session')) {
        setSessionError("Session expirée");
      } else {
        toast.error("Erreur lors du chargement des données");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        filtered = filtered.filter((stock) => 
          stock.Quantite_stk_at < (stock.Seuil_bejaia || 0)
        ); 
        break;  
      default:
        break;
    }

    setFilteredStocks(filtered);
    setCurrentPage(1);
  }, [searchTerm, searchFilter, stockFilter, stocks]);

  const resetSearch = () => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
    setSearchTerm("");
    setSearchFilter("tous");
    setStockFilter("tous");
    setFilteredStocks(stocks);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
    loadData();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
    setStockFilter(e.target.value);
  };

  const handleSearchFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
    setSearchFilter(e.target.value);
  };

  const handleReconnect = () => {
    router.push('/login');
  };

  const totalPages = Math.ceil(filteredStocks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedStocks = filteredStocks.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (!user) {
      setSessionError("Session expirée");
      return;
    }
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
const exportToExcel = () => {
  try {
    if (filteredStocks.length === 0) {
      toast.warning("Aucune donnée à exporter");
      return;
    }

    // Préparer les données pour Excel
    const excelData = filteredStocks.map((stock, index) => ({
      'N°': index + 1,
      'Référence': stock.Reference || '',
      'Désignation': stock.Designation || '',
      'Qté Globale': stock.Quantite_stock || 0,
      'Qté Takarietz': stock.Quantite_restante || 0,
      'Qté Béjaia': stock.Quantite_stk_at || 0,
      'Localisation Takarietz': stock.Emplacement_principal || '-',
      
    }));

    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 5 },   // N°
      { wch: 15 },  // Référence
      { wch: 40 },  // Désignation
      { wch: 10 },  // Qté Globale
      { wch: 12 },  // Qté Takarietz
      { wch: 10 },  // Qté Béjaia
      { wch: 18 },  // Localisation Takarietz
     
    ];
    ws['!cols'] = colWidths;

    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Nom du fichier avec la date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `stock_${date}_${filteredStocks.length}_articles.xlsx`;
    
    // Sauvegarder le fichier
    saveAs(data, fileName);
    
    toast.success(`${filteredStocks.length} articles exportés avec succès`);
  } catch (error) {
    console.error("Erreur export Excel:", error);
    toast.error("Erreur lors de l'export Excel");
  }
};
  // Afficher loading pendant la vérification auth
  if (authLoading) {
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

  // Afficher message d'erreur de session
  if (sessionError) {
    return (
      <Wrapper>
        <div className="session-error-container">
          <div className="session-error-card">
            <div className="session-error-icon">
              <LogOut size={48} />
            </div>
            <h2 className="session-error-title">Session déconnectée</h2>
            <p className="session-error-message">
              {sessionError}
            </p>
            <p className="session-error-description">
              Votre session a expiré. Redirection vers la page de connexion dans 5 secondes...
            </p>
            <button onClick={handleReconnect} className="session-error-button">
              Se reconnecter maintenant
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (la redirection se fera)
  if (!user) {
    return null;
  }

  return (
    <Wrapper>
      <div className="stock-restant-page">
       

        {/* Stats Grid */}
        <div className="stats-grid">
          
          
         <div className="stat-card">
            
            <div className="stat-info">              
              <span className="stat-value warning">ⴰⵏⵚⵓⴼ ⵢⵉⵙ ⵡⴻⵏ</span>
            </div>
          </div>
          <div className="stat-card">
           
            <div className="stat-info">
              
              <span className="stat-value info">{filteredStocks.length} Article(s) trouvé(s)</span>
            </div>
          </div>
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

  {/* Nouveau bouton Excel */}
  <button onClick={exportToExcel} className="btn btn-excel">
    <FileSpreadsheet size={16} />
    Tableau vers Excel
  </button>
</div>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "center", color: "var(--red)", fontWeight: "bold" }}>
                    Référence
                  </th>
                  <th style={{ textAlign: "center", color: "var(--purple)" }}>
                    Désignation
                  </th>
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
                  
                  <th style={{ textAlign: "right", color: "#e61089" }}>
                    Prix TTC
                  </th>
                  <th style={{ textAlign: "center" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="loading-state">
                        <RefreshCw className="spinner" size={32} />
                        <p>Chargement des données...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayedStocks.length > 0 ? (
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
                        <td className="cell-qty">
                          <span className="badge-qty">
                            {stock.Quantite_stock || 0}
                          </span>
                        </td>
                        <td className="cell-qty-restant" style={{ textAlign: "center" }}>
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
                    <td colSpan={10}>
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
                  disabled={currentPage === 1 || isLoading}
                  className="page-btn"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="page-indicator">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || isLoading}
                  className="page-btn"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .session-error-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .session-error-card {
          background: var(--bg-secondary);
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-color);
        }

        .session-error-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: rgba(255, 85, 85, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--red);
        }

        .session-error-title {
          font-size: 1.5rem;
          color: var(--red);
          margin-bottom: 1rem;
        }

        .session-error-message {
          color: var(--text-primary);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .session-error-description {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .session-error-button {
          background: linear-gradient(135deg, var(--red) 0%, var(--pink) 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .session-error-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 85, 85, 0.3);
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .loading-state .spinner {
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
          color: var(--pink);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Wrapper>
  );
};

export default StocksPage;
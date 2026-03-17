"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Power,
  PowerOff,
  Trash2,
  Mail,
  Calendar,
  UserCog,
  ArrowLeft,
  Home,
} from "lucide-react";
import Wrapper from "@/app/components/Wrapper";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

// Server Actions
import {
  getUsers,
  toggleUserStatus,
  deleteUser,
  changeUserRole,
} from "@/app/actions/admin";

interface Utilisateur {
  id: number;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  actif: boolean;
  maxSessions: number;
  created_at: Date;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  activeTokens: string[];
}

const AdminUsersPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Utilisateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState<string>("tous");
  const [filterStatus, setFilterStatus] = useState<string>("tous");

  const rowsPerPage = 10;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
      toast.error("Accès non autorisé");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await getUsers();
      if (result.success) {
        setUsers(result.users);
        setFilteredUsers(result.users);
      } else {
        toast.error(result.error || "Erreur chargement");
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm.trim()) {
      const value = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(value) ||
          u.nom?.toLowerCase().includes(value) ||
          u.prenom?.toLowerCase().includes(value)
      );
    }

    if (filterRole !== "tous") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    if (filterStatus !== "tous") {
      filtered = filtered.filter((u) => 
        filterStatus === "actif" ? u.actif : !u.actif
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, users]);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const result = await toggleUserStatus(userId, !currentStatus);
      if (result.success) {
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, actif: !currentStatus } : u
          )
        );
        toast.success(`Utilisateur ${!currentStatus ? "activé" : "désactivé"}`);
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async (userId: number, userEmail: string) => {
    if (!confirm(`Supprimer l'utilisateur ${userEmail} ?`)) return;

    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(users.filter((u) => u.id !== userId));
        toast.success("Utilisateur supprimé");
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      const result = await changeUserRole(userId, newRole);
      if (result.success) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success("Rôle modifié");
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);

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

  return (
    <Wrapper>
      <div className="admin-users-page">
        {/* En-tête avec bouton de retour */}
        <div className="page-header">
          <div className="header-top">
  <Link href="/" className="back-button">
    <ArrowLeft size={18} />
    <span>Accueil</span>
  </Link>
</div>
          
          <div className="header-title">
            <h1 className="page-title">
              <Users size={32} />
              Gestion des utilisateurs
            </h1>
            <p className="page-subtitle">
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="filters-bar">
          <div className="search-row">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher par email, nom, prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="search-clear"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="tous">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>

            <button onClick={loadUsers} className="btn" title="Actualiser">
              <RefreshCw size={16} className={isLoading ? "spinning" : ""} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Sessions</th>
                  <th>Dernière connexion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="loading-state">
                        <RefreshCw className="spinner" />
                        <p>Chargement des utilisateurs...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayedUsers.length > 0 ? (
                  displayedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="cell-with-icon">
                          <Mail size={14} />
                          {u.email}
                        </div>
                      </td>
                      <td>{u.nom || "-"}</td>
                      <td>{u.prenom || "-"}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="role-select"
                          disabled={u.id === user?.id}
                          title={u.id === user?.id ? "Vous ne pouvez pas modifier votre propre rôle" : ""}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${u.actif ? "active" : "inactive"}`}>
                          {u.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="sessions-cell">
                        <span className={`sessions-count ${(u.activeTokens?.length || 0) >= u.maxSessions ? "full" : ""}`}>
                          {u.activeTokens?.length || 0}/{u.maxSessions}
                        </span>
                      </td>
                      <td>
                        {u.lastLoginAt ? (
                          <div className="last-login">
                            <Calendar size={12} />
                            <span>{new Date(u.lastLoginAt).toLocaleDateString()}</span>
                            {u.lastLoginIp && (
                              <small className="login-ip">{u.lastLoginIp}</small>
                            )}
                          </div>
                        ) : (
                          <span className="never-login">Jamais connecté</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.actif)}
                            className={`action-btn ${u.actif ? "warning" : "success"}`}
                            title={u.actif ? "Désactiver" : "Activer"}
                            disabled={u.id === user?.id}
                          >
                            {u.actif ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            className="action-btn danger"
                            title="Supprimer"
                            disabled={u.id === user?.id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <Users size={48} />
                        <p className="empty-title">Aucun utilisateur trouvé</p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Affichage <strong>{startIndex + 1}</strong> à{" "}
                <strong>{Math.min(endIndex, filteredUsers.length)}</strong> sur{" "}
                <strong>{filteredUsers.length}</strong> utilisateurs
              </div>
              <div className="pagination-nav">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="page-indicator">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
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

      <style jsx>{`
        .admin-users-page {
          padding: 1.5rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .header-top {
          margin-bottom: 1rem;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #eb1765ff;
          color: #8be9fd;
          border: 1px solid #eb5e17ff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: var(--bg-tertiary);
          color: #f8f8f2;
          transform: translateX(-2px);
        }

        .header-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--green);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }

        .page-subtitle {
          color: var(--purple);
          font-size: 1rem;
          margin: 0;
        }

        .filters-bar {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }

        .search-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-wrapper {
          flex: 2;
          min-width: 250px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          width: 1.25rem;
          height: 1.25rem;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 2.5rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--pink);
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-clear:hover {
          color: var(--pink);
        }

        .filter-select {
          flex: 1;
          min-width: 150px;
          padding: 0.5rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .filter-select:hover,
        .filter-select:focus {
          border-color: var(--pink);
          outline: none;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .btn:hover {
          background: var(--pink);
          color: var(--bg-primary);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .table-container {
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--purple);
          background: var(--bg-primary);
          white-space: nowrap;
        }

        .data-table td {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .data-table tbody tr:hover {
          background: var(--bg-hover);
        }

        .cell-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .role-select {
          padding: 0.25rem 0.5rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .role-select:hover:not(:disabled) {
          border-color: var(--pink);
        }

        .role-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: rgba(80, 250, 123, 0.2);
          color: var(--green);
        }

        .status-badge.inactive {
          background: rgba(255, 85, 85, 0.2);
          color: var(--red);
        }

        .sessions-cell {
          text-align: center;
        }

        .sessions-count {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .sessions-count.full {
          color: var(--yellow);
        }

        .last-login {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
        }

        .login-ip {
          color: var(--text-muted);
          font-size: 0.7rem;
        }

        .never-login {
          color: var(--text-muted);
          font-style: italic;
          font-size: 0.8rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-start;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .action-btn.success:hover:not(:disabled) {
          background: rgba(80, 250, 123, 0.2);
          color: var(--green);
        }

        .action-btn.warning:hover:not(:disabled) {
          background: rgba(255, 184, 108, 0.2);
          color: var(--yellow);
        }

        .action-btn.danger:hover:not(:disabled) {
          background: rgba(255, 85, 85, 0.2);
          color: var(--red);
        }

        .action-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .loading-state .spinner {
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
          width: 32px;
          height: 32px;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.125rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-subtitle {
          font-size: 0.875rem;
          color: var(--purple);
        }

        .pagination {
          background: var(--bg-primary);
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          color: var(--purple);
          font-size: 0.875rem;
        }

        .pagination-info strong {
          color: var(--pink);
        }

        .pagination-nav {
          display: flex;
          gap: 0;
        }

        .page-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:first-child {
          border-radius: 6px 0 0 6px;
        }

        .page-btn:last-child {
          border-radius: 0 6px 6px 0;
        }

        .page-btn:hover:not(:disabled) {
          background: var(--pink);
          color: var(--bg-primary);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-indicator {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          font-size: 0.875rem;
        }
      `}</style>
    </Wrapper>
  );
};

export default AdminUsersPage;
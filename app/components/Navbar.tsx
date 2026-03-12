"use client";

import { LayoutDashboard, Atom, PackagePlus, Menu, X, LogOut, Car, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isLoading, sessionCount, logoutAllDevices } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href) && href !== "/";
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleLogoutAllDevices = async () => {
    await logoutAllDevices();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-inner">
            <div className="logo-wrapper">
              <div className="logo-icon-box">
                <PackagePlus className="logo-icon" />
              </div>
              <div className="logo-text">
                <span className="logo-title">Stock</span>
                <span className="logo-subtitle">Réalisé par </span>
                <span className="stock-subtitle"> Farid Ben </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-inner">
            <Link href="/login" className="logo-wrapper">
              <div className="logo-icon-box">
                <PackagePlus className="logo-icon" />
              </div>
              <div className="logo-text">
                <span className="logo-title">Stock</span>
                <span className="logo-subtitle">Réalisé par </span>
                <span className="stock-subtitle"> Farid Benazzouz</span>
              </div>
            </Link>
            <div className="navbar-right">
              <Link href="/login" className="btn">
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          
          {/* Logo et Navigation Desktop */}
          <div className="navbar-brand">
            <div className="logo-wrapper">
              <div>
                <Car style={{ textAlign: "left", color: "var(--green)" }} />
              </div>
              <div className="logo-text">
                <span className="logo-title">Stock</span>
                <span className="logo-subtitle">Réalisé par </span>                
              </div>
              
              <div className="logo-text">                
                <span className="logo-subtitle">SARL Bekkour & CIE</span>                
                <span className="stock-subtitle"> Farid Benazzouz </span>
              </div>
              <div>
                <Car style={{ textAlign: "left", color: "var(--green)" }} />
              </div>
            </div>
            
            {/* Navigation Desktop */}
            <div className="nav-desktop"></div>
          </div>

          {/* Côté droit */}
          <div className="navbar-right">
            {/* User menu desktop avec indicateur de sessions */}
            <div className="user-menu-desktop">
              <div className="user-info-wrapper">
                <div className="user-details">
                  <div className="user-name">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="user-email">{user.email}</div>
                  <div className="session-indicator">
                    <Users size={14} />
                    <span>Sessions: {sessionCount}/2</span>
                  </div>
                </div>
                
                {/* Menu déroulant pour les options de déconnexion */}
                <div className="session-menu-container">
                  <button 
                    onClick={() => setShowSessionMenu(!showSessionMenu)}
                    className="btn session-menu-btn"
                    title="Options de session"
                  >
                    <ShieldCheck size={18} />
                  </button>
                  
                  {showSessionMenu && (
                    <div className="session-dropdown">
                      <button onClick={handleLogout} className="session-dropdown-item">
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </button>
                      <button onClick={handleLogoutAllDevices} className="session-dropdown-item">
                        <Users size={16} />
                        <span>Déconnecter tous les appareils</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div 
        className={`mobile-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      
      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-header-top">
            <div className="mobile-logo-wrapper">
              <div className="mobile-logo-icon-box">
                <PackagePlus className="mobile-logo-icon" />
              </div>
              <span className="mobile-logo-text">Stock</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="mobile-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mobile-user-info">
            <div className="mobile-user-details">
              <div className="mobile-user-name">
                {user.prenom} {user.nom}
              </div>
              <div className="mobile-user-email">{user.email}</div>
              <div className="mobile-session-indicator">
                <Users size={14} />
                <span>Sessions actives: {sessionCount}/2</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mobile-nav-links">
          {/* Options de déconnexion pour mobile */}
          <button
            onClick={handleLogout}
            className="nav-link mobile-logout-btn"
            style={{ color: 'var(--red)' }}
          >
            <div className="nav-link-icon-wrapper">
              <LogOut className="nav-link-icon" />
            </div>
            <span>Déconnexion (cet appareil)</span>
          </button>
          
          <button
            onClick={handleLogoutAllDevices}
            className="nav-link mobile-logout-all-btn"
            style={{ color: 'var(--orange)' }}
          >
            <div className="nav-link-icon-wrapper">
              <Users className="nav-link-icon" />
            </div>
            <span>Déconnecter tous les appareils</span>
          </button>
        </div>

        <div className="mobile-menu-footer">
          <div className="mobile-copyright">
            © {new Date().getFullYear()} Stock
          </div>
        </div>
      </div>

      {/* Styles supplémentaires pour l'indicateur de sessions */}
      <style jsx>{`
        .session-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.25rem;
          font-size: 0.7rem;
          color: var(--purple);
          background: rgba(189, 147, 249, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
        }

        .session-menu-container {
          position: relative;
          margin-left: 0.5rem;
        }

        .session-menu-btn {
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .session-menu-btn:hover {
          background: var(--pink);
          color: var(--bg-primary);
        }

        .session-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          min-width: 220px;
          z-index: 1000;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .session-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .session-dropdown-item:first-child {
          border-radius: 8px 8px 0 0;
        }

        .session-dropdown-item:last-child {
          border-radius: 0 0 8px 8px;
        }

        .session-dropdown-item:hover {
          background: var(--bg-hover);
          color: var(--pink);
        }

        .mobile-session-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--purple);
          background: rgba(189, 147, 249, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          width: fit-content;
        }

        .mobile-logout-btn,
        .mobile-logout-all-btn {
          margin: 0.25rem 0;
          border-radius: 8px;
        }

        .mobile-logout-btn:hover {
          background: rgba(255, 85, 85, 0.1);
        }

        .mobile-logout-all-btn:hover {
          background: rgba(255, 184, 108, 0.1);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
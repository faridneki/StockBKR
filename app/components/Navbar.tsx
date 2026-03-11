"use client";

import { LayoutDashboard, Atom, PackagePlus, Menu, X, LogOut, Car } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  

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
              <div >
                <Car style={{ textAlign: "left", color: "var(--green)" }} />
              </div>
              <div className="logo-text">
                <span className="logo-title">Stock</span>
                <span className="logo-subtitle">Réalisé par </span>                
              </div>
              
               <div className="logo-text">                
                <span className="logo-subtitle">SARL Bekkour & CIE</span>                
                <span className="stock-subtitle"> ⴼⴰⵔⵉⴷ ⴱⴻⵏⵢⵣⵣⵓⵣ </span>
              </div>
               <div >
                <Car style={{ textAlign: "left", color: "var(--green)" }} />
              </div>
            </div>
            
            {/* Navigation Desktop */}
            <div className="nav-desktop">
            
            </div>
          </div>

          {/* Côté droit */}
          <div className="navbar-right">
            {/* User menu desktop */}
            <div className="user-menu-desktop">
              <div className="user-info-wrapper">
                <div className="user-details">
                  <div className="user-name">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="user-email">{user.email}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn"
                  style={{ marginLeft: '0.5rem' }}
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
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
            </div>
          </div>
        </div>

        <div className="mobile-nav-links">
      
          
          <button
            onClick={handleLogout}
            className="nav-link"
            style={{ 
              marginTop: 'auto',
              borderTop: '1px solid var(--border-color)',
              color: 'var(--red)'
            }}
          >
            <div className="nav-link-icon-wrapper">
              <LogOut className="nav-link-icon" />
            </div>
            <span>Déconnexion</span>
          </button>
        </div>

        <div className="mobile-menu-footer">
          <div className="mobile-copyright">
            © {new Date().getFullYear()} Stock
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
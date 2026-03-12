"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PackagePlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Warehouse,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="login-page">
      {/* Background décoratif */}
      <div className="login-bg">
        <div className="login-bg-pattern"></div>
        <div className="login-bg-glow"></div>
      </div>

      <div className="login-container">
        {/* Carte principale */}
        <div className="login-card">
          
          {/* En-tête avec logo */}
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon">
                <PackagePlus size={40} />
              </div>
              <div className="login-logo-text">
                <h1>Stock</h1>
                <span>SARL Bekkour & CIE</span>
              </div>
            </div>
            <p className="login-welcome">
              Bienvenue ! Connectez-vous pour accéder à votre espace.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="login-form">
            
            {/* Message d'erreur */}
            {error && (
              <div className="login-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Champ Email */}
            <div className="login-field">
              <label htmlFor="email">
                <Mail size={16} />
                Adresse email
              </label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="login-field">
              <label htmlFor="password">
                <Lock size={16} />
                Mot de passe
              </label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <Link href="/forgot-password" className="login-forgot"style={{ color: "#50fa7b" }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="login-spinner"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Message sur la limitation de sessions */}
          <div className="login-session-info">
            <ShieldCheck size={16} />
            <span>Maximum 2 sessions simultanées par compte</span>
          </div>

          {/* Pied de page */}
          <div className="login-footer" >
            <p>
              Pas encore de compte ?{' '}
              <Link href="/register" className="login-link"style={{ color: "#50fa7b" }}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Informations système */}
        <div className="login-info">
          <div className="login-info-item">
            <Warehouse size={20} />
            <span>Gestion multi-dépôts</span>
          </div>
          <div className="login-info-item">
            <ShieldCheck size={20} />
            <span>Sécurisé & Fiable</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #282a36 0%, #1a1b23 100%);
          position: relative;
          overflow: hidden;
          padding: 2rem;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .login-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(255, 121, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(189, 147, 249, 0.1) 0%, transparent 50%);
        }

        .login-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 121, 198, 0.05) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
        }

        .login-card {
          background: #44475a;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 121, 198, 0.1);
          border: 1px solid #6272a4;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .login-logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ff79c6 0%, #bd93f9 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f8f8f2;
          box-shadow: 0 10px 30px rgba(255, 121, 198, 0.3);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .login-logo-text h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ff79c6;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .login-logo-text span {
          font-size: 0.875rem;
          color: #bd93f9;
          font-weight: 500;
        }

        .login-welcome {
          color: #6272a4;
          font-size: 0.9375rem;
          line-height: 1.5;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          background: rgba(255, 85, 85, 0.1);
          border: 1px solid rgba(255, 85, 85, 0.3);
          border-radius: 8px;
          color: #ff5555;
          font-size: 0.875rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .login-field label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #f8f8f2;
        }

        .login-field label svg {
          color: #bd93f9;
        }

        .login-input-wrapper {
          position: relative;
        }

        .login-input-wrapper input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: #282a36;
          border: 1px solid #6272a4;
          border-radius: 10px;
          color: #f8f8f2;
          font-size: 0.9375rem;
          transition: all 0.2s ease;
        }

        .login-input-wrapper input:focus {
          outline: none;
          border-color: #ff79c6;
          box-shadow: 0 0 0 3px rgba(255, 121, 198, 0.1);
        }

        .login-input-wrapper input::placeholder {
          color: #6272a4;
        }

        .login-input-wrapper input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6272a4;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .login-toggle-password:hover {
          color: #ff79c6;
        }

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .login-remember {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6272a4;
          cursor: pointer;
        }

        .login-remember input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff79c6;
          cursor: pointer;
        }

        .login-forgot {
          color: #f8f8f2;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .login-forgot:hover {
          color: #ff79c6;
        }

        .login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #ff79c6 0%, #bd93f9 100%);
          border: none;
          border-radius: 10px;
          color: #282a36;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(255, 121, 198, 0.3);
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 121, 198, 0.4);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(40, 42, 54, 0.3);
          border-top-color: #282a36;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-session-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(189, 147, 249, 0.1);
          border-radius: 8px;
          color: #bd93f9;
          font-size: 0.875rem;
        }

        .login-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #6272a4;
          text-align: center;
        }

        .login-footer p {
          color: #6272a4;
          font-size: 0.875rem;
          margin: 0;
        }

        .login-link {
          color: #80ff79ff;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .login-link:hover {
          color: #ff92d0;
          text-decoration: underline;
        }

        .login-info {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
          padding: 0 1rem;
        }

        .login-info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6272a4;
          font-size: 0.875rem;
        }

        .login-info-item svg {
          color: #bd93f9;
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 1rem;
          }

          .login-card {
            padding: 1.5rem;
          }

          .login-logo-icon {
            width: 60px;
            height: 60px;
          }

          .login-info {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
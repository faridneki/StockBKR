"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PackagePlus, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, ShieldCheck, CheckCircle2
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', nom: '', prenom: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // FORCER la suppression de tout cookie auth-token existant
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      
      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    // Supprimer encore une fois au cas où, puis redirection
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.replace('/login');
  };

  if (isSuccess) {
    return (
      <div className="register-page">
        <div className="register-bg">
          <div className="register-bg-pattern"></div>
          <div className="register-bg-glow"></div>
        </div>

        <div className="register-container">
          <div className="register-card success-card">
            <div className="success-content">
              <div className="success-icon">
                <CheckCircle2 size={64} />
              </div>
              <h2>Inscription réussie !</h2>
              <p>Votre compte a été créé avec succès.</p>
              <p className="success-hint">Connectez-vous maintenant pour accéder à votre espace.</p>
              
              <button onClick={goToLogin} className="success-button">
                <span>Se connecter</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .register-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #282a36 0%, #1a1b23 100%);
            position: relative;
            overflow: hidden;
            padding: 2rem;
          }
          .register-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
          }
          .register-bg-pattern {
            position: absolute;
            inset: 0;
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(80, 250, 123, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(189, 147, 249, 0.1) 0%, transparent 50%);
          }
          .register-bg-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(80, 250, 123, 0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
          }
          .register-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 480px;
          }
          .register-card {
            background: #44475a;
            border-radius: 16px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(80, 250, 123, 0.2);
            border: 1px solid #6272a4;
          }
          .success-content {
            text-align: center;
          }
          .success-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #50fa7b 0%, #8be9fd 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #282a36;
            margin: 0 auto 1.5rem;
            animation: scaleIn 0.5s ease-out;
          }
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .success-content h2 {
            color: #50fa7b;
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .success-content p {
            color: #f8f8f2;
            margin-bottom: 0.5rem;
          }
          .success-hint {
            color: #6272a4 !important;
            font-size: 0.875rem;
            margin-bottom: 2rem !important;
          }
          .success-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #50fa7b 0%, #8be9fd 100%);
            border: none;
            border-radius: 10px;
            color: #282a36;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(80, 250, 123, 0.3);
          }
          .success-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(80, 250, 123, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-bg">
        <div className="register-bg-pattern"></div>
        <div className="register-bg-glow"></div>
      </div>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <div className="register-logo-icon">
                <PackagePlus size={40} />
              </div>
              <div className="login-logo-text">
                <h1>Stock</h1>
                <span>SARL Bekkour & CIE</span>
              </div>
            </div>
            <p className="register-welcome">
              Rejoignez-nous ! Créez votre compte pour commencer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="register-error">
                <ShieldCheck size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="register-row">
              <div className="register-field">
                <label htmlFor="nom"><User size={16} /> Nom</label>
                <div className="register-input-wrapper">
                  <input id="nom" type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} placeholder="Doe" required disabled={isLoading} />
                </div>
              </div>
              <div className="register-field">
                <label htmlFor="prenom"><User size={16} /> Prénom</label>
                <div className="register-input-wrapper">
                  <input id="prenom" type="text" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} placeholder="John" required disabled={isLoading} />
                </div>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="email"><Mail size={16} /> Adresse email</label>
              <div className="register-input-wrapper">
                <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john.doe@email.com" required disabled={isLoading} />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="password"><Lock size={16} /> Mot de passe</label>
              <div className="register-input-wrapper">
                <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required disabled={isLoading} />
                <button type="button" className="register-toggle-password" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword"><CheckCircle2 size={16} /> Confirmer</label>
              <div className="register-input-wrapper">
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="••••••••" required disabled={isLoading} />
                <button type="button" className="register-toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="register-submit" disabled={isLoading}>
              {isLoading ? (
                <><div className="register-spinner"></div><span>Inscription...</span></>
              ) : (
                <><span>Créer mon compte</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>Déjà un compte ? <Link href="/login" className="register-link">Se connecter</Link></p>
          </div>
        </div>

        <div className="register-info">
          <div className="register-info-item"><CheckCircle2 size={20} /><span>Inscription gratuite</span></div>
          <div className="register-info-item"><ShieldCheck size={20} /><span>Sécurisé & Fiable</span></div>
        </div>
      </div>

      <style jsx>{`
        .register-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #282a36 0%, #1a1b23 100%); position: relative; overflow: hidden; padding: 2rem; }
        .register-bg { position: absolute; inset: 0; overflow: hidden; }
        .register-bg-pattern { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 80%, rgba(255, 121, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(189, 147, 249, 0.1) 0%, transparent 50%); }
        .register-bg-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(189, 147, 249, 0.05) 0%, transparent 70%); animation: pulse 4s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); } }
        .register-container { position: relative; z-index: 10; width: 100%; max-width: 480px; }
        .register-card { background: #44475a; border-radius: 16px; padding: 2.5rem; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(189, 147, 249, 0.1); border: 1px solid #6272a4; }
        .register-header { text-align: center; margin-bottom: 2rem; }
        .register-logo { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .register-logo-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #bd93f9 0%, #ff79c6 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #f8f8f2; box-shadow: 0 10px 30px rgba(189, 147, 249, 0.3); animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .register-logo-text h1 { font-size: 1.75rem; font-weight: 700; color: #bd93f9; margin: 0; letter-spacing: -0.5px; }
        .register-logo-text span { font-size: 0.875rem; color: #ff79c6; font-weight: 500; }
        .register-welcome { color: #6272a4; font-size: 0.9375rem; line-height: 1.5; margin: 0; }
        .register-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .register-error { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1rem; background: rgba(255, 85, 85, 0.1); border: 1px solid rgba(255, 85, 85, 0.3); border-radius: 8px; color: #ff5555; font-size: 0.875rem; }
        .register-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .register-field { display: flex; flex-direction: column; gap: 0.5rem; }
        .register-field label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #f8f8f2; }
        .register-field label svg { color: #bd93f9; }
        .register-input-wrapper { position: relative; }
        .register-input-wrapper input { width: 100%; padding: 0.875rem 1rem; background: #282a36; border: 1px solid #6272a4; border-radius: 10px; color: #f8f8f2; font-size: 0.9375rem; transition: all 0.2s ease; }
        .register-input-wrapper input:focus { outline: none; border-color: #bd93f9; box-shadow: 0 0 0 3px rgba(189, 147, 249, 0.1); }
        .register-input-wrapper input::placeholder { color: #6272a4; }
        .register-input-wrapper input:disabled { opacity: 0.6; cursor: not-allowed; }
        .register-toggle-password { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #6272a4; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s ease; }
        .register-toggle-password:hover { color: #bd93f9; }
        .register-submit { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 1rem; background: linear-gradient(135deg, #bd93f9 0%, #ff79c6 100%); border: none; border-radius: 10px; color: #282a36; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(189, 147, 249, 0.3); margin-top: 0.5rem; }
        .register-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(189, 147, 249, 0.4); }
        .register-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .register-spinner { width: 18px; height: 18px; border: 2px solid rgba(40, 42, 54, 0.3); border-top-color: #282a36; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .register-footer { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #6272a4; text-align: center; }
        .register-footer p { color: #6272a4; font-size: 0.875rem; margin: 0; }
        .register-link { color: #bd93f9; font-weight: 600; text-decoration: none; transition: color 0.2s ease; }
        .register-link:hover { color: #ff79c6; text-decoration: underline; }
        .register-info { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; padding: 0 1rem; }
        .register-info-item { display: flex; align-items: center; gap: 0.5rem; color: #6272a4; font-size: 0.875rem; }
        .register-info-item svg { color: #bd93f9; }
        @media (max-width: 480px) { .register-page { padding: 1rem; } .register-card { padding: 1.5rem; } .register-logo-icon { width: 60px; height: 60px; } .register-row { grid-template-columns: 1fr; } .register-info { flex-direction: column; align-items: center; gap: 1rem; } }
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
      `}</style>
    </div>
  );
}
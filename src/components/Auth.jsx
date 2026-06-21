import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onLogin }) {
  // ============================================
  // ÉTAT: Quel mode on est - login ou register?
  // ============================================
  // mode = 'login' → afficher le formulaire de connexion
  // mode = 'register' → afficher le formulaire d'inscription
  const [mode, setMode] = useState('login');

  // ============================================
  // ÉTAT: Les données du formulaire
  // ============================================
  // email = l'email de l'utilisateur
  // password = le mot de passe
  // username = le nom d'affichage (seulement pour register)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  // ============================================
  // FONCTION: Gérer les changements du formulaire
  // ============================================
  // Quand l'utilisateur tape dans un champ, mettre à jour formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ============================================
  // FONCTION: Envoyer le formulaire (Login ou Register)
  // ============================================
  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier que les champs ne sont pas vides
    if (!formData.email || !formData.password) {
      alert('Email et mot de passe requis!');
      return;
    }

    // Si on est en mode register, vérifier le username aussi
    if (mode === 'register' && !formData.username) {
      alert('Nom d\'utilisateur requis!');
      return;
    }

    // ============================================
    // IMPORTANT: Pour l'instant, on fait juste du "fake login"
    // ============================================
    // On ne se connecte pas vraiment à une base de données
    // On simule juste une connexion
    // Plus tard, on pourrait ajouter Supabase Auth

    // Créer un objet utilisateur
    const user = {
      id: Math.random().toString(36).substr(2, 9),  // ID random
      email: formData.email,
      username: formData.username || formData.email.split('@')[0],  // Utiliser email si pas de username
      createdAt: new Date(),
    };

    // Sauvegarder l'utilisateur dans localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Appeler onLogin() pour dire "l'utilisateur est connecté!"
    onLogin(user);

    // Afficher un message de succès
    alert(`Bienvenue ${user.username}! 🎉`);
  };

  return (
    <div className="auth-container">
      {/* CARD D'AUTHENTIFICATION */}
      <div className="auth-card">
        
        {/* LOGO */}
        <div className="auth-logo">
          <div className="auth-brand" aria-label="BertCollab">
            <div className="auth-brand-logo" aria-hidden="true">
              <span className="auth-brand-bc">BC</span>
            </div>
            <div className="auth-brand-name">BertCollab</div>
          </div>
        </div>


        {/* TITRE */}
        <h2 className="auth-title">
          {mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
        </h2>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* CHAMP EMAIL */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="toi@example.com"
              className="form-input"
            />
          </div>

          {/* CHAMP USERNAME (seulement en mode register) */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Mon pseudo"
                className="form-input"
              />
            </div>
          )}

          {/* CHAMP PASSWORD */}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          {/* BOUTON SUBMIT */}
          <button type="submit" className="btn-submit">
            {mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>

        {/* SWITCH ENTRE LOGIN ET REGISTER */}
        <div className="auth-footer">
          <p className="auth-text">
            {mode === 'login' ? 'Pas de compte? ' : 'Déjà inscrit? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setFormData({ email: '', password: '', username: '' });
              }}
              className="auth-link"
            >
              {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// RÉSUMÉ:
// ============================================
// Ce composant Auth permet:
// 1. Se connecter (Login)
// 2. S'inscrire (Register)
//
// Pour l'instant, on fait du "fake login":
// - On sauvegarde l'utilisateur dans localStorage
// - On appelle onLogin() pour dire "connecté!"
//
// Plus tard, on pourrait:
// - Connecter à Supabase Auth
// - Vérifier l'email avec une base de données
// - Hasher les mots de passe
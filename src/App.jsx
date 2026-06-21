import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Sécurité: si l'objet n'a pas les champs attendus, on le considère comme non connecté
      if (!parsed || typeof parsed !== 'object') return null;
      if (!parsed.id || (!parsed.username && !parsed.email)) return null;
      return parsed;
    } catch (err) {
      console.error('Erreur lecture currentUser:', err);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      console.error('Erreur sauvegarde currentUser:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('currentUser');
    } catch (err) {
      console.error('Erreur suppression currentUser:', err);
    }
  };

  return (
    <div className="app">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';  // ← Ajoute useEffect!
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';  // ← Tu as oublié Auth!
import './App.css';  // ← Tu as oublié App.css!

export default function App() {
  const [user, setUser] = useState(null);
  
  // ← Tu as oublié le useEffect pour charger l'utilisateur!
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // ← Tu as oublié handleLogin!
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // ← Tu as oublié handleLogout!
const handleLogout = () => {
  console.log('handleLogout appelé!');  // ← Ajoute ça
  setUser(null);
  localStorage.removeItem('currentUser');
  alert('Vous avez été déconnecté!');
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
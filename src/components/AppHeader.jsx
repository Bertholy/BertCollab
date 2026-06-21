import React from 'react';
import './AppHeader.css';

export default function AppHeader({ user, onLogout }) {
  const name = user?.username || 'Jean';


  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* LEFT */}
        <div className="app-header-left">
          <div className="app-brand" aria-label="BertCollab">
            <div className="app-brand-logo" aria-hidden="true">
              <span className="app-brand-bc">BC</span>
            </div>
            <div className="app-brand-name">
              <span>BertCollab</span>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="app-header-center">
          <div className="search-bar" role="search">
            <span className="search-icon" aria-hidden="true">
              {/* loupe */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16.2 16.2L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input className="search-input" placeholder="Rechercher un document ou un groupe..." />
          </div>
        </div>

        {/* RIGHT */}
        <div className="app-header-right">
          <div className="profile-pill" aria-label="Profil utilisateur">
            <div className="profile-avatar" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-meta">
              <div className="profile-name">{name}</div>
              <div className="profile-status">
                <span className="status-dot" aria-hidden="true" />
                en ligne
              </div>
            </div>
          </div>

          <button
            className="icon-btn"
            type="button"
            aria-label="Déconnexion"
            onClick={onLogout}
          >
            {/* icône sortie */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 17L15 12L10 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M21 21V3H12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}


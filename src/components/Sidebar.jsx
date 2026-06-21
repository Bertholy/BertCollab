import React from 'react';
import './Sidebar.css';

export default function Sidebar({
  connectedFriends = [],
  showFriends = false,
  onToggleFriends,

  documents = [],
  activeDocumentId = null,
  onSelectDocument,
  onAddDocument,
  onDeleteDocument,
  compactDocuments = false,
}) {
  return (
    <aside className="sidebar" aria-label="Navigation principale">
      <nav className="sidebar-nav">
        

        <button
          type="button"
          className={`sidebar-item ${showFriends ? 'active' : ''}`}
          onClick={onToggleFriends}
        >
          <span className="sidebar-icon" aria-hidden="true">👤</span>
          Liste des amis connectés
        </button>

        {showFriends && (
          <div className="friends-panel" aria-label="Amis connectés">
            {connectedFriends.length === 0 ? (
              <div className="friends-empty">Personne n’est connecté</div>
            ) : (
              connectedFriends.map((f) => {
                const name = f?.name ?? 'Anonyme';
                const initials = name.trim().charAt(0).toUpperCase();
                return (
                  <div key={f.id ?? name} className="friends-row" title={name}>
                    <div className="friends-avatar" aria-hidden="true">
                      {initials}
                    </div>
                    <span className="friends-name">{name}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}



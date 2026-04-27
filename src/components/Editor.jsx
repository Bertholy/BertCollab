
// ============================================
// NOUVEAU: Import du service de documents
// ============================================
import { saveDocumentContent } from '../services/documentService';
import React, { useState } from 'react';
import './Editor.css';

// ============================================
// NOUVEAU: Import Socket.io
// ============================================
import { connectSocket, joinRoom, leaveRoom, sendTextUpdate, onTextUpdate } from '../services/socketService';

export default function Editor({ groupId, groupName, onBack }) {
  // État pour le contenu du document
  const [documentContent, setDocumentContent] = useState('');
  // ============================================
// NOUVEAU: Charger le contenu sauvegardé au démarrage
// ============================================
React.useEffect(() => {
  // Charger le contenu depuis le localStorage
  const savedContent = localStorage.getItem(`doc_${groupId}`);
  if (savedContent) {
    setDocumentContent(savedContent);
  }
}, [groupId]);
  // État pour la liste des utilisateurs connectés
  const [users, setUsers] = useState([
    { id: 1, name: 'Toi', color: '#06b6d4' },
    { id: 2, name: 'Alice', color: '#3b82f6' },
  ]);
  // ============================================
// NOUVEAU: État pour la connexion Socket
// ============================================
const [socketConnected, setSocketConnected] = React.useState(false);

// ============================================
// NOUVEAU: Initialiser Socket.io au démarrage
// ============================================
React.useEffect(() => {
  // Connecter à Socket.io
  const socket = connectSocket();
  setSocketConnected(true);
  
  // Rejoindre la salle du groupe
  joinRoom(groupId);
  
  // Écouter les changements des autres utilisateurs
  onTextUpdate((data) => {
    // Si c'est le même groupe, mettre à jour le texte
    if (data.roomId === groupId) {
      setDocumentContent(data.content);
    }
  });
  
  // Quitter la salle quand on quitte l'éditeur
  return () => {
    leaveRoom(groupId);
  };
}, [groupId]);

  // Fonction pour gérer les changements de texte
// ============================================
// ============================================
// MODIFIÉ: Envoyer les changements en temps réel
// ============================================
const handleContentChange = (e) => {
  const newContent = e.target.value;
  setDocumentContent(newContent);
  
  // Sauvegarder localement
  localStorage.setItem(`doc_${groupId}`, newContent);
  
  // NOUVEAU: Envoyer aux autres utilisateurs via Socket.io
  sendTextUpdate(groupId, newContent);
};

  return (
    <div className="editor-container">
      {/* HEADER */}
      <div className="editor-header">
        <div className="header-left">
          <button onClick={onBack} className="btn-back">
            ← Retour
          </button>
          <h1 className="editor-title">{groupName}</h1>
        </div>
        <div className="header-right">
          <div className="users-online">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-avatar"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ZONE D'ÉDITION */}
      <div className="editor-main">
        {/* Éditeur de texte */}
        <textarea
          className="editor-textarea"
          value={documentContent}
          onChange={handleContentChange}
          placeholder="Commencez à taper votre document ici..."
        />

        {/* Panneau latéral avec infos */}
        <div className="editor-sidebar">
          <h3 className="sidebar-title">Utilisateurs connectés</h3>
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className="user-item">
                <div
                  className="user-indicator"
                  style={{ backgroundColor: user.color }}
                />
                <span className="user-name">{user.name}</span>
              </div>
            ))}
          </div>

          <h3 className="sidebar-title" style={{ marginTop: '2rem' }}>
            Infos du document
          </h3>
          <div className="document-stats">
            <div className="stat">
              <span className="stat-label">Mots:</span>
              <span className="stat-value">
                {documentContent.split(/\s+/).filter(w => w.length > 0).length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Caractères:</span>
              <span className="stat-value">{documentContent.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Lignes:</span>
              <span className="stat-value">
                {documentContent.split('\n').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="editor-footer">
        <span className="status">Sauvegarde automatique activée</span>
        <button className="btn-save">💾 Sauvegarder</button>
      </div>
    </div>
  );
}
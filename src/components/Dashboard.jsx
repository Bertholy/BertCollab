import React, { useState, useEffect } from 'react';
import './Dashboard.css';
// ============================================
// NOUVEAU: Import Socket.io
// ============================================
import { connectSocket, onTextUpdate } from '../services/socketService';
// ============================================
// NOUVEAU: Import du service Supabase
// ============================================
// groupService contient les fonctions pour
// récupérer/créer/supprimer des groupes
import { fetchGroupsFromSupabaseOnly, createGroup, deleteGroup } from '../services/groupService.js';


// ============================================
// NOUVEAU: Import du composant Editor
// ============================================
import Editor from './Editor';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

export default function Dashboard({ user, onLogout, groupId, groupName, onBack }) {

  // État pour stocker la liste des groupes
// ============================================
// NOUVEAU: État pour les groupes depuis Supabase
// ============================================
// Au lieu de stocker les groupes en dur,
// on les récupère de la base de données
const getCachedGroups = () => {
  try {
    const saved = localStorage.getItem('bertcollab_groups');
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Erreur lecture groups localStorage:', err);
    return [];
  }
};

const [groups, setGroups] = useState(() => getCachedGroups());

// ============================================
// NOUVEAU: Charger les groupes au démarrage
// ============================================
// useEffect se déclenche quand le composant se charge
// C'est là qu'on va chercher les groupes dans Supabase

  useEffect(() => {
    const loadGroups = async () => {
      const data = await fetchGroupsFromSupabaseOnly();
      setGroups(data);
    };
  
  loadGroups();
}, []); // [] = charger une seule fois au démarrage
  // État pour afficher/cacher le formulaire de création
  const [showForm, setShowForm] = useState(false);
  
// ============================================
// NOUVEAU: État pour gérer quel groupe est ouvert
// ============================================
// selectedGroupId = null → on affiche le Dashboard
// selectedGroupId = ID → on affiche l'Editor pour ce groupe
const [selectedGroupId, setSelectedGroupId] = useState(null);

// ============================================
// NOUVEAU: Amis connectés (Sidebar)
// ============================================
const [connectedFriends, setConnectedFriends] = useState([]);
const [showFriends, setShowFriends] = useState(false);

// ============================================
// NOUVEAU: Initialiser Socket.io au démarrage
// ============================================
React.useEffect(() => {
  // Connecter à Socket.io
  const socket = connectSocket();
  window.socketInstance = socket;
  
    // Écouter les créations de groupes
    socket.on('group-created', (data) => {
      // Source of truth: Supabase
      fetchGroupsFromSupabaseOnly()
        .then(setGroups)
        .catch(() => {});
    });

  
  // Écouter les suppressions de groupes des autres utilisateurs
  socket.on('group-deleted', (data) => {
    if (!data?.groupId) return;
    setGroups((prevGroups) => prevGroups.filter((g) => g.id !== data.groupId));

    // Source of truth: Supabase
    fetchGroupsFromSupabaseOnly()
      .then(setGroups)
      .catch(() => {});
  });

  // (presence) listener update-user-list déplacé dans un useEffect dépendant du groupId
  // pour rejoindre/quit la room au bon moment.

  return () => {
    if (socket) {
      socket.off('group-created');
      socket.off('group-deleted');
      socket.off('update-user-list');
      socket.disconnect();
      window.socketInstance = null;
    }
  };
  }, []);

  // ============================================
  // NOUVEAU: Synchroniser groupes vers localStorage
  // + Écouter les changements d'autres onglets
  // ============================================
  useEffect(() => {
    // Sauvegarder les groupes dans localStorage
    localStorage.setItem('bertcollab_groups', JSON.stringify(groups));
    
    // Écouter les changements de localStorage depuis d'autres onglets
    const handleStorageChange = (e) => {
      if (e.key === 'bertcollab_groups' && e.newValue) {
        try {
          const updatedGroups = JSON.parse(e.newValue);
          console.log('📡 Synchronisation inter-onglets détectée, mise à jour des groupes');
          setGroups(updatedGroups);
        } catch (err) {
          console.error('Erreur parsing localStorage:', err);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [groups]);

  // ============================================
  // Fake data amis connectés pour la sidebar
  // (On supprime la présence Socket côté sidebar)
  // ============================================
  useEffect(() => {
    const seed = String(selectedGroupId ?? '0');
    const names = ['Alice', 'Yanis', 'Mina', 'Samir', 'Sara', 'Léo', 'Nora', 'Karim'];
    const colors = ['#4f46e5', '#06b6d4', '#22c55e', '#f97316', '#e11d48', '#a855f7'];

    const offset = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % names.length;
    const rotated = [...names.slice(offset), ...names.slice(0, offset)];

    const fake = rotated.slice(0, 4).map((name, idx) => ({
      id: `fake_${seed}_${idx}`,
      name,
      color: colors[idx % colors.length],
    }));

    setConnectedFriends(fake);
  }, [selectedGroupId]);


  // État pour les données du formulaire
  const [formData, setFormData] = useState({ name: '', type: 'public' });


  // Fonction pour créer un nouveau groupe
// ============================================
const handleCreateGroup = async (e) => {
  e.preventDefault();

  console.log('handleCreateGroup called', { formData, user });

  if (!formData.name.trim()) {
    alert('Le nom du groupe est requis.');
    return;
  }

  const newGroupData = {
    name: formData.name,
    type: formData.type,
    creator_id: user?.id ?? null,
  };

  try {
    console.log('Envoi createGroup ->', newGroupData);
    const createdGroup = await createGroup(newGroupData);
    console.log('createGroup response ->', createdGroup);

    if (!createdGroup) {
      alert('Erreur lors de la création du groupe. Vérifie la console pour plus de détails.');
      return;
    }

    setGroups((prevGroups) => [...prevGroups, createdGroup]);

    // Synchroniser immédiatement à localStorage pour inter-onglet
    localStorage.setItem('bertcollab_groups', JSON.stringify([...groups, createdGroup]));

    const socket = window.socketInstance;
    if (socket) {
      socket.emit('group-created', { group: createdGroup });
    }

    setFormData({ name: '', type: 'public' });
    setShowForm(false);
  } catch (err) {
    console.error('Erreur createGroup:', err);
    alert('Erreur lors de la création du groupe (voir console).');
  }
};


  // Fonction pour supprimer un groupe
  // ============================================
// MODIFIÉ: Supprimer un groupe avec Supabase
// ============================================
const handleDeleteGroup = async (id) => {
  const success = await deleteGroup(id);

  if (success) {
    // UI: enlever immédiatement le groupe
    setGroups((prev) => prev.filter((g) => g.id !== id));

    // Cache localStorage: synchroniser aussi pour éviter que le groupe “revienne” au refresh
    try {
      const cached = JSON.parse(localStorage.getItem('bertcollab_groups') || '[]');
      const nextCached = (cached ?? []).filter((g) => g.id !== id);
      localStorage.setItem('bertcollab_groups', JSON.stringify(nextCached));
    } catch (err) {
      console.warn('sync localStorage après deleteGroup failed', err);
    }

    // Notifier les autres utilisateurs
    const socket = window.socketInstance;
    if (socket) {
      socket.emit('group-deleted', { groupId: id });
    }
  }
};

// ============================================
// NOUVEAU: Fonction pour ouvrir un groupe
// ============================================
const openGroup = (groupId) => {
  setSelectedGroupId(groupId);
};

// ============================================
// NOUVEAU: Fonction pour revenir au Dashboard
// ============================================
const handleBackFromEditor = () => {
  setSelectedGroupId(null);
};

// ============================================
// NOUVEAU: Récupérer le groupe sélectionné
// ============================================
const selectedGroup = groups.find(g => g.id === selectedGroupId);

// ============================================
// NOUVEAU: Si un groupe est ouvert, afficher l'Editor
// ============================================
if (selectedGroupId !== null && selectedGroup) {
  return (
    <Editor
      groupId={selectedGroupId}
      groupName={selectedGroup.name}
      onBack={handleBackFromEditor}
      user={user}
    />
  );
}
  return (
    <div className="container">
      <AppHeader user={user} onLogout={onLogout} />

      <div className="dashboard-layout">
        <div className="sidebar-column">
          {/* Barre latérale */}
          <Sidebar
            connectedFriends={connectedFriends}
            showFriends={showFriends}
            onToggleFriends={() => setShowFriends((v) => !v)}
          />

        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="main-column">

        {/* HEADER */}
        <div className="header">
          <h2 className="page-title">Mes Groupes de Collaboration</h2>
          <p className="page-subtitle">Gérez vos documents en temps réel avec votre équipe</p>
        </div>

        {/* BOUTON CRÉER GROUPE */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-create-group"
        >
          ➕ Créer un nouveau groupe
        </button>

        {/* FORMULAIRE DE CRÉATION */}
        {showForm && (
          <div className="form-container">
            <form onSubmit={handleCreateGroup} className="form">
              
              {/* Champ: Nom du groupe */}
              <div className="form-group">
                <label className="form-label">Nom du groupe</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Équipe Design..."
                  className="form-input"
                />
              </div>

              {/* Champ: Type (Public/Privé) */}
              <div className="form-group">
                <label className="form-label">Type de groupe</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      checked={formData.type === 'public'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    🌐 Public
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value="private"
                      checked={formData.type === 'private'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    🔒 Privé
                  </label>
                </div>
              </div>

              {/* Boutons */}
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Créer</button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-cancel"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* GRILLE DE GROUPES */}
        <div className="groups-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              
              {/* Haut de la carte */}
              <div className="card-header">
                <div>
                  <h3 className="group-name">{group.name}</h3>
                  <div className="group-type">
                    {group.type === 'public' ? (
                      <span className="type-public">🌐 Public</span>
                    ) : (
                      <span className="type-private">🔒 Privé</span>
                    )}
                  </div>
                </div>
             <button
                       onClick={() => handleDeleteGroup(group.id)}
                     className="btn-delete"
                        >
                   🗑️
              </button>
              </div>

              {/* Infos du groupe */}
              <div className="card-body">
                <div className="group-info">
                  <span>👥 {group.members ?? 0} membre{(group.members ?? 0) > 1 ? 's' : ''}</span>
                </div>
                <div className="group-info">
                  <span>📄 {group.documents ?? 0} document{(group.documents ?? 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Bouton pour ouvrir */}
              {/*nouveau fonc */}
            {/* MODIFIÉ: Bouton pour ouvrir - appelle openGroup() */}
              <button
                onClick={() => openGroup(group.id)}
                className="btn-open-group"
                  >
                  Ouvrir le groupe
                </button>

            </div>
          ))}
        </div>

        {/* Message si aucun groupe */}
        {groups.length === 0 && (
          <div className="empty-state">
            <p>Aucun groupe pour le moment. Créez-en un pour commencer!</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
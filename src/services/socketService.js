// ============================================
// SOCKET SERVICE - ÉDITION TEMPS RÉEL
// ============================================
// Ce fichier gère la connexion Socket.io
// pour que plusieurs utilisateurs puissent éditer ensemble en temps réel

import io from 'socket.io-client';

// ============================================
// INITIALISER LA CONNEXION SOCKET
// ============================================
// On se connecte au serveur Socket.io
// Pour l'instant, on va juste créer l'objet socket
// (On va le configurer plus tard quand on aura le serveur)

let socket = null;

// ============================================
// FONCTION: CONNECTER À SOCKET.IO
// ============================================
export const connectSocket = (serverURL = 'http://localhost:3001') => {
  try {
    // Créer la connexion Socket.io
    socket = io(serverURL, {
      reconnection: true,        // Reconnecter automatiquement si déconnecté
      reconnectionDelay: 1000,   // Attendre 1 seconde avant reconnecter
      reconnectionAttempts: 5,   // Essayer 5 fois avant abandonner
    });

    // Quand on est connecté
    socket.on('connect', () => {
      console.log('✅ Connecté à Socket.io');
    });

    // Quand on est déconnecté
    socket.on('disconnect', () => {
      console.log('❌ Déconnecté de Socket.io');
    });

    window.socketInstance = socket;
    return socket;
  } catch (err) {
    console.error('Erreur connexion Socket:', err);
    return null;
  }
};

// ============================================
// FONCTION: REJOINDRE UNE SALLE (GROUPE)
// ============================================
// Quand tu ouvres un groupe, tu rejoins une "salle"
// Tous les utilisateurs dans la même salle voient les mêmes changements
// NOTE: on ne passe plus uniquement le username (qui peut changer à l'écran)
// mais un userId stable si disponible.
export const joinRoom = (roomId, user) => {
  if (socket) {
    const username = user?.username || user?.email || 'Anonyme';
    const userId = user?.id ?? null;

    // Envoyer au serveur un identifiant stable + le nom d'affichage
    socket.emit('join-room', { roomId, username, userId });
    console.log(`📍 Rejoint la salle: ${roomId}`);
  }
};

// ============================================
// FONCTION: QUITTER UNE SALLE
// ============================================
export const leaveRoom = (roomId) => {
  if (socket) {
    socket.emit('leave-room', { roomId });
    console.log(`🚪 Quitté la salle: ${roomId}`);
  }
};

// ============================================
// FONCTION: ENVOYER UN CHANGEMENT DE TEXTE
// ============================================
// Quand l'utilisateur tape, on envoie le nouveau texte à tous les autres
export const sendTextUpdate = (roomId, content, userId = null) => {
  if (socket) {
    // Envoyer aux autres dans la salle
    socket.emit('text-update', {
      roomId,
      content,
      userId,
      timestamp: new Date(),
    });
  }
};

// ============================================
// FONCTION: ÉCOUTER LES CHANGEMENTS DES AUTRES
// ============================================
// Quand quelqu'un d'autre tape, on reçoit le texte et on le met à jour
export const onTextUpdate = (callback) => {
  if (socket) {
    // Écouter l'événement 'text-update' du serveur
    socket.on('text-update', (data) => {
      // Appeler la fonction callback avec les données
      callback(data);
    });
  }
};

// ============================================
// FONCTION: ÉCOUTER LA LISTE DES UTILISATEURS
// ============================================
// Reçoit la liste complète des pseudos connectés à la salle
export const onUpdateUserList = (callback) => {
  if (socket) {
    socket.on('update-user-list', (users) => {
      console.log('👥 Liste des utilisateurs mise à jour:', users);
      callback(users);
    });
  }
};

// ============================================
// FONCTION: DÉCONNECTER
// ============================================
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket déconnecté');
  }
};

// ============================================
// RÉSUMÉ:
// ============================================
// Quand deux utilisateurs ouvrent le même groupe:
//
// Utilisateur 1 tape "Bonjour"
// → sendTextUpdate('group_1', "Bonjour")
// → Le serveur reçoit et envoie à Utilisateur 2
// → Utilisateur 2 reçoit via onTextUpdate()
// → Son texte se met à jour automatiquement!
//
// C'EST L'ÉDITION TEMPS RÉEL! 🔥
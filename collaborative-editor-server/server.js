// ============================================
// SERVEUR SOCKET.IO - ÉDITION TEMPS RÉEL
// ============================================
// Ce serveur gère la communication entre les utilisateurs
// Il reçoit les changements de texte et les envoie aux autres

// ============================================
// IMPORTER LES LIBRAIRIES
// ============================================
// express = framework pour créer un serveur web
// socket.io = librairie pour la communication temps réel
// cors = pour permettre les connexions depuis localhost:5173

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// ============================================
// CRÉER L'APPLICATION EXPRESS
// ============================================
// app = l'application serveur
const app = express();

// ============================================
// CRÉER LE SERVEUR HTTP
// ============================================
// Socket.io a besoin d'un serveur HTTP pour fonctionner
const server = http.createServer(app);

// ============================================
// CRÉER L'INSTANCE SOCKET.IO
// ============================================
// io = objet Socket.io
// cors: { origin: "*" } = accepter les connexions de n'importe où
const io = socketIo(server, {
  cors: {
    origin: "*",  // Accepter localhost:5173 et partout
    methods: ["GET", "POST"]
  }
});

// ============================================
// MIDDLEWARE: CORS
// ============================================
// Permettre les requêtes HTTP depuis d'autres domaines
app.use(cors());

// ============================================
// ROUTE DE TEST
// ============================================
// Si quelqu'un va sur http://localhost:3001, afficher un message
app.get('/', (req, res) => {
  res.send('✅ Serveur Socket.io actif!');
});

// ============================================
// STOCKAGE DES UTILISATEURS PAR SALLE
// ============================================
const roomUsers = {}; // Structure: { roomId: { socketId: username } }

// ============================================
// QUAND UN UTILISATEUR SE CONNECTE
// ============================================
// 'connection' = événement qui se déclenche quand un utilisateur se connecte
io.on('connection', (socket) => {
  console.log(`👤 Nouvel utilisateur connecté: ${socket.id}`);

  // ============================================
  // ÉVÉNEMENT: L'utilisateur rejoint une salle
  // ============================================
  // Quand un utilisateur clique "Ouvrir le groupe"
  socket.on('join-room', (data) => {
    const { roomId, username } = data;  // Récupérer l'ID du groupe et le pseudo
    
    // Rejoindre la salle Socket.io
    socket.join(roomId);
    
    // Ajouter l'utilisateur à la salle
    if (!roomUsers[roomId]) roomUsers[roomId] = {};
    roomUsers[roomId][socket.id] = username || 'Anonyme';

    console.log(`📍 ${socket.id} (${username}) a rejoint la salle ${roomId}`);

    // Préparer la liste structurée des utilisateurs
    const usersInRoom = Object.entries(roomUsers[roomId]).map(([id, name]) => ({ id, name }));

    // Envoyer la liste mise à jour à tout le monde dans la salle
    io.to(roomId).emit('update-user-list', usersInRoom);
  });

  // ============================================
  // ÉVÉNEMENT: L'utilisateur envoie un changement de texte
  // ============================================
  // C'EST L'ÉVÉNEMENT LE PLUS IMPORTANT! 🔥
  socket.on('text-update', (data) => {
    const { roomId, content } = data;
    
    console.log(`✏️ Mise à jour de texte dans la salle ${roomId}`);
    
    // Envoyer le texte à TOUS les autres dans la salle
    // socket.to(roomId) = "à tous dans la salle SAUF celui qui envoie"
    socket.to(roomId).emit('text-update', {
      content: content,        // Le texte
      userId: socket.id,       // Qui l'a envoyé
      roomId: roomId,          // Quelle salle
      timestamp: new Date()    // Quand
    });
  });

  // ============================================
  // ÉVÉNEMENT: L'utilisateur quitte une salle
  // ============================================
  // Quand l'utilisateur clique "Retour"
  socket.on('leave-room', (data) => {
    const { roomId } = data;
    
    socket.leave(roomId);

    if (roomUsers[roomId]) {
      delete roomUsers[roomId][socket.id];
      // Notifier les autres avec la liste mise à jour
      const usersInRoom = Object.entries(roomUsers[roomId]).map(([id, name]) => ({ id, name }));
      io.to(roomId).emit('update-user-list', usersInRoom);
    }

    console.log(`🚪 ${socket.id} a quitté la salle ${roomId}`);
  });

  // ============================================
  // ÉVÉNEMENT: L'utilisateur se déconnecte
  // ============================================
  // Quand l'utilisateur ferme le navigateur ou l'app
  socket.on('disconnect', () => {
    // Nettoyer l'utilisateur de toutes les salles
    for (const roomId in roomUsers) {
      if (roomUsers[roomId][socket.id]) {
        delete roomUsers[roomId][socket.id];
        const usersInRoom = Object.entries(roomUsers[roomId]).map(([id, name]) => ({ id, name }));
        io.to(roomId).emit('update-user-list', usersInRoom);
      }
    }
    console.log(`❌ ${socket.id} s'est déconnecté`);
  });
});

// ============================================
// DÉMARRER LE SERVEUR
// ============================================
// Écouter sur le port 3001
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.io démarre sur http://localhost:${PORT}`);
});

// ============================================
// RÉSUMÉ DU FLUX:
// ============================================
// 1. Utilisateur 1 ouvre un groupe
//    → Envoie 'join-room' au serveur
//    → Le serveur appelle socket.join(roomId)
//
// 2. Utilisateur 1 tape "Bonjour"
//    → Envoie 'text-update' avec le texte
//    → Le serveur reçoit et envoie à tous les autres dans la salle
//    → Utilisateur 2 reçoit le texte via 'text-update'
//    → Son écran se met à jour! 🔥
//
// 3. Utilisateur 1 clique "Retour"
//    → Envoie 'leave-room'
//    → Le serveur enlève de la salle
//    → Les autres sont avertis
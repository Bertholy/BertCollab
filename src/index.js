// server/index.js
const io = require('socket.io')(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log("Le serveur WebSocket est en cours d'exécution sur le port 3001");

io.on('connection', (socket) => {
  console.log("Nouvelle connexion: " + socket.id);

  // Écouter les événements 'send-text'
  socket.on('send-text', (data) => {
    console.log("Message reçu:", data);
    // Diffuser à tous les autres clients
    socket.broadcast.emit('receive-text', data);
  });

  socket.on('disconnect', () => {
    console.log("Déconnexion: " + socket.id);
  });
});
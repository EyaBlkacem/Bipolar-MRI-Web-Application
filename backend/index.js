const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const database = require('./src/database/db.config');
require('dotenv').config();
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

global.io = io;

app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '25mb' }));

database.mongoose.connect(database.url, {})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.log('❌ Erreur MongoDB:', err));

app.get('/', (req, res) => {
  res.send({ message: 'API Medical + Psychiatre - MongoDB - OK' });
});

require('./src/api/routes/patient.routes')(app);
require('./src/api/routes/medecin.routes')(app);
require('./src/api/routes/rendezvous.routes')(app);
require('./src/api/routes/auth.routes')(app);
require('./src/api/routes/message.routes')(app);
require('./src/api/routes/assessment.routes')(app);

require('./src/api/routes/bipolarAuth.routes')(app);
require('./src/api/routes/bipolarUsers.routes')(app);
require('./src/api/routes/consultations.routes')(app);
require('./src/api/routes/appointments.routes')(app);
require('./src/api/routes/reports.routes')(app);
require('./src/api/routes/bipolarMessages.routes')(app);
require('./src/api/routes/dashboard.routes')(app);
require('./src/api/routes/notifications.routes')(app);
require('./src/api/routes/stats.routes')(app);
require('./src/api/routes/forms.routes')(app);
require('./src/api/routes/aiAssessment.routes')(app);

const onlineUsers = {};
const videoRooms = new Map();

function normalizeId(value) {
  return value ? String(value) : '';
}

function getRoomUsers(roomId) {
  const room = videoRooms.get(String(roomId));
  return room ? Array.from(room.values()) : [];
}

io.on('connection', (socket) => {

  console.log('🔌 Socket connecté:', socket.id);

  // =========================
  // REGISTER USER
  // =========================

  const registerUser = (userId) => {

    const id = normalizeId(userId);

    if (!id) return;

    onlineUsers[id] = socket.id;

    socket.data.userId = id;

    socket.join(id);

    io.emit('online-users', Object.keys(onlineUsers));
    io.emit('onlineUsers', Object.keys(onlineUsers));

    console.log('👤 User registered:', id);
  };

  socket.on('register', registerUser);
  socket.on('joinChat', registerUser);
  socket.on('joinRoom', registerUser);

  // =========================
  // MESSAGES
  // =========================

  socket.on('send-message', (data = {}) => {

    const receiverId = normalizeId(data.receiver_id || data.to);

    const senderId = normalizeId(
      data.sender_id || data.from || socket.data.userId
    );

    const payload = {
      sender_id: senderId,
      receiver_id: receiverId,
      fromName: data.fromName || '',
      message: data.message || data.content || '',
      created_at: new Date()
    };

    if (receiverId) {
      io.to(receiverId).emit('receive-message', payload);
      io.to(receiverId).emit('receiveMessage', payload);
    }

    if (senderId) {
      io.to(senderId).emit('receive-message', payload);
      io.to(senderId).emit('receiveMessage', payload);
    }
  });

  socket.on('sendMessage', (data = {}) => {

    const receiverId = normalizeId(data.receiver_id || data.to);

    const senderId = normalizeId(
      data.sender_id || data.from || socket.data.userId
    );

    const payload = {
      sender_id: senderId,
      receiver_id: receiverId,
      fromName: data.fromName || '',
      message: data.message || data.content || '',
      created_at: new Date()
    };

    if (receiverId) {
      io.to(receiverId).emit('receive-message', payload);
      io.to(receiverId).emit('receiveMessage', payload);
    }

    if (senderId) {
      io.to(senderId).emit('receive-message', payload);
      io.to(senderId).emit('receiveMessage', payload);
    }
  });

  // =========================
  // VIDEO ROOM
  // =========================

  socket.on('join-video-room', (data = {}) => {

    const roomId = normalizeId(data.roomId);

    if (!roomId) {
      console.log('❌ ROOM INVALID');
      return;
    }

    console.log('🎥 JOIN ROOM:', roomId);

    socket.join(roomId);

    socket.data.videoRoomId = roomId;

    if (!videoRooms.has(roomId)) {
      videoRooms.set(roomId, new Map());
    }

    const room = videoRooms.get(roomId);

    room.set(socket.id, {
      socketId: socket.id,
      userId: normalizeId(data.userId),
      role: data.role || 'user'
    });

    const users = getRoomUsers(roomId);

    console.log('👥 PARTICIPANTS:', users.length);

    io.to(roomId).emit('video-users', users);

    socket.to(roomId).emit('user-joined', {
      socketId: socket.id
    });

    // IMPORTANT
    if (users.length >= 2) {

      console.log('✅ READY FOR WEBRTC');

      io.to(roomId).emit('ready-for-webrtc', {
        roomId,
        users
      });
    }
  });

  // =========================
  // OFFER
  // =========================

  socket.on('webrtc-offer', (data = {}) => {

    console.log('📤 OFFER');

    socket.to(data.roomId).emit(
      'webrtc-offer',
      data
    );
  });

  // =========================
  // ANSWER
  // =========================

  socket.on('webrtc-answer', (data = {}) => {

    console.log('📤 ANSWER');

    socket.to(data.roomId).emit(
      'webrtc-answer',
      data
    );
  });

  // =========================
  // ICE
  // =========================

  socket.on('webrtc-ice-candidate', (data = {}) => {

    socket.to(data.roomId).emit(
      'webrtc-ice-candidate',
      data
    );
  });

  // =========================
  // LEAVE
  // =========================

  socket.on('leave-video-room', () => {

    const roomId = socket.data.videoRoomId;

    if (!roomId) return;

    socket.leave(roomId);

    const room = videoRooms.get(roomId);

    if (room) {

      room.delete(socket.id);

      const users = getRoomUsers(roomId);

      io.to(roomId).emit('video-users', users);

      socket.to(roomId).emit('user-left', {
        socketId: socket.id
      });

      if (room.size === 0) {
        videoRooms.delete(roomId);
      }
    }
  });

  // =========================
  // DISCONNECT
  // =========================

  socket.on('disconnect', () => {

    const roomId = socket.data.videoRoomId;

    if (roomId && videoRooms.has(roomId)) {

      const room = videoRooms.get(roomId);

      room.delete(socket.id);

      io.to(roomId).emit(
        'video-users',
        getRoomUsers(roomId)
      );

      socket.to(roomId).emit('user-left', {
        socketId: socket.id
      });

      if (room.size === 0) {
        videoRooms.delete(roomId);
      }
    }

    const userId = Object.keys(onlineUsers)
      .find(k => onlineUsers[k] === socket.id);

    if (userId) {
      delete onlineUsers[userId];
    }

    io.emit('online-users', Object.keys(onlineUsers));
    io.emit('onlineUsers', Object.keys(onlineUsers));

    console.log('❌ Socket déconnecté:', socket.id);
  });

});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur en marche sur http://localhost:${PORT}`);
});
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const Document = require('./models/Document');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO for real-time collaboration
const documentRooms = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('join-document', async (documentId) => {
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        socket.emit('error', { message: 'Document not found' });
        return;
      }

      socket.join(documentId);
      
      if (!documentRooms.has(documentId)) {
        documentRooms.set(documentId, new Set());
      }
      documentRooms.get(documentId).add(socket.userId);

      socket.emit('document-joined', {
        content: document.content,
        activeUsers: Array.from(documentRooms.get(documentId))
      });

      socket.to(documentId).emit('user-joined', {
        userId: socket.userId,
        activeUsers: Array.from(documentRooms.get(documentId))
      });

      console.log(`User ${socket.userId} joined document ${documentId}`);
    } catch (error) {
      console.error('Join document error:', error);
      socket.emit('error', { message: 'Failed to join document' });
    }
  });

  socket.on('content-change', async ({ documentId, content, cursorPosition }) => {
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        socket.emit('error', { message: 'Document not found' });
        return;
      }

      document.content = content;
      await document.save();

      socket.to(documentId).emit('content-updated', {
        content,
        userId: socket.userId,
        cursorPosition
      });
    } catch (error) {
      console.error('Content change error:', error);
      socket.emit('error', { message: 'Failed to update content' });
    }
  });

  socket.on('cursor-position', ({ documentId, position }) => {
    socket.to(documentId).emit('cursor-moved', {
      userId: socket.userId,
      position
    });
  });

  socket.on('leave-document', (documentId) => {
    socket.leave(documentId);
    
    if (documentRooms.has(documentId)) {
      documentRooms.get(documentId).delete(socket.userId);
      
      if (documentRooms.get(documentId).size === 0) {
        documentRooms.delete(documentId);
      } else {
        socket.to(documentId).emit('user-left', {
          userId: socket.userId,
          activeUsers: Array.from(documentRooms.get(documentId))
        });
      }
    }
    
    console.log(`User ${socket.userId} left document ${documentId}`);
  });

  socket.on('disconnect', () => {
    documentRooms.forEach((users, documentId) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        io.to(documentId).emit('user-left', {
          userId: socket.userId,
          activeUsers: Array.from(users)
        });
        
        if (users.size === 0) {
          documentRooms.delete(documentId);
        }
      }
    });
    
    console.log('User disconnected:', socket.userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

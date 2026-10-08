const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const { initializeSocket } = require('./socket/socketHandler');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
});

initializeSocket(io);

// Expose io on app for controllers to emit events (e.g. notifications, status changes)
app.set('io', io);

if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`🚌 BUSLY - Smart School Transport Server`);
    console.log(`🚀 REST API listening on http://localhost:${config.port}`);
    console.log(`⚡ Socket.IO active at ws://localhost:${config.port}`);
    console.log(`===============================================`);
  });
}

module.exports = { app, server, io };

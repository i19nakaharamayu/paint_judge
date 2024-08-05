const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MAX_CONNECTIONS = 2;
let connectedClients = 0;
const topics = ["book", "remote_control", "watch", "toothbrush"];
let currentTopic = '';
let client_id1 = '';
let client_id2 = '';
let score1 = null;
let score2 = null;
let winnerDeclared = false;

app.use(express.static('public'));

io.on('connection', (socket) => {
  if (connectedClients < MAX_CONNECTIONS) {
    connectedClients++;
    console.log(`A client connected with socket.id: ${socket.id}`);

    if (connectedClients === 1) {
      client_id1 = socket.id;
      socket.emit('connected', 'You are Player 1');
    } else if (connectedClients === 2) {
      client_id2 = socket.id;
      socket.emit('connected', 'You are Player 2');
      currentTopic = topics[Math.floor(Math.random() * topics.length)];
      io.emit('topic', `Theme: ${currentTopic}`);
    }

    socket.broadcast.emit('notification', 'A new client has connected');

    socket.on('classification', (data) => {
      console.log(`Received classification from ${socket.id}:`, data);
      if (data.name === currentTopic) {
        if (socket.id === client_id1) {
          score1 = (data.score * 100).toFixed(0);
          io.emit('score1', `Player1_Score: ${score1} %`);
        } else if (socket.id === client_id2) {
          score2 = (data.score * 100).toFixed(0);
          io.emit('score2', `Player2_Score: ${score2} %`);
        }

        if (score1 !== null && score2 !== null && !winnerDeclared) {
          winnerDeclared = true;
          setTimeout(() => {
            if (score1 > score2) {
              io.emit('winner', 'Player 1 is the WINNER!');
            } else if (score2 > score1) {
              io.emit('winner', 'Player 2 is the WINNER!');
            } else {
              io.emit('winner', 'It\'s a TIE!');
            }
            // Reset scores and winnerDeclared for the next round
            score1 = null;
            score2 = null;
            winnerDeclared = false;
          }, 10000); // 10 seconds
        }
      }
    });

    socket.on('disconnect', () => {
      connectedClients--;
      console.log(`A client disconnected with socket.id: ${socket.id}`);
      socket.broadcast.emit('notification', 'A client has disconnected');
      if (socket.id === client_id1) {
        client_id1 = '';
      } else if (socket.id === client_id2) {
        client_id2 = '';
      }
    });
  } else {
    console.log('A client tried to connect but the limit is reached');
    socket.emit('error', '空きがありません');
    socket.disconnect();
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

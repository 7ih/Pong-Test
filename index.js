// import libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var queue = {};

// for usernames
var firstNames = ['Silly', 'Quirky', 'Moody', 'Antsy', 'Mysterious'];
var lastNames = ['Snake', 'Goose', 'Birb', 'Dino', 'Pickle'];

// send data to user
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  socket.on('join', function() {
    socket.emit('serverMsg', `Searching for an opponent...`);
    username = randomizeName();
    queue[username] = socket;
    socket.username = username;
    console.log(username + ' connected');
    matchmaking();
  });
  socket.on('disconnect', function() {
    try {
      delete queue[username];
      console.log(username + ' disconnected');
      io.to(socket.opponentID).emit('opponentDc');
    } catch (e) {}
  });
  socket.on('reconnect', function() {
    username = randomizeName();
    queue[username] = socket;
    socket.username = username;
    console.log(username + ' reconnected')
    matchmaking();
  });

  function matchmaking() {
    if (Object.keys(queue).length <= 1) {
      socket.emit('serverMsg', 'No one is online right now. Feel free to wait for another player to join.');
    } else {
      var otherUsers = Object.keys(queue).filter(user => user !== socket.username);
      var opponent = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      socket.opponentID = queue[opponent].id;
      queue[opponent].opponentID = socket.id;

      socket.emit('serverMsg', `Connecting to ${opponent}...`);
      io.to(socket.opponentID).emit('serverMsg', `Connecting to ${socket.username}...`)

      queue[opponent].inQueue = false;
      socket.inQueue = false;

      delete queue[socket.username]; 
      delete queue[opponent];

      ballPosX = Math.random() * 4 + 1.5;

      socket.emit('start', true, ballPosX);
      io.to(socket.opponentID).emit('start', false, ballPosX);
    }
  }

  socket.on('paddleMove', function(pos) {
    io.to(socket.opponentID).emit('opponentMove', pos);
  });
  socket.on('hitBall', function(y, dx, dy) {
    io.to(socket.opponentID).emit('opponentHitBall', y, dx, dy);
  });
  socket.on('scored', function(ballX) {
    io.to(socket.opponentID).emit('opponentScored', ballX);
  });
  socket.on('tabOut', function() {
    io.to(socket.opponentID).emit('opponentTabOut');
  });
  socket.on('tabIn', function() {
    io.to(socket.opponentID).emit('opponentTabIn');
  });
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});

function randomizeName() {
  return  firstNames[Math.floor(Math.random() * firstNames.length)] + 
          lastNames[Math.floor(Math.random() * lastNames.length)] + 
          Math.floor(1000 + Math.random() * 9000);
}
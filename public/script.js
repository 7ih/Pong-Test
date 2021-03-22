var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var bounds = canvas.getBoundingClientRect();

var buttonWidth = 364;
var buttonHeight = 86;
var menuFontSize = 64;

function rect(prop, color) {
  ctx.beginPath();
  ctx.rect(prop.x, prop.y, prop.w, prop.h);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

var modes = [
  sp = {
    text: 'Singleplayer',
    start: () => { singleplayer(); },
    x: 0,
    y: 0
  },
  mp = {
    text: 'Multiplayer',
    start: () => { multiplayer(); },
    x: 0,
    y: 0
  }
];

function menuButtonClick(e) {
  var pos = {
    x: e.clientX / bounds.width * canvas.width,
    y: e.clientY / bounds.height * canvas.height
  };

  for (let i = 0; i < modes.length; i++) {
    var m = modes[i];
    if (pos.x > m.x && pos.x < m.x + buttonWidth && pos.y > m.y - menuFontSize && pos.y < m.y + buttonHeight - menuFontSize) {
      canvas.removeEventListener('mousemove', menuButtonHover);
      canvas.removeEventListener('click', menuButtonClick);
      canvas.style.cursor = "default";
      m.start();
    }
  }
}

function menuButtonHover(e) {
  var pos = {
    x: e.clientX / bounds.width * canvas.width,
    y: e.clientY / bounds.height * canvas.height
  };

  var buttonHover = false;
  for (let i = 0; i < modes.length; i++) {
    var m = modes[i];
    if (pos.x > m.x && pos.x < m.x + buttonWidth && pos.y > m.y - menuFontSize && pos.y < m.y + buttonHeight - menuFontSize) buttonHover = true;
  }
  if (buttonHover) canvas.style.cursor = "pointer";
  else canvas.style.cursor = "default";
}

function showMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  logo = new Image();
  logo.src = 'img/logo.png';
  logo.onload = function() { ctx.drawImage(logo, canvas.width / 2, 20); }

  ctx.font = "64px Comic Sans MS, Cursive";
  ctx.textAlign = "start";
  for (let i = 0; i < modes.length; i++) {
    var m = modes[i];
    m.x = 64;
    m.y = 150 + i * 96;
    var hlColor = (i % 2 == 0 ? "dodgerBlue" : "red");
    rect({
      x: m.x,
      y: m.y - menuFontSize,
      w: buttonWidth,
      h: buttonHeight,
    }, hlColor)
    ctx.fillStyle = "black";
    ctx.fillText(`${m.text}`, m.x, m.y);
  }

  canvas.addEventListener('mousemove', menuButtonHover);
  canvas.addEventListener('click', menuButtonClick);
}

function singleplayer() {

  var gameActive = false;
  var score = 0;
  var highscore = (
    document.cookie.split('; ').find(row => row.startsWith('highscore='))
      ? document.cookie
        .split('; ')
        .find(row => row.startsWith('highscore='))
        .split('=')[1]
      : 0
  );

  var x = canvas.width / (Math.random() * 4 + 1.5);
  var y = canvas.height - 120;
  var dx = 8;
  var dy = -6;

  var ballRadius = 20;
  var ballColor = "red";

  var paddleHeight = 20;
  var paddleWidth = 200;
  var paddleElevation = 20;
  var paddleMargin = 20;
  var paddleSpeed = 15;
  var paddleX = (canvas.width - paddleWidth) / 2;

  var brickRowCount = 3;
  var brickWidth = 75;
  var brickHeight = 20;
  var brickPadding = 15;
  var brickOffsetTop = 30;
  var brickOffsetLeft = 60;
  var brickColumnCount = 12;
  var bricksTotal = brickColumnCount * brickRowCount;

  var posX = (canvas.width - paddleWidth) / 2;

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
  }

  function changeColor() {
    var color = [255, 255, 255];
    while (color[0] + color[1] + color[2] > 450) {
      for (let i = 0; i < 3; i++) {
        color[i] = Math.floor(Math.random() * 255);
      }
    }
    ballColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  function drawPaddle() {
    rect({
      x: paddleX,
      y: canvas.height - paddleHeight - paddleElevation,
      w: paddleWidth,
      h: paddleHeight
    }, "#14f500");
  }

  var bricks = [];
  for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
      for (var r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status) {
          var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          rect({
            x: brickX,
            y: brickY,
            w: brickWidth,
            h: brickHeight
          }, "#0095DD");
        }
      }
    }
  }

  function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
      for (var r = 0; r < brickRowCount; r++) {
        var b = bricks[c][r];
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight && b.status) {
          dy = -dy;
          changeColor();
          b.status = 0;
          score++;
          bricksTotal--;
        }
      }
    }
  }

  function drawScore() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center";
    ctx.fillText("Score: " + score, canvas.width / 2, (canvas.height / 2) - 10);
    ctx.font = "16px Arial";
    ctx.textAlign = "start";
    ctx.fillText("Highscore: " + highscore, 10, 20);
  }

  function restart() {
    score = 0;
    x = canvas.width / (Math.random() * 4 + 1.5);
    y = canvas.height - 120;
    dx = 8;
    dy = -6;
    ballColor = "red";
    paddleX = (canvas.width - paddleWidth) / 2;
    posX = (canvas.width - paddleWidth) / 2;
    bricksTotal = brickColumnCount * brickRowCount;
    for (var c = 0; c < brickColumnCount; c++) {
      for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    requestAnimationFrame(draw);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    collisionDetection();
    drawBricks();
    drawScore();
    drawPaddle();

    if (y < 0 + ballRadius) {
      dy = -dy;
    }
    if (x < 0 + ballRadius || x > canvas.width - ballRadius) {
      dx = -dx;
    }
    if (x > paddleX && x < paddleX + paddleWidth && y > canvas.height - ballRadius - paddleHeight - paddleElevation) {
      dy = -dy;

      if (Math.abs(dy * dx) < 200) {
        dy *= 1.05;
        dx *= 1.05;
      } else {
        dy *= 1.01;
        dx *= 1.01;
      }

      if (bricksTotal <= 0) {
        for (var c = 0; c < brickColumnCount; c++) {
          for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
          }
        }
        bricksTotal = brickColumnCount * brickRowCount;
      }
    }

    if (y > canvas.height - ballRadius - paddleElevation - paddleHeight + 10) {
      gameActive = false;
      ctx.font = "32px Arial";
      ctx.fillStyle = "#DC143C";
      ctx.textAlign = "center";
      if (score > highscore) {
        highscore = score;
        document.cookie = `highscore=${highscore}; expires=Tue, 19 Jan 2038 03:14:07 UTC`;
        ctx.fillText("New Highscore: " + highscore, canvas.width / 2, (canvas.height / 2) + 30);
      }
      else ctx.fillText("You died.", canvas.width / 2, (canvas.height / 2) + 30);
      setTimeout(restart, 1500);
    }

    drawBall();
    x += dx;
    y += dy;

    if (gameActive) requestAnimationFrame(draw);
  }

  function movePaddle(e) {
    if (document.pointerLockElement === canvas && gameActive) {
      posX += e.movementX;

      if (posX < -paddleWidth) posX = canvas.width;
      else if (posX > canvas.width) posX = -paddleWidth;

      paddleX = posX;
    }
  }
  function pointerLock() {
    if (!gameActive) {
      gameActive = true;
      requestAnimationFrame(draw);
    }
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
  }
  function pauseOnUnfocus() {
    if (document.pointerLockElement !== canvas) gameActive = false;
  }

  canvas.addEventListener('mousemove', movePaddle);
  canvas.addEventListener('click', pointerLock);
  document.addEventListener('pointerlockchange', pauseOnUnfocus);

  canvas.onblur = function() { gameActive = false; }

  requestAnimationFrame(draw);
}

function multiplayer() {
  var gamePlaying = true;
  var gameActive = undefined;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px Arial";
  ctx.fillStyle = "#DC143C";
  ctx.textAlign = "start";
  var messageCount = 1;
  function matchMsg(msg) {
    ctx.fillText(msg, 10, 35 * messageCount);
    messageCount++;
  }

  function pointerLock() {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
  }
  function exitMatch(msg) {
    gamePlaying = false;
    socket.close();
    canvas.removeEventListener("click", pointerLock);
    document.exitPointerLock();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#DC143C";
    ctx.font = "32px Arial";
    ctx.textAlign = "start";
    ctx.fillText(msg, 10, 35);
    setTimeout(showMenu, 2000);
  }


  matchMsg('Connecting...');

  var socket = io();
  socket.emit('join');

  socket.io.on('reconnect', function() {
    if (gameActive === undefined) socket.emit('reconnect');
    else {
      exitMatch("You lost connection to the server.");
    }
  });
  socket.on('serverMsg', function(msg) {
    matchMsg(msg);
  });
  socket.on('opponentDc', function() {
    exitMatch("Your opponent disconnected.");
  });

  socket.on('start', function(receiver, ballX) {
    if (document.visibilityState === "hidden") socket.emit('tabOut');
    gameActive = true;

    var x = canvas.width / ballX;
    var y = canvas.height / 2;
    var dx = 8;
    var dy = (receiver ? 6 : -6);

    var ballRadius = 20;
    var ballColor = "red";

    var paddleHeight = 20;
    var paddleWidth = 200;
    var paddleElevation = 20;
    var paddleX = (canvas.width - paddleWidth) / 2;
    var opponentPaddleX = (canvas.width - paddleWidth) / 2;

    var posX = (canvas.width - paddleWidth) / 2;

    var score = 0;
    var opponentScore = 0;

    var countdown = 0;

    function startCountdown() {
      countdown = 3;
      for (let i=3;i>=0;i--) {
        setTimeout(function(){
          countdown--;
        }, 2000 - i*500);
      }
    }

    function drawCountdown() {
      ctx.font = "64px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#0095DD";
      if (countdown == 3) ctx.fillText("3", canvas.width / 2, canvas.height / 2 + 180);
      if (countdown == 2) ctx.fillText("2", canvas.width / 2, canvas.height / 2 + 180);
      if (countdown == 1) ctx.fillText("1", canvas.width / 2, canvas.height / 2 + 180);
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = ballColor;
      ctx.fill();
      ctx.closePath();
    }

    function changeColor() {
      var color = [255, 255, 255];
      while (color[0] + color[1] + color[2] > 450) {
        for (let i = 0; i < 3; i++) {
          color[i] = Math.floor(Math.random() * 255);
        }
      }
      ballColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }

    function drawPaddles() {
      rect({
        x: paddleX,
        y: canvas.height - paddleHeight - paddleElevation,
        w: paddleWidth,
        h: paddleHeight
      }, "#14f500");
      rect({
        x: opponentPaddleX,
        y: paddleHeight + paddleElevation,
        w: paddleWidth,
        h: paddleHeight
      }, "#FF6347");
    }

    function restart(ballX) {
      x = canvas.width / ballX;
      y = canvas.height / 2;
      receiver = !receiver;
      dx = 8;
      dy = (receiver ? 6 : -6);
      ballColor = "red";

      startCountdown();
    }

    function drawScore() {
      ctx.font = "32px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#14f500";
      ctx.fillText("Green: " + score, canvas.width / 2, (canvas.height / 2) + 20);
      ctx.fillStyle = "#FF6347";
      ctx.fillText("Orange: " + opponentScore, canvas.width / 2, (canvas.height / 2) - 20);
    }

    function draw() {
      if (!gamePlaying) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawPaddles();

      if (x < 0 + ballRadius || x > canvas.width - ballRadius) {
        dx = -dx;
        changeColor();
      }
      if (x > paddleX && x < paddleX + paddleWidth && y > canvas.height - ballRadius - paddleHeight - paddleElevation) {
        dy = -dy;
        if (Math.abs(dy * dx) < 200) {
          dy *= 1.05;
          dx *= 1.05;
        } else {
          dy *= 1.01;
          dx *= 1.01;
        }
        socket.emit('hitBall', canvas.height - y + ballRadius, dx, -dy);
      }
      if (y > canvas.height - ballRadius - paddleElevation - paddleHeight + 10) {
        var ballX = Math.random() * 4 + 1.5;
        socket.emit('scored', ballX);
        opponentScore++;
        restart(ballX);
      }

      drawBall();
      if (gameActive && countdown <= 0) {
        x += dx;
        y += dy;
      }

      drawScore();
      if (countdown >= 1) drawCountdown();


      requestAnimationFrame(draw);
    }

    function paddleMove(e) {
      if (document.pointerLockElement === canvas) {
        posX += e.movementX;

        if (posX < -paddleWidth) posX = canvas.width;
        else if (posX > canvas.width) posX = -paddleWidth;

        paddleX = posX;
        socket.emit('paddleMove', paddleX);
      }
    }
    function pauseOnPageBlur() {
      if (document.visibilityState === "hidden") {
        socket.emit('tabOut');
        gameActive = false;
      }
      else {
        socket.emit('tabIn');
        startCountdown();
        gameActive = true;
      }
    }

    canvas.addEventListener('mousemove', paddleMove);
    document.addEventListener('visibilitychange', pauseOnPageBlur);
    canvas.addEventListener('click', pointerLock);

    socket.on('opponentMove', function(pos) {
      opponentPaddleX = pos;
    });
    socket.on('opponentHitBall', function(ballY, ballDx, ballDy) {
      y = ballY;
      dx = ballDx;
      dy = ballDy;
    });
    socket.on('opponentScored', function(ballX) {
      score++;
      restart(ballX);
    });
    socket.on('opponentTabOut', function() {
      gameActive = false;
      feedback = "Your opponent is inactive, please wait."
    });
    socket.on('opponentTabIn', function() {
      startCountdown();
      gameActive = true;
    });

    startCountdown();

    requestAnimationFrame(draw);
  });
}

canvas.oncontextmenu = function() { return false; }
document.body.onresize = function() { bounds = canvas.getBoundingClientRect(); }

showMenu();
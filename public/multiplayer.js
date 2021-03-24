function multiplayer() {
    var gamePlaying = true;
    var gameActive = undefined;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    var messageCount = 1;
    function matchMsg(msg) {
      text({
        text: msg, 
        x: 10, 
        y: 35*messageCount,
        size: "32px",
        color: "#DC143C"
      });
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
      text({
        text: msg, 
        x: 10, 
        y: 35,
        size: "32px",
        color: "#DC143C"
      });
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
  
    socket.on('start', function(ballData) {
      if (document.visibilityState === "hidden") socket.emit('tabOut');
      gameActive = true;
      receiver = ballData.isReceiver;
  
      var x = canvas.width / ballData.ballX;
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
      var touchStartX = 0;
  
      var score = 0;
      var opponentScore = 0;
  
      var countdown = 0;
      var feedback;
  
      function startCountdown() {
        countdown = 3;
        for (let i=3;i>=0;i--) {
          setTimeout(function(){
            countdown--;
          }, 2000 - i*500);
        }
      }
  
      function drawCountdown() {
        if (countdown > 0)  
          text({
            text: countdown, 
            x: canvas.width / 2, 
            y: canvas.height / 2 + 180,
            size: "64px",
            align: "center",
            color: "#0095DD"
          });
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
        text({
          text: "Green: " + score, 
          x: canvas.width / 2, 
          y: canvas.height / 2 + 20,
          size: "32px",
          align: "center",
          color: "#14f500"
        });
        text({
          text: "Orange: " + opponentScore, 
          x: canvas.width / 2, 
          y: canvas.height / 2 - 20,
          size: "32px",
          align: "center",
          color: "#FF6347"
        });
      }
  
      function drawFeedback() {
        text({
          text: feedback, 
          x: 10, 
          y: 35,
          size: "32px",
          color: "#DC143C"
        });
      }
  
      function draw() {
        if (!gamePlaying) return;
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        if (feedback) drawFeedback();
  
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
  
      function paddleMoveMouse(e) {
        if (document.pointerLockElement === canvas) {
          posX += e.movementX*paddleSpeed;
  
          if (posX < -paddleWidth) posX = canvas.width;
          else if (posX > canvas.width) posX = -paddleWidth;
  
          paddleX = posX;
          socket.emit('paddleMove', paddleX);
        }
      }
      function getStartXTouch(e) {
        posX = paddleX;
        touchStartX = e.changedTouches[0].clientX/bounds.width*canvas.width;
        e.preventDefault();
      }
      function paddleMoveTouch(e){
        var dist = e.changedTouches[0].clientX/bounds.width*canvas.width - touchStartX; // calculate dist traveled by touch point
        var pos = posX + dist*paddleSpeed;
  
        if (pos < -paddleWidth) {
          pos = canvas.width;
          posX = canvas.width - dist;
        } else if (pos > canvas.width) {
          pos = -paddleWidth;
          posX = -paddleWidth - dist;
        }
  
        paddleX = pos;
        socket.emit('paddleMove', paddleX);
        e.preventDefault();
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
  
      canvas.addEventListener('mousemove', paddleMoveMouse);
      canvas.addEventListener('touchstart', getStartXTouch); // get start position for touchmove
      canvas.addEventListener('touchmove', paddleMoveTouch);
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
        feedback = "Your opponent is inactive, please wait.";
      });
      socket.on('opponentTabIn', function() {
        startCountdown();
        feedback = null;
        gameActive = true;
      });
  
      startCountdown();
  
      requestAnimationFrame(draw);
    });
}

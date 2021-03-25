var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var bounds = canvas.getBoundingClientRect();

var buttonWidth = 364;
var buttonHeight = 86;
var buttonFontSize = 64;
var buttonScreenTopMargin = 150

var optionsButtonWidth = 200;
var optionsButtonHeight = 46;
var optionsButtonFontSize = 32;
var optionsButtonScreenTopMargin = 510

var buttonScreenLeftMargin = 64;
var buttonMargin = 10;

var paddleSpeed = (
  document.cookie.split('; ').find(row => row.startsWith('pspeed='))
    ? document.cookie.split('; ').find(row => row.startsWith('pspeed=')).split('=')[1]
    : 1
);

var modes = [
  sp = {
    text: 'Singleplayer',
    start: ()=>{ singleplayer(); },
    x: 0,
    y: 0
  },
  mp = {
    text: 'Multiplayer',
    start: ()=>{ multiplayer(); },
    x: 0,
    y: 0
  }
];

var options = [
  ps = {
    text: "Paddle Speed",
    x: 0,
    y: 0,
    action: function() {
      var input = prompt("Set paddle speed (choose a number 0.1 to 5)", paddleSpeed);
      if (!input) return;
      if (isNaN(input)) {
        alert("I ASKED FOR A NUMBER");
        return;
      }
      var num = Math.round((+input+Number.EPSILON)*100) / 100;
      if (num < 0.1 || num > 5) {
        alert("LEARN TO FOLLOW DIRECTIONS");
        return;
      }
      paddleSpeed = num;
      document.cookie = `pspeed=${num}; expires=Tue, 19 Jan 2038 03:14:07 UTC`;
      alert("Set paddle speed to " + paddleSpeed);
    }
  },
  cl = {
    text: "Changelog",
    x: 0,
    y: 0,
    action: function() {
      alert(`
      Mobile/Touchscreen support added
      Added extra options`);
    }
  },
  info = {
    text: "Info",
    x: 0,
    y: 0,
    action: function() {
      alert(`
      My first browser game! No CSS (except for positioning the Canvas).
      Created by 7ih on Github
      Multiplayer library: socket.io`);
    }
  }
]

function menuButtonClick(e) {
  var pos = {
    x: e.changedTouches ? e.changedTouches[0].clientX/bounds.width*canvas.width : e.clientX / bounds.width * canvas.width,
    y: e.changedTouches ? e.changedTouches[0].clientY/bounds.height*canvas.height : e.clientY / bounds.height * canvas.height
  };

  for (let i = 0; i < modes.length; i++) {
    var m = modes[i];
    if (pos.x > m.x && pos.x < m.x + buttonWidth && pos.y > m.y - buttonFontSize && pos.y < m.y + buttonHeight - buttonFontSize) {
      canvas.removeEventListener('mousemove', menuButtonHover);
      canvas.removeEventListener('click', menuButtonClick);
      canvas.removeEventListener('touchmove', menuButtonClick);
      canvas.style.cursor = "default";
      m.start();
    }
  }
  for (let i = 0; i < options.length; i++) {
    var o = options[i];
    if (pos.x > o.x && pos.x < o.x + optionsButtonWidth && pos.y > o.y - optionsButtonFontSize && pos.y < o.y + optionsButtonHeight - optionsButtonFontSize) {
      o.action();
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
    if (pos.x > m.x && pos.x < m.x + buttonWidth && pos.y > m.y - buttonFontSize && pos.y < m.y + buttonHeight - buttonFontSize) 
      buttonHover = true;
  }
  for (let i = 0; i < options.length; i++) {
    var o = options[i];
    if (pos.x > o.x && pos.x < o.x + optionsButtonWidth && pos.y > o.y - optionsButtonFontSize && pos.y < o.y + optionsButtonHeight - optionsButtonFontSize) 
      buttonHover = true;
  }
  if (buttonHover) canvas.style.cursor = "pointer";
  else canvas.style.cursor = "default";
}

function showMenu() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  logo = new Image();
  logo.onload = function() { ctx.drawImage(logo, canvas.width - logo.width - buttonMargin, buttonScreenTopMargin - logo.height/2); }
  logo.width = "550";
  logo.height = "200";
  logo.src = 'img/logo.png';

  for (let i = 0; i < modes.length; i++) {
    var m = modes[i];
    m.x = buttonScreenLeftMargin;
    m.y = buttonScreenTopMargin + i * (buttonHeight + buttonMargin);
    var hlColor = (i % 2 == 0 ? "dodgerBlue" : "red");
    rect({
      x: m.x,
      y: m.y - buttonFontSize,
      w: buttonWidth,
      h: buttonHeight,
    }, hlColor);
    text({
      text: m.text, 
      x: m.x, 
      y: m.y,
      font: "Comic Sans MS, Comic Sans, Cursive",
      size: buttonFontSize + "px"
    });
  }

  var optionsRow = 0;
  var evenColor = true;
  for (let i = 0; i < options.length; i++) {
    if (i > 0) {
      if (i % 2 == 0) {
        optionsRow++;
      }
      else evenColor = !evenColor;
    }

    var o = options[i];
    o.x = buttonScreenLeftMargin + optionsRow*(optionsButtonWidth + buttonMargin);
    o.y = (i % 2 == 0 ? optionsButtonScreenTopMargin : optionsButtonScreenTopMargin + optionsButtonHeight + buttonMargin);
    var hlColor = (evenColor ? "dodgerBlue" : "red");

    rect({
      x: o.x,
      y: o.y - optionsButtonFontSize,
      w: optionsButtonWidth,
      h: optionsButtonHeight,
    }, hlColor);
    text({
      text: o.text, 
      x: o.x, 
      y: o.y,
      font: "Comic Sans MS, Comic Sans, Cursive",
      size: optionsButtonFontSize + "px"
    });
  }

  canvas.addEventListener('mousemove', menuButtonHover);
  canvas.addEventListener('click', menuButtonClick);
  canvas.addEventListener('touchmove', menuButtonClick);
}

canvas.oncontextmenu = function() { return false; }
document.body.onresize = function() { bounds = canvas.getBoundingClientRect(); }

function rect(prop, color) {
  ctx.beginPath();
  ctx.rect(prop.x, prop.y, prop.w, prop.h);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
function text(prop) {
  ctx.font = `${prop.size} ${prop.font ? prop.font : "Arial"}`;
  ctx.fillStyle = prop.color ? prop.color : "black";
  ctx.textAlign = prop.align ? prop.align : "start";
  ctx.fillText(prop.text, prop.x, prop.y);
}

showMenu();

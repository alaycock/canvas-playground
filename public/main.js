var RADIUS = 5;
var OUTSIDE_LIMIT = 30;
var DOT_FREQUENCY = 8000;
var BACKGROUND_COLOR = "#484854";
var FOREGROUND_COLOR = function(alpha) {
  return "rgba(0, 188, 212, " + alpha + ")";
};

var dots = [];
var lines = [];
var dotCount = 0;

function onLoad() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext("2d");
  window.onresize = resizeWindow;

  resizeWindow();
  createCircles();
  setInterval(loop, 20);
}

function resizeWindow() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var area = (canvas.width + OUTSIDE_LIMIT * 2) * (canvas.height + OUTSIDE_LIMIT * 2);
  dotCount = area / DOT_FREQUENCY;
}

function loop() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0,0, canvas.width, canvas.height);

  // Draw circles
  for(var i = 0; i < dots.length; i++) {
    var item = dots[i];
    var color = "green";
    if(item.collision)
      color = "red";

    color = ctx.fillStyle = FOREGROUND_COLOR(1);
    drawCircle(item.x, item.y, color);
    updateCircle(item);
    collideWithinRadius(item, i + 1, RADIUS * 2, triggerLightning);
  }

  // Draw lines
  for(var i = 0; i < lines.length; i++) {
    var item = lines[i];
    drawLine(item)
    updateLine(item);
  }

  // Cleanup lines
  lines = lines.filter(function(item) {
    return item.opacity > 0;
  });
}

function drawCircle(x, y, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, RADIUS, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.shadowColor = FOREGROUND_COLOR(1);
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fill();
  ctx.restore();
}

function drawLine(item) {
  ctx.save();
  var dot1 = item.first;
  var dot2 = item.second;
  ctx.beginPath();
  ctx.moveTo(dot1.x, dot1.y);
  ctx.lineTo(dot2.x, dot2.y);
  ctx.strokeStyle = FOREGROUND_COLOR(item.opacity);
  ctx.shadowColor = FOREGROUND_COLOR(1);
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.stroke();
  ctx.restore();
}

function createCircles() {
  for(var i = 0; i < dotCount; i++) {
    dots[i] = {
      x: Math.random() * (canvas.width + OUTSIDE_LIMIT) - OUTSIDE_LIMIT,
      y: Math.random() * (canvas.height + OUTSIDE_LIMIT) - OUTSIDE_LIMIT,
      angle: Math.random() * (Math.PI * 2),
      collision: false,
      index: i,
      has_line: false,
      speed: Math.random() * (.7 - .2) + .2
    };
  }
}

function createLine(dot1, dot2) {
  lines.push({
    first: dot1,
    second: dot2,
    opacity: 1
  });
  dot1.has_line = true;
  dot2.has_line = true;
}

function updateLine(item) {
  item.opacity -= .01;
  if(item.opacity <= 0) {
    item.first.has_line = false;
    item.second.has_line = false;
  }
}

function updateCircle(circle) {
  var vx = circle.speed * Math.sin(circle.angle);
  var vy = circle.speed * -Math.cos(circle.angle);

  circle.x += vx;
  circle.y += vy;

  // Go offscreen, then bounce back
  if (circle.x < -OUTSIDE_LIMIT || circle.x > canvas.width + OUTSIDE_LIMIT)
    circle.angle = Math.PI * 2 - circle.angle;
  if (circle.y < -OUTSIDE_LIMIT || circle.y > canvas.height + OUTSIDE_LIMIT)
    circle.angle = Math.PI * 2 - circle.angle + Math.PI;
}

function findWithinRadius(startDot, startingIndex, radius, callback) {
  for(var j = startingIndex; j < dots.length; j++) {
    var dot2 = dots[j];
    if(distanceBetween(startDot, dot2) < radius && startDot.index != dot2.index) {
      callback(startDot, dot2);
    }
  }
}

function collideWithinRadius(startDot, startingIndex, radius, callback) {
  var anyIntersections = false;
  for(var j = startingIndex; j < dots.length; j++) {
    var dot2 = dots[j];
    if(distanceBetween(startDot, dot2) < radius && startDot.index != dot2.index) {

      if(!startDot.collision) {
        callback(startDot, dot2);
      }

      startDot.collision = true;
      dot2.collision = true;
      anyIntersections = true;
    }
  }

  if(!anyIntersections){
    startDot.collision = false;
  }
}

function distanceBetween(dot1, dot2) {
  var a = dot1.x - dot2.x;
  var b = dot1.y - dot2.y;
  var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  return c;
}

function triggerLightning(dot1, dot2) {
  if(!dot1.has_line) {
    findWithinRadius(dot1, 0, 100, chainLightning);
  }
}

function chainLightning(dot1, dot2) {
  if(!dot2.has_line) {
    createLine(dot1, dot2);
    setTimeout(function() {
      findWithinRadius(dot2, 0, 100, chainLightning);
    }, 60);
  }
}

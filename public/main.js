var dots = [];
var explosions = [];
var lines = [];
var RADIUS = 5;

function onLoad() {
  canvas = document.getElementById('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight / 2;
  ctx = canvas.getContext("2d");

  createCircles();
  setInterval(loop, 20);
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw circles
  for(var i = 0; i < dots.length; i++) {
    var item = dots[i];
    var color = "green";
    if(item.collision)
      color = "red";

    color = ctx.fillStyle = "rgba(0, 188, 212, 1)";
    drawCircle(item.x, item.y, color);
    updateCircle(item);
    collideWithinRadius(item, i+1, RADIUS * 2, triggerLightning);
  }

  // Draw lines
  for(var i = 0; i < lines.length; i++) {
    var item = lines[i];
    drawLine(item)
    updateLine(item);
  }

  // Draw explosions
  for(var i = 0; i < explosions.length; i++) {
    var item = explosions[i];
    drawExplosion(item)
    updateExplosion(item);
  }

  // Cleanup lines
  lines = lines.filter(function(item) {
    return item.opacity > 0;
  });

  // Cleanup explosions
  explosions = explosions.filter(function(item) {
    return item.opacity > 0 && item.radius > 0;
  });
}

function drawCircle(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, RADIUS, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(item) {
  var dot1 = item.first;
  var dot2 = item.second;
  ctx.beginPath();
  ctx.moveTo(dot1.x, dot1.y);
  ctx.lineTo(dot2.x, dot2.y);
  ctx.strokeStyle = "rgba(0, 188, 212, " + item.opacity + ")";
  ctx.stroke();
}

function drawExplosion(item) {
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = "rgba(0, 188, 212, " + item.opacity + ")";
  ctx.fill();
}

function createCircles() {
  for(var i = 0; i < 40; i++) {
    dots[i] = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
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

function createExplosion(dot1, dot2) {
  var midX = (dot1.x + dot2.x) / 2;
  var midY = (dot1.y + dot2.y) / 2;
  explosions.push({
    x: midX,
    y: midY,
    opacity: 1,
    radius: 13
  });
}

function updateLine(item) {
  item.opacity -= .02;
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

  if (circle.x < 0 || circle.x > canvas.width)
    circle.angle = Math.PI * 2 - circle.angle;
  if (circle.y < 0 || circle.y > canvas.height)
    circle.angle = Math.PI * 2 - circle.angle + Math.PI;
}

function updateExplosion(item) {
  item.opacity -= .02;
  item.radius -= .3;
}

function findWithinRadius(startDot, startingIndex, radius, callback) {
  var anyIntersections = false;
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
    // createExplosion(dot1, dot2);
  }
}

function chainLightning(dot1, dot2) {
  if(!dot2.has_line) {
    createLine(dot1, dot2);
    findWithinRadius(dot2, 0, 100, chainLightning);
  }
}

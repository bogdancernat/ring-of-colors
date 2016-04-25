"use strict";
var colors = {
  background: tinycolor('#1f1f34'),
  darkerBlue: tinycolor('#21285a'),
  blue: tinycolor('#4363fe'),
  purple: tinycolor('#6a52cd'),
  red: tinycolor('#ff635a'),
  orange: tinycolor('#ff8d63'),
  yellow: tinycolor('#ffff63'),
  yellowLighter: tinycolor('#ffff95'),
  white: tinycolor('#fff')
};

var app = (function (root) {
  var x         = {}
  , canvas      = null
  , context     = null
  , center      = { x: 0, y: 0 }
  , play        = true
  , pixelRatios = {}
  , arcAspect = {
    distFromCenter: 0,
    width: 0,
    easing: root.tb.easing.easeOutQuart,
    baseGrowthRate: 0.9,
    currentGrowthRate: undefined,
    currentArcSpread: 0,
    rootAngle: 270,
    growthAngleSwitch: 270,
    distFromMargin: 0,
    grow: true
  }
  , arcs = [];

  x.ignite = function () {
    canvas  = document.querySelector('#spinner-wrapper');
    context = canvas.getContext('2d');
    this.updateSizes();

    addArc(0, colors.darkerBlue);
    addArc(0, colors.blue);
    addArc(0, colors.purple);
    addArc(0, colors.red);
    addArc(0, colors.orange);
    addArc(0, colors.yellow);
    addArc(0, colors.yellowLighter);

    x.animate();
    // draw();
  };
  
  x.play = function () {
    play = true;
    x.animate();
  };
  
  x.stop = function () {
    play = false;
  };
  
  x.isPlaying = function () {
    return play;
  };
  
  x.updateSizes = function () {
    var diameter;

    pixelRatios = root.tb.getPixelRatios(context);
    
    canvas.height = window.innerHeight;
    canvas.width  = window.innerWidth;

    if (pixelRatios.device !== pixelRatios.context) {
      canvas.height *= pixelRatios.ratio;
      canvas.width  *= pixelRatios.ratio;
    }

    center.x = canvas.width / 2;
    center.y = canvas.height / 2;
    
    diameter = canvas.width < canvas.height ? canvas.width : canvas.height;
    
    arcAspect.distFromMargin = 20 / 100 * (diameter / 2);
    arcAspect.width          = 60 / 100 * (diameter / 2) - arcAspect.distFromMargin;
    arcAspect.distFromCenter = (diameter / 2) - arcAspect.width - arcAspect.distFromMargin;

    draw();
  };
  
  x.animate = function () {
    draw();

    if (play) {
      root.requestAnimationFrame(x.animate);
    }
  };
  
  function addArc(spread, color){
    arcs.push({
      angleSpread: spread,
      color: color.toRgbString(),
    });
  }

  function updateArcs() {
    if (arcAspect.currentGrowthRate === undefined) {
      arcAspect.currentGrowthRate = arcAspect.baseGrowthRate;
    }
 
    var totalSpreadChange = 0;
    var growValue = 0;

    if (arcAspect.currentArcSpread > arcAspect.growthAngleSwitch) {
      arcAspect.grow = false;

      setTimeout(function () {
        play = false;
      }, 1000);
    }

    if (arcAspect.currentArcSpread < 5) {
      arcAspect.grow = true;
      arcAspect.currentGrowthRate = arcAspect.baseGrowthRate;
    }

    growValue = arcAspect.currentGrowthRate;
    arcAspect.currentArcSpread = 0;

    if (!arcAspect.grow) {
      growValue *= -1;
    }

    for (var i = arcs.length - 1; i >= 0; i--) {
      arcs[i].angleSpread += growValue * (i + 1);
      totalSpreadChange += growValue * (i + 1);

      if (arcs[i].angleSpread < 0) {
        arcs[i].angleSpread = 0;
      }

      arcAspect.currentArcSpread += arcs[i].angleSpread;
    }

    if ((arcAspect.grow && arcAspect.currentArcSpread > 0.7 * arcAspect.growthAngleSwitch) || !arcAspect.grow) {
      arcAspect.rootAngle = (arcAspect.rootAngle + Math.abs(totalSpreadChange)) % 360;
    }
    // update growth rate
    arcAspect.currentGrowthRate = arcAspect.easing(arcAspect.currentGrowthRate) / 3;
  }

  function draw() {
    var arc;
    var currentRootAngle = arcAspect.rootAngle;

    clearCanvas();

    for (var i = 0; i < arcs.length; i++) {
      arc = arcs[i];
      drawArc(arcAspect.distFromCenter, arcAspect.width, currentRootAngle, arc.angleSpread, arc.color);
      currentRootAngle = (currentRootAngle + arc.angleSpread) % 360;
    }

    // arcAspect.rootAngle += 0.1;
    updateArcs();
  }
  
  
  function drawArc(distanceFromCenter, width, rootAngle, angleSpread, color) {
    var internalCircle = {}, outerCircle = {};

    var targetAngle   = angleSpread === 360 ? rootAngle - 1 : (rootAngle + angleSpread) % 360
    , drawEndPoints   = false
    , drawClockCenter = false
    ;

    internalCircle.radius = distanceFromCenter;
    internalCircle.start  = root.tb.getCoordsOnCircle(rootAngle, internalCircle.radius, center);
    internalCircle.end    = root.tb.getCoordsOnCircle(targetAngle, internalCircle.radius, center);
    
    outerCircle.radius = distanceFromCenter + width;
    outerCircle.start  = root.tb.getCoordsOnCircle(rootAngle, outerCircle.radius, center);
    outerCircle.end    = root.tb.getCoordsOnCircle(targetAngle, outerCircle.radius, center);

    var startAngle = ((Math.PI * 2) * rootAngle) / 360
    , endAngle     = ((Math.PI * 2) * targetAngle) / 360
    ;
    
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(center.x, center.y, internalCircle.radius, endAngle, startAngle, true); // from green to red
    context.lineTo(outerCircle.start.x, outerCircle.start.y); // -> teal
    context.arc(center.x, center.y, outerCircle.radius, startAngle, endAngle, false); // from magenta to teal 
    context.moveTo(outerCircle.end.x, outerCircle.end.y); // -> magenta
    context.lineTo(internalCircle.end.x, internalCircle.end.y); // -> green
    context.closePath();
    context.stroke();
    context.fillStyle = color;
    context.fill();

    if(drawClockCenter) {
      drawCircle(center, 5, colors.red.toRgbString());
    }

    if(drawEndPoints) {
      drawCircle(internalCircle.start, 3, colors.red.toRgbString());
      drawCircle(internalCircle.end, 3, colors.purple.toRgbString());
      drawCircle(outerCircle.start, 3, colors.yellow.toRgbString());
      drawCircle(outerCircle.end, 3, colors.orange.toRgbString());
    }
  }

  function clearCanvas() {
    colors.background.setAlpha(0.3);
    context.fillStyle = colors.background.toRgbString();
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  function drawCircle(coords, radius, color) {
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(coords.x, coords.y, radius, 0, Math.PI * 2, true);
    context.stroke();
    context.fillStyle = color;
    context.fill();
    context.closePath();
  }

  return x;
}(window));

window.onload = function () {
  app.ignite();
};

window.onresize = function () {
  app.updateSizes();
};
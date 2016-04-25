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
  , arcConfig   = {
    maxArcLength: 270,
    minArcLength: 0,
    distanceFromCenter: 0,
    easing: root.tb.easing.easeInOutCubic,
    animationDuration: 1000, // in ms
    distanceFromMargin: 0,
    maxRingRotation: 30,
  }
  , arcState = {
    startAngle: 270,
    arcLength: arcConfig.minArcLength,
    growing: true,
    startTime: undefined, // in ms
    totalArcSegmentUnits: 0,
    currentRingRotation: 0
  }
  , arcSegments = []
  ;


  x.ignite = function () {
    canvas  = document.querySelector('#spinner-wrapper');
    context = canvas.getContext('2d');
    this.updateSizes();

    addArcSegment(colors.darkerBlue);
    addArcSegment(colors.blue);
    addArcSegment(colors.purple);
    addArcSegment(colors.red);
    addArcSegment(colors.orange);
    addArcSegment(colors.yellow);
    addArcSegment(colors.yellowLighter);

    arcState.startTime = new Date().getTime();
    x.animate();
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
    
    arcConfig.distanceFromMargin = 20 / 100 * (diameter / 2);
    arcConfig.thickness          = 60 / 100 * (diameter / 2) - arcConfig.distanceFromMargin;
    arcConfig.distanceFromCenter = (diameter / 2) - arcConfig.thickness - arcConfig.distanceFromMargin;
  };
  
  x.animate = function () {
    draw();

    if (play) {
      root.requestAnimationFrame(x.animate);
    }
  };
  
  function addArcSegment(color){
    arcSegments.push({
      angleSpread: 0,
      sizeUnits: root.tb.fiboFromPosition(arcSegments.length),
      color: color.toRgbString(),
    });

    arcState.totalArcSegmentUnits += arcSegments[arcSegments.length - 1].sizeUnits;
  }

  function updateArc() {
    var now = new Date().getTime()
    , timeEllapsed = now - arcState.startTime
    , timeProgress = timeEllapsed / arcConfig.animationDuration
    , arcLengthProgress
    , arcLengthUpdated
    ;

    if (!arcState.growing) {
      arcLengthProgress = arcConfig.easing(1 - timeProgress);
    } else {
      arcLengthProgress = arcConfig.easing(timeProgress);
    }
    
    if (arcLengthProgress < 0) {
      arcLengthProgress = 0;
    }

    arcLengthUpdated = arcLengthProgress * arcConfig.maxArcLength;

    if (!arcState.growing) {
      // make the end of the arc stay still
      arcState.startAngle = arcState.startAngle + arcState.arcLength - arcLengthUpdated;
    }
    
    // make ring rotatate a bit while it changes it's arc length
    arcState.startAngle = (arcState.startAngle + timeProgress * arcConfig.maxRingRotation - arcState.currentRingRotation) % 360;
    arcState.currentRingRotation = timeProgress * arcConfig.maxRingRotation;
    
    arcState.arcLength = arcLengthUpdated;

    if (arcState.arcLength >= arcConfig.maxArcLength) {
      arcState.growing   = false;
      arcState.startTime = new Date().getTime();
      arcState.currentRingRotation = 0;
    }

    if (arcState.arcLength <= arcConfig.minArcLength) {
      arcState.arcLength = arcConfig.minArcLength;
      arcState.growing   = true;
      arcState.startTime = new Date().getTime();
      arcState.currentRingRotation = 0;
    }
  }

  function draw() {
    var segmentCount          = arcSegments.length
    , arcSegment
    , arcSegmentStartAngle    = arcState.startAngle
    , arcSegmentAngleSize
    , arcSegmentWidthUnitSize = arcState.arcLength / arcState.totalArcSegmentUnits
    ;
    
    clearCanvas();

    for (var i = 0; i < segmentCount; i++) {
      arcSegment          = arcSegments[i];
      arcSegmentAngleSize = arcSegment.sizeUnits * arcSegmentWidthUnitSize;

      drawArcSegment(arcConfig.distanceFromCenter,
                    arcConfig.thickness,
                    arcSegmentStartAngle,
                    arcSegmentAngleSize,
                    arcSegment.color);

      arcSegmentStartAngle = (arcSegmentStartAngle + arcSegmentAngleSize) % 360;
    }

    updateArc();
  }
  
  
  function drawArcSegment(distanceFromCenter, thickness, angleToStartFrom, angleSpread, color) {
    var internalCircle = {}
    , outerCircle      = {}
    ;

    var targetAngle   = angleSpread === 360 ? angleToStartFrom - 1 : (angleToStartFrom + angleSpread) % 360
    , drawEndPoints   = false
    , drawClockCenter = false
    ;

    internalCircle.radius = distanceFromCenter;
    internalCircle.start  = root.tb.getCoordsOnCircle(angleToStartFrom, internalCircle.radius, center);
    internalCircle.end    = root.tb.getCoordsOnCircle(targetAngle, internalCircle.radius, center);
    
    outerCircle.radius = distanceFromCenter + thickness;
    outerCircle.start  = root.tb.getCoordsOnCircle(angleToStartFrom, outerCircle.radius, center);
    outerCircle.end    = root.tb.getCoordsOnCircle(targetAngle, outerCircle.radius, center);

    var angle = {
      start: ((Math.PI * 2) * angleToStartFrom) / 360,
      end: ((Math.PI * 2) * targetAngle) / 360
    }
    
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(center.x, center.y, internalCircle.radius, angle.end, angle.start, true); // from green to red
    context.lineTo(outerCircle.start.x, outerCircle.start.y); // -> teal
    context.arc(center.x, center.y, outerCircle.radius, angle.start, angle.end, false); // from magenta to teal 
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
    colors.background.setAlpha(0.9);
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
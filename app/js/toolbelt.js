(function (root) {
  "use strict";
  var belt = function () {
    this.goldenRatio = (2 + Math.sqrt(5)) / 2;
  };
  
  belt.getRadians = function (angle) {
    return angle * Math.PI / 180;
  };
  
  belt.distAB = function (p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };
  
  belt.getCoordsOnCircle = function (angle, distance, optCoords) {
    var rad = this.getRadians(angle),
      c = {};
    optCoords = (typeof optCoords === "undefined") ? {x: 0, y: 0} : optCoords;
    c.x = Math.cos(rad) * distance + optCoords.x;
    c.y = Math.sin(rad) * distance + optCoords.y;
    return c;
  };
  
  belt.isLeapYear = function (year) {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
  };
  
  belt.getDaysInMonth = function (month, year, zeroIndex) {
    var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      leapDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if(this.isLeapYear(year)) {
      return zeroIndex?leapDays[month]:leapDays[month-1];    
    }
    return zeroIndex?days[month]:days[month-1];    
    
  };

  belt.getPixelRatios = function (context) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
              context.mozBackingStorePixelRatio ||
              context.msBackingStorePixelRatio ||
              context.oBackingStorePixelRatio ||
              context.backingStorePixelRatio || 1;

    return {
      device: devicePixelRatio,
      context: backingStoreRatio,
      ratio: devicePixelRatio / backingStoreRatio
    };
  };

  belt.easing = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
  };

  root.requestAnimationFrame = (function () {
    return window.requestAnimationFrame    ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function (callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
  }());
  root.tb = belt;
}(window));
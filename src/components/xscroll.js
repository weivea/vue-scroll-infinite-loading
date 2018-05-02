function getXScroll() {
  var rAF =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  var utils = (function() {
    var me = {};

    var _elementStyle = document.createElement('div').style;
    var _vendor = (function() {
      var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
        transform,
        i = 0,
        l = vendors.length;

      for (; i < l; i++) {
        transform = vendors[i] + 'ransform';
        if (transform in _elementStyle)
          return vendors[i].substr(0, vendors[i].length - 1);
      }

      return false;
    })();

    function _prefixStyle(style) {
      if (_vendor === false) return false;
      if (_vendor === '') return style;
      return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    me.getTime =
      Date.now ||
      function getTime() {
        return new Date().getTime();
      };

    me.extend = function(target, obj) {
      for (var i in obj) {
        target[i] = obj[i];
      }
    };

    me.addEvent = function(el, type, fn, capture) {
      el.addEventListener(type, fn, !!capture);
    };

    me.removeEvent = function(el, type, fn, capture) {
      el.removeEventListener(type, fn, !!capture);
    };

    me.prefixPointerEvent = function(pointerEvent) {
      return window.MSPointerEvent
        ? 'MSPointer' +
            pointerEvent.charAt(7).toUpperCase() +
            pointerEvent.substr(8)
        : pointerEvent;
    };

    me.momentum = function(
      current,
      start,
      time,
      lowerMargin,
      wrapperSize,
      deceleration
    ) {
      var distance = current - start,
        speed = Math.abs(distance) / time,
        destination,
        duration;

      deceleration = deceleration === undefined ? 0.0006 : deceleration;

      destination =
        current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
      duration = speed / deceleration;

      // if (destination < lowerMargin) {
      //   destination = wrapperSize
      //     ? lowerMargin - wrapperSize / 2.5 * (speed / 8)
      //     : lowerMargin;
      //   distance = Math.abs(destination - current);
      //   duration = distance / speed;
      // } else if (destination > 0) {
      //   destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
      //   distance = Math.abs(current) + destination;
      //   duration = distance / speed;
      // }

      return {
        destination: Math.round(destination),
        duration: duration
      };
    };

    var _transform = _prefixStyle('transform');

    me.extend(me, {
      hasTransform: _transform !== false,
      hasPerspective: _prefixStyle('perspective') in _elementStyle,
      hasTouch: 'ontouchstart' in window,
      hasPointer: !!(window.PointerEvent || window.MSPointerEvent), // IE10 is prefixed
      hasTransition: _prefixStyle('transition') in _elementStyle
    });

    /*
  This should find all Android browsers lower than build 535.19 (both stock browser and webview)
  - galaxy S2 is ok
    - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
    - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
   - galaxy S3 is badAndroid (stock brower, webview)
     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
   - galaxy S4 is badAndroid (stock brower, webview)
     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
   - galaxy S5 is OK
     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
   - galaxy S6 is OK
     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
  */
    me.isBadAndroid = (function() {
      var appVersion = window.navigator.appVersion;
      // Android browser is not a chrome browser.
      if (/Android/.test(appVersion) && !/Chrome\/\d/.test(appVersion)) {
        var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
        if (
          safariVersion &&
          typeof safariVersion === 'object' &&
          safariVersion.length >= 2
        ) {
          return parseFloat(safariVersion[1]) < 535.19;
        } else {
          return true;
        }
      } else {
        return false;
      }
    })();

    me.extend((me.style = {}), {
      transform: _transform,
      transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
      transitionDuration: _prefixStyle('transitionDuration'),
      transitionDelay: _prefixStyle('transitionDelay'),
      transformOrigin: _prefixStyle('transformOrigin'),
      touchAction: _prefixStyle('touchAction')
    });

    me.hasClass = function(e, c) {
      var re = new RegExp('(^|\\s)' + c + '(\\s|$)');
      return re.test(e.className);
    };

    me.addClass = function(e, c) {
      if (me.hasClass(e, c)) {
        return;
      }

      var newclass = e.className.split(' ');
      newclass.push(c);
      e.className = newclass.join(' ');
    };

    me.removeClass = function(e, c) {
      if (!me.hasClass(e, c)) {
        return;
      }

      var re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g');
      e.className = e.className.replace(re, ' ');
    };

    me.offset = function(el) {
      var left = -el.offsetLeft,
        top = -el.offsetTop;

      // jshint -W084
      while ((el = el.offsetParent)) {
        left -= el.offsetLeft;
        top -= el.offsetTop;
      }
      // jshint +W084

      return {
        left: left,
        top: top
      };
    };

    me.preventDefaultException = function(el, exceptions) {
      for (var i in exceptions) {
        if (exceptions[i].test(el[i])) {
          return true;
        }
      }

      return false;
    };

    me.extend((me.eventType = {}), {
      touchstart: 1,
      touchmove: 1,
      touchend: 1,

      mousedown: 2,
      mousemove: 2,
      mouseup: 2,

      pointerdown: 3,
      pointermove: 3,
      pointerup: 3,

      MSPointerDown: 3,
      MSPointerMove: 3,
      MSPointerUp: 3
    });

    me.extend((me.ease = {}), {
      quadratic: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: function(k) {
          return k * (2 - k);
        }
      },
      circular: {
        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
        fn: function(k) {
          return Math.sqrt(1 - --k * k);
        }
      },
      back: {
        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fn: function(k) {
          var b = 4;
          return (k = k - 1) * k * ((b + 1) * k + b) + 1;
        }
      }
    });

    me.tap = function(e, eventName) {
      var ev = document.createEvent('Event');
      ev.initEvent(eventName, true, true);
      ev.pageX = e.pageX;
      ev.pageY = e.pageY;
      e.target.dispatchEvent(ev);
    };

    me.click = function(e) {
      var target = e.target,
        ev;

      if (!/(SELECT|INPUT|TEXTAREA)/i.test(target.tagName)) {
        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
        // initMouseEvent is deprecated.
        ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
        ev.initEvent('click', true, true);
        ev.view = e.view || window;
        ev.detail = 1;
        ev.screenX = target.screenX || 0;
        ev.screenY = target.screenY || 0;
        ev.clientX = target.clientX || 0;
        ev.clientY = target.clientY || 0;
        ev.ctrlKey = !!e.ctrlKey;
        ev.altKey = !!e.altKey;
        ev.shiftKey = !!e.shiftKey;
        ev.metaKey = !!e.metaKey;
        ev.button = 0;
        ev.relatedTarget = null;
        ev._constructed = true;
        target.dispatchEvent(ev);
      }
    };

    me.getTouchAction = function(eventPassthrough, addPinch) {
      var touchAction = 'none';
      if (eventPassthrough === 'vertical') {
        touchAction = 'pan-y';
      } else if (eventPassthrough === 'horizontal') {
        touchAction = 'pan-x';
      }
      if (addPinch && touchAction != 'none') {
        // add pinch-zoom support if the browser supports it, but if not (eg. Chrome <55) do nothing
        touchAction += ' pinch-zoom';
      }
      return touchAction;
    };

    me.getRect = function(el) {
      if (el instanceof SVGElement) {
        var rect = el.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        };
      } else {
        return {
          top: el.offsetTop,
          left: el.offsetLeft,
          width: el.offsetWidth,
          height: el.offsetHeight
        };
      }
    };
    return me;
  })();

  function XScroll(el, options) {
    this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
    this.options = {
      preventDefault: false,
      preventDefaultException: false,
      disableMouse: false      
    };

    // Some defaults
    this.x = 0;
    this.y = 0;
    this.directionX = 0;
    this.directionY = 0;
    this._events = {};
    this._initEvents();
  }

  XScroll.prototype = {

    _start: function (e) {
      // React to left mouse button only
      
      
      if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
        e.preventDefault();
      }

      var point = e.touches ? e.touches[0] : e,
        pos;

      this.initiated = utils.eventType[e.type];
      this.moved = false;
      this.distX = 0;
      this.distY = 0;
      this.directionX = 0;
      this.directionY = 0;
      this.directionLocked = 0;

      this.startTime = utils.getTime();

      if (this.isInTransition) {
        this.isInTransition = false;
        this._execEvent('scrollEndInTrans');
        return;
      }
      this._execEvent('start');
      this._transitionTime();
      this.x = 0;
      this.y = 0;
      this.startX = this.x;
      this.startY = this.y;
      this.absStartX = this.x;
      this.absStartY = this.y;
      this.pointX = point.pageX;
      this.pointY = point.pageY;

      this._execEvent('beforeScrollStart');
    },

    _move: function (e) {
      if (utils.eventType[e.type] !== this.initiated) {
        console.log(this.initiated)
        return;
      }

      if (this.options.preventDefault) {	// increases performance on Android? TODO: check!
        e.preventDefault();
      }

      var point = e.touches ? e.touches[0] : e,
        deltaX = point.pageX - this.pointX,
        deltaY = point.pageY - this.pointY,
        timestamp = utils.getTime(),
        newX, newY,
        absDistX, absDistY;

      this.pointX = point.pageX;
      this.pointY = point.pageY;

      this.distX += deltaX;
      this.distY += deltaY;
      absDistX = Math.abs(this.distX);
      absDistY = Math.abs(this.distY);

      // We need to move at least 10 pixels for the scrolling to initiate
      if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
        return;
      }

      // If you are scrolling in one direction lock the other
      if (!this.directionLocked) {
        if (absDistX > absDistY + this.options.directionLockThreshold) {
          this.directionLocked = 'h';		// lock horizontally
        } else if (absDistY >= absDistX + this.options.directionLockThreshold) {
          this.directionLocked = 'v';		// lock vertically
        } else {
          this.directionLocked = 'n';		// no lock
        }
      }

      if (this.directionLocked == 'h') {
        deltaY = 0;
      } else if (this.directionLocked == 'v') {
        deltaX = 0;
      }

      newX = this.x + deltaX;
      newY = this.y + deltaY;

      // Slow down if outside of the boundaries
      // if (newX > 0 || newX < this.maxScrollX) {
      //   newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
      // }
      // if (newY > 0 || newY < this.maxScrollY) {
      //   newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
      // }

      this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
      this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

      if (!this.moved) {
        this._execEvent('scrollStart');// 滑动开始
      }
      this.moved = true;

      this._translate(newX, newY);

      /* REPLACE START: _move */

      if (timestamp - this.startTime > 300) {
        this.startTime = timestamp;
        this.startX = this.x;
        this.startY = this.y;
      }

      /* REPLACE END: _move */

    },

    _end: function (e) {
      if (utils.eventType[e.type] !== this.initiated) {
        return;
      }

      if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
        e.preventDefault();
      }

      var point = e.changedTouches ? e.changedTouches[0] : e,
        momentumX,
        momentumY,
        duration = utils.getTime() - this.startTime,
        newX = Math.round(this.x),
        newY = Math.round(this.y),
        distanceX = Math.abs(newX - this.startX),
        distanceY = Math.abs(newY - this.startY),
        time = 0,
        easing = utils.ease.circular;

      this.isInTransition = 0;
      this.initiated = 0;
      this.endTime = utils.getTime();


      // ensures that the last position is rounded
      this._translate(newX, newY);

      // we scrolled less than 10 pixels
      if (!this.moved) {
        this._execEvent('scrollCancel');
        return;
      }

      if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
        this._execEvent('flick');
        return;
      }

      // start momentum animation if needed
      if (duration < 300) {
        momentumX = utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration);
        momentumY = utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration);
        newX = momentumX.destination;
        newY = momentumY.destination;
        time = Math.max(momentumX.duration, momentumY.duration);
        this.isInTransition = 1;
        setTimeout(() => {
          this.isInTransition = 0;
        }, time);
      }

      // INSERT POINT: _end

      if (newX != this.x || newY != this.y) {
        this._execEvent('transChange', utils.style.transitionTimingFunction, easing);
        this._transitionTime(time);
        this._translate(newX, newY);
        return;
      }


      this._execEvent('scrollEnd');
    },

    _initEvents: function (remove) {
      var eventType = remove ? utils.removeEvent : utils.addEvent,
        target = this.wrapper;
      if (!this.options.disableMouse) {
        eventType(this.wrapper, 'mousedown', this);
        eventType(target, 'mousemove', this);
        eventType(target, 'mousecancel', this);
        eventType(target, 'mouseup', this);
      }

      if (utils.hasPointer && !this.options.disablePointer) {
        eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
        eventType(target, utils.prefixPointerEvent('pointermove'), this);
        eventType(target, utils.prefixPointerEvent('pointercancel'), this);
        eventType(target, utils.prefixPointerEvent('pointerup'), this);
      }

      if (utils.hasTouch && !this.options.disableTouch) {
        eventType(this.wrapper, 'touchstart', this);
        eventType(target, 'touchmove', this);
        eventType(target, 'touchcancel', this);
        eventType(target, 'touchend', this);
      }
    },
    
    handleEvent: function (e) {
      console.log(e.type)
      switch (e.type) {
        case 'touchstart':
        case 'pointerdown':
        case 'MSPointerDown':
        case 'mousedown':
          this._start(e);
          break;
        case 'touchmove':
        case 'pointermove':
        case 'MSPointerMove':
        case 'mousemove':
          this._move(e);
          break;
        case 'touchend':
        case 'pointerup':
        case 'MSPointerUp':
        case 'mouseup':
        case 'touchcancel':
        case 'pointercancel':
        case 'MSPointerCancel':
        case 'mousecancel':
          this._end(e);
          break;
        default: break;
      }
    },
    
    _transitionTime: function (time) {
      time = time || 0;
      var durationProp = utils.style.transitionDuration;
      if (!durationProp) {
        return;
      }
      this._execEvent('transChange', durationProp, time + 'ms');
    },
    on: function (type, fn) {
      if (!this._events[type]) {
        this._events[type] = [];
      }

      this._events[type].push(fn);
    },

    off: function (type, fn) {
      if (!this._events[type]) {
        return;
      }

      var index = this._events[type].indexOf(fn);

      if (index > -1) {
        this._events[type].splice(index, 1);
      }
    },

    _translate: function (x, y) {
      this._execEvent('positionChange', utils.style.transform, x, y);
      this.x = x;
      this.y = y;
    },
    _execEvent: function (type) {
      if (!this._events[type]) {
        return;
      }

      var i = 0,
        l = this._events[type].length;

      if (!l) {
        return;
      }

      for (; i < l; i++) {
        this._events[type][i].apply(this, [].slice.call(arguments, 1));
      }
    },
  };
  return XScroll;
}
export default getXScroll;

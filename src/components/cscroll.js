function CScroll(el, options) {
  this.wrapper = typeof el == 'string' ? document.querySelector(el) : el
  this.options = {
    preventDefault: true,
    disableMouse: false,
    disablePointer: false,
    disableTouch: false
  }
  this.options = Object.assign(this.options, options || {})

  // Some defaults
  this.x = 0
  this.y = 0
  this.directionX = 0
  this.directionY = 0
  this._events = {}
  this.initiated = null
  this.startTime = null

  this._initEvent()
}

const _elementStyle = document.createElement('div').style
const _vendor = (function() {
  const vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT']
  let transform
  let i = 0
  const l = vendors.length

  for (; i < l; i++) {
    transform = vendors[i] + 'ransform'
    if (transform in _elementStyle)
      return vendors[i].substr(0, vendors[i].length - 1)
  }

  return false
})()

function _prefixStyle(style) {
  if (_vendor === false) return false
  if (_vendor === '') return style
  return _vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
const _transform = _prefixStyle('transform')
const rAF =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

CScroll.prototype = {
  utils: {
    hasTransform: _transform !== false,
    hasPerspective: _prefixStyle('perspective') in _elementStyle,
    hasTouch: 'ontouchstart' in window,
    hasPointer: !!(window.PointerEvent || window.MSPointerEvent), // IE10 is prefixed
    hasTransition: _prefixStyle('transition') in _elementStyle,
    transform: _transform,
    transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
    transitionDuration: _prefixStyle('transitionDuration'),
    transitionDelay: _prefixStyle('transitionDelay'),
    transformOrigin: _prefixStyle('transformOrigin'),
    touchAction: _prefixStyle('touchAction'),
    prefixPointerEvent: function(pointerEvent) {
      return window.MSPointerEvent
        ? 'MSPointer' +
            pointerEvent.charAt(7).toUpperCase() +
            pointerEvent.substr(8)
        : pointerEvent
    }
  },
  eventType: {
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
  },
  _addEvent: function(el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture)
  },
  _removeEvent: function(el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture)
  },
  _initEvent: function(remove) {
    const eventType = remove ? this._removeEvent : this._addEvent
    const target = this.wrapper
    const utils = this.utils
    if (!this.options.disableMouse) {
      eventType(this.wrapper, 'mousedown', this)
      eventType(target, 'mousemove', this)
      eventType(target, 'mousecancel', this)
      eventType(target, 'mouseup', this)
    }

    if (utils.hasPointer && !this.options.disablePointer) {
      eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this)
      eventType(target, utils.prefixPointerEvent('pointermove'), this)
      eventType(target, utils.prefixPointerEvent('pointercancel'), this)
      eventType(target, utils.prefixPointerEvent('pointerup'), this)
    }

    if (utils.hasTouch && !this.options.disableTouch) {
      eventType(this.wrapper, 'touchstart', this)
      eventType(target, 'touchmove', this)
      eventType(target, 'touchcancel', this)
      eventType(target, 'touchend', this)
    }
    this.rAFPooling()
    this.on('rAF', () => {
      this.transitionTail()
    })
  },
  rAFPooling: function() {
    this._execEvent('rAF')
    rAF(() => {
      this.rAFPooling()
    })
  },
  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart':
      case 'pointerdown':
      case 'MSPointerDown':
      case 'mousedown':
        this._start(e)
        break
      case 'touchmove':
      case 'pointermove':
      case 'MSPointerMove':
      case 'mousemove':
        this._move(e)
        break
      case 'touchend':
      case 'pointerup':
      case 'MSPointerUp':
      case 'mouseup':
      case 'touchcancel':
      case 'pointercancel':
      case 'MSPointerCancel':
      case 'mousecancel':
        this._end(e)
        break
      default:
        break
    }
  },
  _start: function(e) {
    // React to left mouse button only
    if (this.eventType[e.type] != 1) {
      // for button property
      // http://unixpapa.com/js/mouse.html
      var button
      if (!e.which) {
        /* IE case */
        button = e.button < 2 ? 0 : e.button == 4 ? 1 : 2
      } else {
        /* All others */
        button = e.button
      }
      if (button !== 0) {
        return
      }
    }

    if (this.options.preventDefault) {
      e.preventDefault()
    }
    if (this.initiated && this.eventType[e.type] !== this.initiated) {
      return
    }
    var point = e.touches ? e.touches[0] : e,
      pos

    this.initiated = this.eventType[e.type]
    this.moved = false
    this.distX = 0
    this.distY = 0
    this.startTime = this.getTime()
    if (this.isInTransition) {
      this.isInTransition = false
      this._execEvent('scrollEnd')
    }
    this.startX = point.pageX
    this.startY = point.pageY
    this.pointX = point.pageX
    this.pointY = point.pageY
    this._execEvent('beforeScrollStart')
  },

  _move: function(e) {
    if (this.options.preventDefault) {
      // increases performance on Android? TODO: check!
      e.preventDefault()
    }

    if (this.eventType[e.type] !== this.initiated) {
      return
    }

    var point = e.touches ? e.touches[0] : e,
      deltaX = point.pageX - this.pointX,
      deltaY = point.pageY - this.pointY,
      timestamp = this.getTime(),
      newX,
      newY,
      absDistX,
      absDistY

    this.pointX = point.pageX
    this.pointY = point.pageY

    this.distX += deltaX
    this.distY += deltaY
    absDistX = Math.abs(this.distX)
    absDistY = Math.abs(this.distY)

    // We need to move at least 6 pixels for the scrolling to initiate
    if (timestamp - this.endTime > 300 && (absDistX < 6 && absDistY < 6)) {
      return
    }

    if (!this.moved) {
      this._execEvent('scrollStart')
    }

    this.moved = true

    /* REPLACE START: _move */
    if (timestamp - this.startTime > 300) {
      this.startTime = timestamp
      this.startX = point.pageX
      this.startY = point.pageY
    }
    /* REPLACE END: _move */

    
    this._execEvent('scrolling', {
      distX: this.distX,
      distY: this.distY
    })
  },
  _end: function(e) {
    if (this.eventType[e.type] !== this.initiated) {
      return
    }

    if (this.options.preventDefault) {
      e.preventDefault()
    }

    var point = e.changedTouches ? e.changedTouches[0] : e,
      momentumX,
      momentumY,
      duration = this.getTime() - this.startTime,
      newX = Math.round(this.pointX),
      newY = Math.round(this.pointY),
      distanceX = newX - this.startX,
      distanceY = newY - this.startY,
      time = 0,
      easing = ''

    this.isInTransition = 0
    this.initiated = 0
    this.endTime = this.getTime()
    this.computedTransTail(distanceY, duration)
    
  },
  computedTransTail: function (distance, duration) {
    this.tailSpeed = distance / (duration / (1000 / 60))
    const deceleration = 0.1
    this.tailDuration = Math.abs(this.tailSpeed) / deceleration;
    if (this.tailDuration > 80) {
      this.tailDuration = 80
    }
    this.tailCurDuration = 1;
    if (this.tailDuration > 1) {
      this.isInTransition = 1
    } else {
      this._execEvent('scrollEnd')
    }
  },
  circular: function (k) {
    return Math.sqrt(1 - (--k * k));
  },
  transitionTail: function() {
    if (!this.isInTransition) {
      return
    }
    const tailCurSpeed = this.tailSpeed - this.circular(this.tailCurDuration / this.tailDuration) * this.tailSpeed

    this.distY += tailCurSpeed
    this._execEvent('scrolling', {
      distX: this.distX,
      distY: this.distY
    })

    this.tailCurDuration++
    if (this.tailCurDuration > this.tailDuration) {
      this.isInTransition = 0
      this._execEvent('scrollEnd')
    }
  },

  getTime: (function() {
    return (
      Date.now ||
      function getTime() {
        return new Date().getTime()
      }
    )
  })(),
  /**
   * 挂载回调
   */
  on: function(type, fn) {
    if (!this._events[type]) {
      this._events[type] = []
    }

    this._events[type].push(fn)
  },

  /**
   * 卸载回调
   */
  off: function(type, fn) {
    if (!this._events[type]) {
      return
    }

    var index = this._events[type].indexOf(fn)

    if (index > -1) {
      this._events[type].splice(index, 1)
    }
  },

  // 触发事件
  _execEvent: function(type) {
    if (!this._events[type]) {
      return
    }

    var i = 0,
      l = this._events[type].length

    if (!l) {
      return
    }
    for (; i < l; i++) {
      this._events[type][i].apply(this, [].slice.call(arguments, 1))
    }
  }
}

export default CScroll

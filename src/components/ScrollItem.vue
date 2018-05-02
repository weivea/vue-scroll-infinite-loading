<style>
.b {
  height: 100px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
<template>
  <div class="b" :style="{background: background}">
    {{data}}
  </div>
</template>
<script>
export default {
  data() {
    return {
      background: `#${Math.floor(100 + Math.random() * 899)}`,
      styleName: {
        transform: prefixStyle('transform')
      }
    }
  },
  props: ['way', 'data'],
  mounted() {
    this.$el.style[this.styleName.transform] = `translate(0px,0px)`
    this.$el.style[prefixStyle('transitionTimingFunction')] =
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    const heightUnit = this.$el.getBoundingClientRect().height
    this.$nextTick(() => {
      this.$parent.$emit('child', {
        way: this.way,
        h: heightUnit,
        child: this
      })
    })
  },
  methods: {
    placeChange(y) {
      
      this.$el.style[this.styleName.transform] = `translate(0px,${y}px)`
    },
    getComputedPosition() {
      var matrix = window.getComputedStyle(this.$el, null),
        x,
        y
      matrix = matrix[this.styleName.transform].split(')')[0].split(', ')
      x = +(matrix[12] || matrix[4])
      y = +(matrix[13] || matrix[5])
      return { x: x, y: y }
    }
  }
}

function prefixStyle(style) {
  var _elementStyle = document.createElement('div').style
  var _vendor = (function() {
    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
      transform,
      i = 0,
      l = vendors.length

    for (; i < l; i++) {
      transform = vendors[i] + 'ransform'
      if (transform in _elementStyle)
        return vendors[i].substr(0, vendors[i].length - 1)
    }

    return false
  })()
  if (_vendor === false) return false
  if (_vendor === '') return style
  return _vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
</script>

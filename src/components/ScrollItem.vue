<style>
.b {
  height: 100px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: -webkit-box;
  display: -webkit-flex; /* Safari */
  display: flex;
  padding: 5px 10px;
}
.words {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  flex: 1;
  padding-right: 10px;
  text-align: left;
}
.words .t{
  font-size: 14px;
  color: #fff;
  margin-bottom: 10px;
}
.words .source, .words .date{
  font-size: 12px;
  color: #eee
}
.pic{
  width: 140px;
}
.pic img{
  max-width: 100%;
  max-height: 100%;
}
</style>
<template>
  <div class="b" :style="{background: background}" @click="goLink">
    <div class="words">
      <div class="t">
        {{info.title}}
      </div>
      <div class="source">
        {{info.source}}
      </div>
      <div class="date">
        {{info.ptime}}
      </div>
    </div>
    <div v-if="info.picInfo && info.picInfo.length" class="pic">
      <img :src="imgUrl">
    </div>
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
  computed: {
    info() {
      return this.data.info
    },
    imgUrl() {
      return this.info.picInfo[0].url.replace(/http:/, location.protocol)
    }
  },
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
    },
    goLink() {
      this.$root.$children[0].$refs.ifr.fadeIn(this.info.link)
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

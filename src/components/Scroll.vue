<style scoped>
.scroll {
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>
<template>
  <div class="scroll" :style="{height: height}">
    <scroll-item v-for="(item, ind) in itemList" :key="item.data" :way="item.way" :data="item.data"></scroll-item>
  </div>
</template>
<script>
import Scroll from './cscroll'
import ScrollItem from './ScrollItem'

let scroller
const elList = []
window.elList = elList
const tmpY = null
export default {
  data() {
    return {
      itemList: [],
      warpHeight: null,
      indNum: 1
    }
  },
  created() {
    this.$on('child', item => {
      this.putChildren(item)
    })
  },
  mounted() {
    // const Scroll = getXScroll()
    this.warpHeight = this.$el.getBoundingClientRect().height
    scroller = new Scroll(this.$el, {
      preventDefault: true
    })
    scroller.on('scrollStart', () => {})
    scroller.on('scrolling', ({ distX, distY }) => {
      this.scrolling(distY)
    })
    scroller.on('scrollEnd', () => {
      this.scrollEnd()
    })
    this.addChild()
  },
  props: ['height'],
  methods: {
    scrolling(distY) {
      elList.forEach(item => {
        item.tmpY = item.y + distY
        item.child.placeChange(item.tmpY)
      })
      this.judgeChildren()
    },
    scrollEnd() {
      this.refreshItemY()
    },
    judgeChildren() {
      let i = 0
      let len = elList.length

      for (; i < len; i++) {
        const item = elList[i]
        if (item.tmpY + item.h > -50) {
          break
        }
      }
      if (i) {
        elList.splice(0, i)
        this.itemList.splice(0, i)
      }

      len = elList.length - 1
      i = len
      for (; i >= 0; i--) {
        const item = elList[i]
        if (item.tmpY < this.warpHeight + 50) {
          i = i + 1
          break
        }
      }
      if (i < len) {
        elList.splice(i)
        this.itemList.splice(i)
      }

      if (!elList.length) {
        this.addChild(1)
        return
      }
      const first = elList[0]
      if (first.tmpY > -50) {
        this.addChild(-1)
      }
      const last = elList[elList.length - 1]
      if (last.tmpY + last.h < this.warpHeight + 50) {
        this.addChild(1)
      }
    },
    addChild(way = 1) {
      // this.refreshItemY()
      if (way > 0) {
        this.itemList.push({ way, data: this.indNum })
      } else {
        this.itemList.unshift({ way, data: this.indNum })
      }
      this.indNum++
    },
    refreshItemY() {
      elList.forEach(item => {
        if (item.tmpY) {
          item.y = item.tmpY
        }
      })
    },
    putChildren(item) {
      let y = 0
      let tmpY = 0
      let prev
      let next
      if (elList.length) {
        if (item.way > 0) {
          prev = elList[elList.length - 1]
          y = prev.y + prev.h
          tmpY = prev.tmpY + prev.h
        } else {
          next = elList[0]
          y = next.y - item.h
          tmpY = next.tmpY - item.h
        }
      }
      item.y = y
      item.tmpY = tmpY

      if (item.way > 0) {
        elList.push(item)
      } else {
        elList.unshift(item)
      }

      item.child.placeChange(tmpY)

      if (item.way > 0) {
        if (y > this.warpHeight) {
          return
        }
      } else {
        if (next.y < 0) {
          return
        }
      }
      this.addChild(item.way)
    }
  },
  components: {
    ScrollItem
  }
}
</script>

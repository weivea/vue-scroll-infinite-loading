<template>
  <div id="app">
    <scroll ref="scroll"></scroll>
    <iframe-view ref="ifr" id="m-iframe"></iframe-view>
  </div>
</template>

<script>
import Scroll from './components/Scroll'
import IframeView from './components/IframeView'
import jsonp from './components/jsonp'

let cacheList = []
let readedList = []

export default {
  name: 'app',
  data() {
    return {
      reqInd: 10,
      reqNum: 40,
      lastWay: 1,
      loadingFlag: false
    }
  },
  mounted() {
    this.getNews()
    window.addEventListener('hashchange', (e) => {
      if (!/#detail$/.test(e.newURL)) {
        this.$refs.ifr.fadeOut()
      }
    }, false);
  },
  methods: {
    getNews() {
      if (this.loadingFlag) {
        return
      }
      this.loadingFlag = true
      const url = `https://3g.163.com/touch/jsonp/sy/recommend/${this.reqInd}-${
        this.reqNum
      }.html?hasad=1&miss=57&refresh=A`
      this.reqInd += this.reqNum
      if (this.reqInd > 300) {
        this.reqInd = 10
      }
      jsonp(url, { callback: 'jsonpGetnews' }, data => {
        console.log(data)
        cacheList = cacheList.concat(data.list)
        if (this.lastWay) {
          this.$refs.scroll.addChild(this.lastWay)
        }
        this.loadingFlag = false
      })
    },
    addChild(way, cb) {
      if (cacheList.length) {
        cb(cacheList.shift())
        this.lastWay = null
      } else {
        this.lastWay = way
      }
      if (cacheList.length < 30) {
        this.getNews()
      }
    }
  },
  components: {
    Scroll,
    IframeView
  }
}
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
  height: 100%;
  overflow: hidden;
}
#app {
  height: 100%;
  overflow: hidden;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
*,
:after,
:before {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  outline: none;
}
</style>

<style scoped>
.iframe {
  position: absolute;
  height: 100%;
  width: 100%;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: #fff;
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
  overflow-y: scroll;
  z-index: 20;
}

iframe {
  width: 1px;
  min-width: 100%;
  *width: 100%;
}

.fade-enter-active {
  -webkit-transition: opacity 300ms;
  transition: opacity 300ms;
}

.fade-leave-active {
  -webkit-transition: opacity 300ms;
  transition: opacity 300ms;
}

.fade-enter,
.fade-leave-to {
  opacity: 0.01;
}
</style>
<template>
<div>
<transition name="fade">
  <div v-show="showing" class="iframe" ref="box">
    
    <iframe width="100%" height="100%" :scrolling="scrolling" ref="ifr">

    </iframe>
  </div>
</transition>
</div>

</template>
<script>
export default {
  name: 'iframe',
  data() {
    return {
      scrolling: 'auto',
      width: '100%',
      height: '100%',
      showing: false,
      loaded: false
    }
  },
  // watch: {
  //   showing(newValue, oldValue) {
  //     if (newValue === true && !this.src) {
  //       this.src = `${location.protocol}${this.$root.$data.icUrl}#${this.hash}`;
  //       this.$refs.ifr.src = this.src;
  //       setTimeout(() => {
  //         this.$root.$data.iframeReady = true;
  //       }, 1000);
  //     }
  //     if (newValue) {
  //       this.$refs.ifr.contentWindow.forbidPollingFlag = false;
  //     } else {
  //       this.$refs.ifr.contentWindow.forbidPollingFlag = true;
  //     }
  //   },
  // },
  mounted() {
    this.scrolling = /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(navigator.userAgent)
      ? 'no'
      : 'auto'
    this.width = document.documentElement.clientWidth
    this.height = document.documentElement.clientHeight
    const ifr = this.$refs.ifr
    const self = this
    ifr.onload = function() {
      console.log('onload')
      if (self.loaded) {
        self.showing = false
        // location.hash = ''
        return;
      }
      self.loaded = true
    }
  },
  methods: {
    fadeIn(src) {
      this.loaded = false
      this.$refs.ifr.src = location.protocol + '//' + src.split('//')[1]
      this.showing = true
      location.hash = 'detail'
    },
    fadeOut() {
      this.showing = false
      this.$refs.ifr.src = ''
    }
  }
}
</script>

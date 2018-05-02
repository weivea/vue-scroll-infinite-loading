<template>
  <div id="app">
      <scroll></scroll>
  </div>
</template>

<script>
import Scroll from './components/Scroll';

export default {
  name: 'app',
  components: {
    Scroll
  }
}
</script>

<style>
html, body{
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
</style>

<script setup>
// import BackgroundCanvas from './components/BackgroundCanvas.vue';
</script>

<template>
  <div id="app">
    <!-- <BackgroundCanvas /> -->
    <router-view />
  </div>
</template>

<style scoped lang="less">
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

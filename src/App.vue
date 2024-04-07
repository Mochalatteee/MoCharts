
<template>

  <div>
    <router-view></router-view> <!-- 路由视图占位符 -->
  </div>

</template>

<script setup>

</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body, html {
  padding: 0;
  margin: 0;
}

#app {
  max-width: none !important; /* Override the max-width property */
}

</style>

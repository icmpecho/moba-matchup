<template>
  <div id="app">
    <div class="spin-container" v-if="isLoading">
      <div class="spinner"></div>
    </div>
    <Navbar :current="$route.name"></Navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
export default {
  data: function () {
    return {
      isLoading: false
    }
  },
  components: {
    Navbar
  }
}
</script>

<style>
.spin-container {
  position: fixed;
  z-index: 998;
  height: 100%;
  width: 100%;
  overflow: show;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0,0,0,0.5)
}

.spinner {
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 2s linear infinite;
    position: fixed;
    margin: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>


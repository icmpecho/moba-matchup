<template>
  <div id="app">
    <Navbar></Navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
export default {
  data: function () {
    return {
      greeting: 'Hello'
    }
  },
  components: {
    Navbar
  }
}
</script>


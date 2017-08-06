<template>
  <div id="app">
    <Navbar :current="$route.name"></Navbar>
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


<template>
<Navbar current="players"></Navbar>
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


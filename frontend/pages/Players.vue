<template>
<div class="container">
  <h1>Players</h1>
  <PlayerList :players="players"></PlayerList>
</div>
</template>

<script>
import PlayerList from '../components/PlayerList.vue'
import {mapState} from 'vuex'

export default {
  data: function () {
    return {}
  },
  computed: {
    players: function () {
      return this.$store.state.player.players
    }
  },
  components: {
    PlayerList
  }
}
</script>

<template>
<div class="container">
  <h1>Games</h1>
  <GameList :games="games"></GameList>
</div>
</template>

<script>
import GameList from '../components/GameList.vue'

export default {
  data: function () {
    return {
    }
  },
  computed: {
    games: function () {
      return this.$store.state.game.games
    }
  },
  components: {
    GameList
  },
  created: function () {
    this.$store.dispatch('game/refreshGames')
  }
}
</script>

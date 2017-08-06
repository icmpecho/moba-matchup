<template>
<div class="container">
  <h1>Players</h1>
  <PlayerList :players="players"></PlayerList>
</div>
</template>

<script>
import PlayerList from '../components/PlayerList.vue'

export default {
  data: function () {
    return {
      players: [
        {_id: 'aaa', name: 'Player-1', rating: 1},
        {_id: 'bbb', name: 'Player-2', rating: 2},
        {_id: 'ccc', name: 'Player-3', rating: 2},
        {_id: 'ddd', name: 'Player-4', rating: 2},
      ]
    }
  },
  components: {
    PlayerList
  }
}
</script>

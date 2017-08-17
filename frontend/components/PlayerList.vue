<template>
<table class="table table-hover">
  <thead>
    <th>Name</th>
    <th>Rating</th>
  </thead>
  <tbody>
    <tr v-for="player in players" :key="player._id"
      :class="{success: player.selected}"
      @click="toggleSelection(player._id)">
      <td>
        <PlayerDetailButton :player="player"></PlayerDetailButton>
        {{player.name}}
      </td>
      <td>{{player.rating}}</td>
    </tr>
  </tbody>
</table>
</template>

<script>
import PlayerDetailButton from "./PlayerDetailButton.vue"
export default {
  props: ['players'],
  data: function () {
    return {}
  },
  methods: {
    toggleSelection(playerId, event) {
      this.$store.commit('player/toggleSelection', playerId)
    }
  },
  components: {
    PlayerDetailButton
  }
}
</script>

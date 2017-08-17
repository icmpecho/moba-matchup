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
        <span class="detail-link">
          <router-link
            :to="{ name: 'player-detail', params: { playerId: player._id } }"
            @click.native.stop>
              <span class="glyphicon glyphicon-search"></span>
          </router-link>
        </span>
        {{player.name}}
      </td>
      <td>{{player.rating}}</td>
    </tr>
  </tbody>
</table>
</template>

<script>
export default {
  props: ['players'],
  data: function () {
    return {}
  },
  methods: {
    toggleSelection(playerId, event) {
      this.$store.commit('player/toggleSelection', playerId)
    }
  }
}
</script>

<style>
.detail-link {
  margin-right: 10px
}
</style>

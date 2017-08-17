<<template>
  <span class="player-detail-link">
    <router-link
    :to="{ name: 'player-detail', params: { playerId: player._id } }"
    @click.native.stop>
      <span class="glyphicon glyphicon-search"></span>
    </router-link>
  </span>
</template>

<<script>
export default {
  props: ['player']
}
</script>

<style>
.player-detail-link {
  margin-right: 10px
}
</style>
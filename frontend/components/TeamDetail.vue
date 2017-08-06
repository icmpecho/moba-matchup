<<template>
<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">
      Team {{teamId + 1}} <span class="badge pull-right">{{team.rating}}</span>
    </h3>
  </div>
  <ul class="list-group">
    <li class="list-group-item" v-for="player in team.players" :key="player._id">
      {{player.name}} <span class="badge">{{player.rating}}</span>
    </li>
  </ul>
</div>
</template>

<<script>
export default {
  props: ['game', 'teamId'],
  computed: {
    team() {
      return this.game.teams[this.teamId]
    }
  }
}
</script>

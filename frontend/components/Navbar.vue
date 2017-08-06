<<template>
  <nav class="navbar navbar-default">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-menu" aria-expanded="false">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand">MOBA Matchup</a>
      </div>
      <div class="collapse navbar-collapse" id="nav-menu">
        <ul class="nav navbar-nav">
          <li :class="gamesBtnClasses"><router-link to="/games">Games</router-link></li>
          <li :class="playersBtnClasses"><router-link to="/players">Players</router-link></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<<script>
export default {
  props: ['current'],
  data: function () {
    return {}
  },
  computed: {
    gamesBtnClasses: function () {
      return {
        active: this.current == 'games'
      }
    },
    playersBtnClasses: function () {
      return {
        active: this.current == 'players'
      }
    },
  }
}
</script>

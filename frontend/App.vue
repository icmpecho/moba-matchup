<<template>
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-menu" aria-expanded="false">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">MOBA Matchup</a>
      </div>
      <div class="collapse navbar-collapse" id="nav-menu">
        <ul class="nav navbar-nav">
          <li class="active"><a href="#">Matches</a></li>
          <li><a href="#">Players</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<<script>
export default {
  data: function () {
    return {
      greeting: 'Hello'
    }
  }
}
</script>


<template>
<div>
 <button type="button" class="btn btn-info" data-toggle="modal" data-target="#createPlayerModal">Create Player
 </button>
<!-- Modal -->
  <div class="modal fade" id="createPlayerModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Create Player</h4>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="inputPlayerId">Player ID</label>
              <input type="text" class="form-control" id="inputPlayerId" placeholder="Rov ID">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-default">Submit</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>

      
    </div>
  </div>
</div>
</template>


<<script>
export default {
  data: function () {
    return {}
  },

  methods: {
    createPlayer: function () {
      this.$store.dispatch('player/createPlayer')
    }
  }
}
</script>
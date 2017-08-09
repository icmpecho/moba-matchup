<template>
<!-- Modal -->
<div class="modal fade" role="dialog">
  <div class="modal-dialog">
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" @click="playerId=''">&times;</button>
        <h4 class="modal-title">Create Player</h4>
      </div>
      <div class="modal-body">
          <div class="form-group">
            <label>Player ID</label>
            <input class="form-control" placeholder="in-game name" v-model="playerId">
          </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-default" data-dismiss="modal" @click="createPlayer">Submit</button>
        <button class="btn btn-default" data-dismiss="modal" @click="playerId=''">Close</button>
      </div>
    </div>
  </div>
</div>
</template>


<script>
export default {
  data: function () {
    return { playerId: ""}
  },

  methods: {
    createPlayer: function () {
      if(this.playerId.trim() !== ""){
        this.$store.dispatch('player/createPlayer',this.playerId.trim())
      }
    }
  }
}
</script>
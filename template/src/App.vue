
<script>
  export default {
    mpType: 'app',
    onLaunch: function(options) {
      // Do something initial when launch.
      console.log('App onLaunch')
    },
    onShow: function(options) {
      // Do something when show.
      console.log('App onShow')
    },
    onHide: function() {
      // Do something when hide.
      console.log('App onHide')
    },
    onError: function(msg) {
      console.log('App onError')
      console.log(msg)
    },
    globalData() {
      return {
        a: 'I am global data'
      }
    }
  }
</script>

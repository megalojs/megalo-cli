<template>
  <div class="app">
      <img class="img" :src="logo" @touchstart="changeStat">
      <hello-world :color="color"></hello-world>
      <h1 class="txt" v-show="t%2==1">click logo::{{t}}</h1>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
export default {
  mpType: 'page',
  components: {
      HelloWorld
  },
  data() {
    return {
      logo: 'https://user-images.githubusercontent.com/20720117/48262986-80e02780-e45f-11e8-8426-2872916adad9.png',
      t: 1,
      color: '#007d37'
    }
  },
  beforeCreate() {
    console.log('Page Vue beforeCreate')
  },
  created() {
    console.log('Page Vue created')
    var appInstance = getApp()
    console.log(appInstance.globalData) // I am global data
  },
  beforeMount() {
    console.log('Page Vue beforeMount')
  },
  mounted() {
    console.log('Page Vue mounted')
  },
  onLoad: function(options) {
    // Do some initialize when page load.
    console.log('Page onLoad')
  },
  onReady: function() {
    // Do something when page ready.
    console.log('Page onReady')
  },
  onShow: function() {
    // Do something when page show.
    console.log('Page onShow')
  },
  onHide: function() {
    // Do something when page hide.
    console.log('Page onHide')
  },
  onUnload: function() {
    // Do something when page close.
    console.log('Page onUnload')
  },
  /**
   * for other event handlers, please check https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html
   */
  methods:{
    changeStat: function(){
      this.t++
      this.color = '#'+Math.floor(Math.random()*0xffffff).toString(16)
    }
  }
}
</script>
<% if (cssPreset === 'less') { %>
<style lang="less" scoped>
<% } else if (cssPreset === 'stylus') {%>
<style lang="stylus" scoped>
<% } else {%>
<style lang="scss" scoped> 
<% } %>.app{
  padding-top: 100px;
  .img {
    display: block;
    height: 120px;
    width: 120px;
    margin: 20px auto;
  }
  .txt {
      color: #567567;
      font-size: 13px;
      text-align: center;
  }
}
</style>

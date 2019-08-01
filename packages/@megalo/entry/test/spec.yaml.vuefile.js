
const txt = `
<config lang="yaml">
---
pages:
    - pages/index
subpackages:
    -
     root: packageA
     pages:
     	- pages/test
    -
     root: pages/packageB
     pages:
     	- pages/test
window:
    backgroundTextStyle: light
    navigationBarBackgroundColor: '#fff'
    navigationBarTitleText: demo
    navigationBarTextStyle: black
</config>

<script>
export default {
  onLaunch (options) {
    // Do something initial when launch.
    console.log('App onLaunch')
  },
  onShow (options) {
    // Do something when show.
    console.log('App onShow')
  },
  onHide () {
    // Do something when hide.
    console.log('App onHide')
  },
  onError (msg) {
    console.log('App onError')
    console.log(msg)
  },
  globalData () {
    return {
      a: 'I am global data'
    }
  }
}
</script>

<style lang="scss">
@import "./native/vant/common/index.wxss";
page {
  font: normal 14px/1.5 $font-family, "Heiti SC", "Arial", "Lucida Grande",
    Verdana, STXhei, "Microsoft YaHei", "hei";
  color: #000;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
page > .page {
  flex: 1 1 auto;
}

cheers-navigation + div {
  padding-top: 70px;
}
image {
  vertical-align: middle;
}
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}
.ellipsis
{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ellipsis-2
{
  display: -webkit-box;
  overflow: hidden;
  white-space: normal !important;
  text-overflow: ellipsis;
  word-wrap: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bold {
  font-weight: bold;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-column-full {
  flex: 1 1 auto;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 有赞组件样式覆盖
.van-picker__cancel,.van-picker__confirm {
  color: $color-primary!important;
}
.van-popup {
  background-color: transparent!important;
}
.van-nav-bar {
  background-image: linear-gradient(134deg, #1A9C71 0%, #4CA9B5 100%);
}
.van-nav-bar__text {
  color: #fff!important;
}
.van-icon {
  vertical-align: middle;
}
.van-nav-bar__title {
  font-size: 18px!important;
}

</style>
`;

const { extractConfigFromSFC } = require('../lib/util')

console.log(extractConfigFromSFC(txt))

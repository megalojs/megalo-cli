import App from './App'
import Vue from 'vue'
import VHtmlPlugin from '@megalo/vhtml-plugin'<% if (features.includes('vuex')) { %>
import Vuex from 'vuex'<% } %>

Vue.use(VHtmlPlugin)<% if (features.includes('vuex')) { %>
Vue.use(Vuex)

const store = require('./store').default
Vue.prototype.$store = store
<% } %>
const app = new Vue(App)

app.$mount()

export default {
  config: {
    // pages 的首个页面会被编译成首页
    pages: [
      'pages/hello',
      'pages/my/my'<% if (features.includes('vuex')) { %>,
      'pages/vuex/vuex'<% } %>
    ],
    tabBar: {
      color: '#333',
      selectedColor: '#007d37',
      list: [
        {
          pagePath: 'pages/hello',
          text: 'home',
          iconPath: 'native/tabbar/home.png',
          selectedIconPath: 'native/tabbar/home_on.png'
        },
        {
          pagePath: 'pages/my/my',
          text: 'my',
          iconPath: 'native/tabbar/mine.png',
          selectedIconPath: 'native/tabbar/mine_on.png'
        }<% if (features.includes('vuex')) { %>,
        {
          pagePath: 'pages/vuex/vuex',
          text: 'vuex',
          iconPath: 'native/tabbar/vue.png',
          selectedIconPath: 'native/tabbar/vue_on.png'
        }<% } %>
      ]
    },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'megalo project',
      navigationBarTextStyle: 'black'
    }
  }
}

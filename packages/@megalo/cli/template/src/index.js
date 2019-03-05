import App from '.'
import Vue from 'vue'
import VHtmlPlugin from '@megalo/vhtml-plugin'

Vue.use(VHtmlPlugin)

const app = new Vue(App)

app.$mount()

export default {
  config: {
    // pages 的首个页面会被编译成首页
    pages: [
      'pages/hello',
      'pages/my/my'
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
        }
      ]
    },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'haha',
      navigationBarTextStyle: 'black'
    }
  }
}

import Vue from 'vue'
import router from './router.js'
import App from './app.vue'

new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app');
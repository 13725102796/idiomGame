import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from './store'
import io from 'io'
import 'lib-flexible/flexible'
import vant from 'vant'
// 注册组件
Vue.use(vant);


Vue.config.productionTip = false

// 建立socket链接
const socket = io("ws://localhost:3000");
// console.log(socket)
Vue.prototype.$socket = socket

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

import Vue from 'vue'
import Router from 'vue-router'
import Home from './home'

Vue.use(Router)
// router import 
// import Home from './home'
// router concat
const routes = [].concat(Home)
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
})
export default [{
  path: '/',
  name: 'home',
  component: ()=> import ('@/views/Home.vue')
},{
  path: '/home',
  name: 'home',
  component: ()=> import ('@/views/Home.vue')
},{
  path: '/about',
  name: 'about',
  component: () => import('@/views/About.vue')
},{
  path: '/room',
  name: 'room',
  component: () => import('@/views/room.vue')
},{
  path: '/game',
  name: 'game',
  component: () => import('@/views/game.vue')
}]
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/placement', component: () => import('../views/PlacementView.vue') },
    { path: '/game', component: () => import('../views/GameView.vue') },
    { path: '/gameover', component: () => import('../views/GameOverView.vue') },
  ],
})

export default router

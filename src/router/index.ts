import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Events from '../views/Events.vue';
import Kliikki from '@/views/Kliikki.vue';
import Stats from '../views/Stats.vue';
import EventPage from '../views/EventPage.vue';
import GameView from '../views/GameView.vue';
import StatsView from '../views/StatsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/events',
      name: 'Events',
      component: Events,
    },
    {
      path: '/kliikki',
      name: 'Kliikki',
      component: Kliikki,
    },
    {
      path: '/stats',
      name: 'Tilastot',
      component: Stats,
    },
    {
      path: '/events/:gameId',
      name: 'EventPage',
      component: EventPage,
    },
    {
      path: '/gameview',
      name: 'GameView',
      component: GameView,
    },
    {
      path: '/statsview',
      name: 'StatsView',
      component: StatsView,
    },
  ],
})

export default router

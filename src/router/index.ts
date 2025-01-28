import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import GameView from '../views/GameView.vue'
import StatsView from '../views/StatsView.vue'
import Kliikki from '../views/Kliikki.vue'

const router = createRouter({ history: createWebHashHistory('/Laukaisukartta/'),
      routes: [
        {
          path: '/',
          redirect: '/statsview',
        },
      {
        path: '/kliikki', 
        name: 'kliikki', 
        component: Kliikki, 
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
  }
) 

export default router


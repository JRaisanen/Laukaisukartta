import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'
import StatsView from '../views/StatsView.vue'
import StatsGameView from '../views/StatsGameView.vue'
import Kliikki from '../views/Kliikki.vue'
import Teams from '../views/Teams.vue';
import Login from '../views/Login.vue';
import GamesView from '../views/GamesView.vue';
import { useTeamStore } from '../stores/teamStore'

const router = createRouter({ history: createWebHashHistory('/Laukaisukartta/'),
//const router = createRouter({ history: createWebHistory('/Laukaisukartta/'),
      routes: [
        {
          path: '/',
          redirect: '/teams',
        },
        {
          path: '/login',
          name: 'Login',
          component: Login
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
        { 
          path: '/statsgameview', 
          name: 'StatsGameView', 
          component: StatsGameView, 
        },
        {
          path: '/teams', 
          name: 'Teams', 
          component: Teams
        },
        {
          path: '/gamesview',
          name: 'GamesView',
          component: GamesView
        },
      ],
  }
) 

router.beforeEach((to, from, next) => {
  const teamStore = useTeamStore()
  const savedTeamId = localStorage.getItem('selectedTeamId')
  const savedSeasonId = localStorage.getItem('selectedSeasonId')
  
  teamStore.fetchTeams();
  if (savedTeamId){
    teamStore.fetchTeamSeasons(parseInt(savedTeamId)); 
  }
  console.log('Ladattu ' + teamStore.teams.length + ' joukkuetta ja iidee' + savedTeamId);

  if (teamStore.teams.length > 1 && !savedTeamId && !savedSeasonId && to.path !== '/teams') {
    next('/teams')
  } else {
    next()
  }
})
 
export default router


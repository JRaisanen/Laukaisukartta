import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import GameView from '../views/GameView.vue'
import StatsView from '../views/StatsView.vue'
import Kliikki from '../views/Kliikki.vue'
import Settings from '../views/Settings.vue';
import Teams from '../views/Teams.vue';
import Players from '../views/Players.vue';
import Login from '../views/Login.vue';
import { useTeamStore } from '../stores/teamStore'

const router = createRouter({ history: createWebHashHistory('/Laukaisukartta/'),
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
          path: '/teams', 
          name: 'Teams', 
          component: Teams
        },
      ],
  }
) 

router.beforeEach((to, from, next) => {
  const teamStore = useTeamStore()
  const savedTeamId = localStorage.getItem('selectedTeamId')
  const savedSeasonId = localStorage.getItem('selectedSeasonId')
  console.log('Ladataan joukkueet ja kaudet' + savedTeamId + ' ' + savedSeasonId);
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


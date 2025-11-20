import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'
import StatsView from '../views/StatsView.vue'
import StatsGameView from '../views/StatsGameView.vue'
import Kliikki from '../views/Kliikki.vue'
import Teams from '../views/Teams.vue';
import Login from '../views/Login.vue';
import Lineups from '../views/LineupsView.vue';
import GamesView from '../views/GamesView.vue';
import MatchesView from '../views/MatchesView.vue';
import GameCenter from '../views/GameCenter.vue';
import { useTeamStore } from '../stores/teamStore'

const router = createRouter({ history: createWebHashHistory('/Laukaisukartta/'),
//const router = createRouter({ history: createWebHistory('/Laukaisukartta/'),
      routes: [
        {
          path: '/',
          redirect: '/matches',
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
          path: '/kliikki/:gameId?',
          name: 'Kliikki',
          component: () => import('../views/Kliikki.vue'),
          props: true
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
        {
          path: '/lineups',
          name: 'Lineups',
          component: Lineups
        },
        {
          path: '/matches',
          name: 'Matches',
          component: MatchesView
        },
        {
          path: '/gamecenter/:gameId',
          name: 'GameCenter',
          component: GameCenter,
          props: true
        }
      ],
  }
) 

router.beforeEach((to, from, next) => {
  const teamStore = useTeamStore()
  const savedTeamId = localStorage.getItem('selectedTeamId') || '12'
  const savedSeasonId = localStorage.getItem('selectedTeamSeasonId') || '19'

  localStorage.setItem('selectedTeamId', savedTeamId); // Tallenna valittu joukkue
  localStorage.setItem('selectedTeamSeasonId', savedSeasonId); // Tallenna valittu kausi

  console.log('Before each - tallennettu joukkueid ' + savedTeamId + ' ja seasonid ' + savedSeasonId);
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


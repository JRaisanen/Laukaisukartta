<template>
  <div class="container">
    <v-divider :thickness="10"></v-divider>

    <v-sheet class="responsive-sheet" style="text-align: left;">
      <v-slide-group show-arrows>
        <v-slide-group-item 
          v-for="game in games"
          :key="game.gameId"
          v-slot="{ isSelected, toggle }"
        >
          <v-btn 
            :color="isSelected ? 'primary' : undefined"
            :class="{ 'selected-btn': selectedGameId === game.gameId,
                      'ma-2': selectedGameId !== game.gameId }"
            rounded
            @click="selectGame(game)"
          >
            {{ game.shortname }}
          </v-btn>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <v-divider :thickness="10"></v-divider>

   <div v-if="teamNames" class="team-names-display">
        <v-card-title class="text-h7">{{ teamNames }}</v-card-title>
    </div>

    <v-divider :thickness="10"></v-divider>

    <div v-if="loading" style="text-align:center; margin: 32px;">
      <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
      <div>Haetaan tilastoja...</div>
    </div>

    <div v-else class="stats-table">
      <h3>Pelaajatilastot</h3>
      <div style="overflow-x: auto; width: 80%; text-align: left;">
      <v-data-table
        :items="playerStatsWithSum"
        :headers="playerHeaders"
        :hide-default-header="false"
        :items-per-page="-1"
        :hide-default-footer="true"
        density="compact"
        class="responsive-table"
      >
        <template #item.xg="{ item }">
          {{ (item.xg ?? 0).toFixed(2) }}
        </template>
        <template #item.shot_pct="{ item }">
          {{ item.shot_pct ? item.shot_pct.toFixed(2) : '0.00' }}
        </template>
        <template #item.efficiency="{ item }">
          {{ item.efficiency ? item.efficiency.toFixed(2) : '-' }}
        </template>        

      <template #body.append>
          <tr>
            <td>{{ totalStats.playerName }}</td>
            <td>{{ totalStats.goal }}</td>
            <td>{{ totalStats.assist }}</td>
            <td>{{ totalStats.point }}</td>
            <td>{{ totalStats.shot_goal }}</td>
            <td>{{ totalStats.shot_saved }}</td>
            <td>{{ totalStats.shot_blocked }}</td>
            <td>{{ totalStats.shot_missed }}</td>
            <td>{{ totalStats.total_shots }}</td>
            <td>{{ totalStats.shot_pct ? totalStats.shot_pct.toFixed(2) : '0.00' }}</td>
            <td>{{ totalStats.xg ? totalStats.xg.toFixed(2) : '0.00' }}</td>
            <td>{{ totalStats.efficiency ? totalStats.efficiency.toFixed(2) : '0.00' }}</td>
            <td>{{ totalStats.blocked_shot }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td>{{ totalStats.penalty_2m }}</td>
            <td>{{ totalStats.penalty_10m }}</td>
            <td>{{ totalStats.penalty_20m }}</td>
            <td>{{ totalStats.powerplaygoal }}</td>
            <td>{{ totalStats.shorthandedgoal }}</td>
            <td>{{ totalStats.penaltyshotgoal }}</td>
            <td>{{ totalStats.penaltyshotattempt }}</td>  
          </tr>
        </template>
      </v-data-table>
    </div>
      <h3>Maalivahtitilastot</h3>
      <v-data-table
        :items="goalieStatsWithSum"
        :headers="goalieHeaders"
        :hide-default-footer="true"
        density="compact"
        style="min-width: 0; max-width: 1000px;"
        class="responsive-table goalie-table"
      >
        <template #item.xg_against="{ item }">
            {{ (item.xg_against ?? 0).toFixed(2) }}
        </template>
        <template #item.save_pct="{ item }">
          {{ item.save_pct ? item.save_pct.toFixed(2) : '-' }}
        </template>        
        <template #item.goalperxg="{ item }">
          {{ item.goalperxg ? item.goalperxg.toFixed(2) : '-' }}
        </template>

        <template #body.append>
        <tr>
          <td>{{ totalGoalieStats.playerName }}</td>
          <td>{{ totalGoalieStats.saves }}</td>
          <td>{{ totalGoalieStats.goals_against }}</td>
          <td>{{ totalGoalieStats.save_pct ? totalGoalieStats.save_pct.toFixed(2) : '0.00' }}</td>
          <td>{{ totalGoalieStats.xg_against ? totalGoalieStats.xg_against.toFixed(2) : '0.00' }}</td>
          <td>{{ totalGoalieStats.goalperxg ? totalGoalieStats.goalperxg.toFixed(2) : '0.00' }}</td>
          <td>{{ totalGoalieStats.assist }}</td>
          <td>{{ totalGoalieStats.penalty_2m }}</td>
          <td>{{ totalGoalieStats.penalty_10m }}</td>
          <td>{{ totalGoalieStats.penalty_20m }}</td>
        </tr>
      </template>
      </v-data-table>
    </div>
    <v-btn
      v-if="authStore.isAuthenticated"
      color="primary"
      @click="editGame"
      prepend-icon="mdi-pencil"
    >
      Editoi ottelua
    </v-btn>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useTeamStore } from '../stores/teamStore';
import { useAuthStore } from '../stores/authStore';
import config from '../../config';
import { computed } from 'vue';

export default {
  setup() {
    const teamStore = useTeamStore();
    const authStore = useAuthStore();

    const selectedGameId = ref(null);
    const games = ref([]);
    const gameOptions = ref([]);
    const gamePlayers = ref([]);
    const gameGoalies = ref([]);
    const loading = ref(false);
    const seasonId = teamStore.selectedTeamSeason?.seasonId || 1;

    const playerHeaders = [
      { title: 'Nimi', value: 'playerName', sortable: true },
      { title: 'Maalit', value: 'goal', sortable: true },
      { title: 'Syötöt', value: 'assist', sortable: true },
      { title: 'Pisteet', value: 'point', sortable: true },
      { title: 'Lauk maalit', value: 'shot_goal', sortable: true },
      { title: 'Lauk torj', value: 'shot_saved', sortable: true },
      { title: 'Lauk blok', value: 'shot_blocked', sortable: true },
      { title: 'Lauk ohi', value: 'shot_missed', sortable: true },
      { title: 'Lauk kaikki', value: 'total_shots', sortable: true },
      { title: 'Lauk %', value: 'shot_pct', sortable: true },
      { title: 'xG', value: 'xg', sortable: true },
      { title: 'Maalit/xG', value: 'efficiency', sortable: true },
      { title: 'Blokit', value: 'blocked_shot', sortable: true },
      { title: '+', value: 'plus_goal', sortable: true },
      { title: '-', value: 'minus_goal', sortable: true },
      { title: '+/-', value: 'plusminus', sortable: true },
      { title: '2min', value: 'penalty_2m', sortable: true },
      { title: '10min', value: 'penalty_10m', sortable: true },
      { title: '20min', value: 'penalty_20m', sortable: true },
      { title: 'YV maalit', value: 'powerplaygoal', sortable: true },
      { title: 'AV maalit', value: 'shorthandedgoal', sortable: true },
      { title: 'RL maalit', value: 'penaltyshotgoal', sortable: true },
      { title: 'RL yritys', value: 'penaltyshotattempt', sortable: true }
    ];

    const goalieHeaders = [
      { title: 'Nimi', value: 'playerName' },
      { title: 'Torjunnat', value: 'saves', sortable: true  },
      { title: 'Päästetyt maalit', value: 'goals_against', sortable: true  },
      { title: 'Torjunta-%', value: 'save_pct', sortable: true },
      { title: 'xG vastaan', value: 'xg_against', sortable: true },
      { title: 'Maalit/xG', value: 'goalperxg', sortable: true },
      { title: 'Syötöt', value: 'assist', sortable: true },
      { title: '2min', value: 'penalty_2m', sortable: true },
      { title: '10min', value: 'penalty_10m', sortable: true },
      { title: '20min', value: 'penalty_20m', sortable: true },
    ];

    const totalStats = computed(() => {
      const stats = {};
      if (!summedPlayerStats.value.length) return stats;

      // Alusta kaikki kentät nollaksi tai tyhjäksi
      Object.keys(summedPlayerStats.value[0]).forEach(key => {
        stats[key] = typeof summedPlayerStats.value[0][key] === 'number' ? 0 : '';
      });

      // Summaa kaikki numeeriset kentät
      summedPlayerStats.value.forEach(p => {
        Object.keys(p).forEach(key => {
          if (typeof p[key] === 'number') {
            stats[key] += p[key] || 0;
          }
        });
      });

      // Laske laukaisuprosentti ja total_shots
      stats.total_shots = (stats.shot_goal || 0) + (stats.shot_saved || 0) + (stats.shot_blocked || 0) + (stats.shot_missed || 0);
      stats.shot_pct = stats.total_shots > 0 ? (100 * (stats.shot_goal || 0) / stats.total_shots) : 0;
      stats.efficiency = (stats.xg && stats.xg > 0) ? (stats.shot_goal || 0) / stats.xg : 0;

      // Anna nimikenttään "Yhteensä"
      stats.playerName = 'Yhteensä';

      return stats;
    });

    const totalGoalieStats = computed(() => {
      const stats = {};
      if (!summedGoalieStats.value.length) return stats;

      // Alusta kaikki kentät nollaksi tai tyhjäksi
      Object.keys(summedGoalieStats.value[0]).forEach(key => {
        stats[key] = typeof summedGoalieStats.value[0][key] === 'number' ? 0 : '';
      });

      // Summaa kaikki numeeriset kentät
      summedGoalieStats.value.forEach(g => {
        Object.keys(g).forEach(key => {
          if (typeof g[key] === 'number') {
            stats[key] += g[key] || 0;
          }
        });
      });

      // Laske torjuntaprosentti
      const totalFaced = (stats.saves || 0) + (stats.goals_against || 0);
      stats.save_pct = totalFaced > 0 ? (100 * (stats.saves || 0) / totalFaced) : 0;

      // Anna nimikenttään "Yhteensä"
      stats.playerName = 'Yhteensä';

      return stats;
    });

    const summedPlayerStats = computed(() => {
        const statsByPlayer = {};

        gamePlayers.value.forEach(player => {
            // Käytä playerId ensisijaisesti, fallback playerNumber
            const key = player.playerId ?? player.playerNumber;
            if (!statsByPlayer[key]) {
            statsByPlayer[key] = { ...player };
            } else {
            // Summaa kaikki numeeriset tilastot
            Object.keys(player).forEach(field => {
                if (typeof player[field] === 'number') {
                statsByPlayer[key][field] += player[field];
                }
            });
            }
        });

        // Laske kaikki laukaukset ja laukaisuprosentti
        Object.values(statsByPlayer).forEach(p => {
          const totalShots = (p.shot_goal || 0) + (p.shot_saved || 0) + (p.shot_blocked || 0) + (p.shot_missed || 0);
          p.total_shots = totalShots;
          p.shot_pct = totalShots > 0 ? (100 * (p.shot_goal || 0) / totalShots) : 0;
          p.efficiency = (p.xg && p.xg > 0) ? (p.shot_goal || 0) / p.xg : 0;
        });

        // Palauta summatut tilastot listana
        return Object.values(statsByPlayer);
      });

    const summedGoalieStats = computed(() => {
        const statsByGoalie = {};

        gameGoalies.value.forEach(goalie => {
            // Käytä playerId ensisijaisesti, fallback playerNumber
            const key = goalie.playerId ?? goalie.playerNumber;
            if (!statsByGoalie[key]) {
            statsByGoalie[key] = { ...goalie };
            } else {
            // Summaa kaikki numeeriset tilastot
            Object.keys(goalie).forEach(field => {
                if (typeof goalie[field] === 'number') {
                statsByGoalie[key][field] += goalie[field];
                }
            });
            }
        });

        // Suodata pois maalivahdit, joilla playerId === 0
          const goalies = Object.values(statsByGoalie).filter(goalie => goalie.playerId !== 0);

          // Laske torjuntaprosentti
          goalies.forEach(g => {
            const totalFaced = (g.saves || 0) + (g.goals_against || 0);
            g.save_pct = totalFaced > 0 ? (100 * (g.saves || 0) / totalFaced) : 0;
            g.goalperxg = (g.xg_against && g.xg_against > 0) ? (g.goals_against || 0) / g.xg_against : 0;
          });

          return goalies;
    });

    
    const playerStatsWithSum = computed(() => {
      const stats = summedPlayerStats.value;
      console.log('Summed Player Stats:', stats);
      return [...stats];
    });

    const goalieStatsWithSum = computed(() => {
      const stats = summedGoalieStats.value;
      return [...stats];
    });
    
    const teamNames = ref('');

    const selectGame = (game) => {
        selectedGameId.value = game.gameId;
        teamNames.value = game.name || game.shortname || '';
        console.log('Selected game:', teamNames.value);
    };

    // Metodi pelien hakuun
    const loadGames = async (seasonId) => {
        try {
            const response = await fetch(`${config.apiUrl}/games/season/${seasonId}`);
            const data = await response.json();
            games.value = data || [];
            // Lisää "Kaikki ottelut" -vaihtoehto
            games.value.push({ gameId: 0, shortname: 'Kaikki ottelut' });
            gameOptions.value = games.value.map(game => ({
                gameId: game.gameId,
                name: game.name || game.shortname
        }));
        console.log('Games loaded:', gameOptions.value);
        } catch (error) {
        console.error('Error loading games:', error);
        alert('Virhe ladattaessa otteluita.');
        }
    };

    function getPlayerStatsSum(stats) {
      const sum = {};
      if (!stats.length) return sum;
      Object.keys(stats[0]).forEach(key => {
        if (typeof stats[0][key] === 'number') {
          sum[key] = stats.reduce((acc, item) => acc + (item[key] || 0), 0);
        } else if (key === 'playerId') {
          sum[key] = 'Yhteensä';
        } else {
          sum[key] = '';
        }
      });
      // Laske yhteensä laukaisuprosentti
      const totalShots = (sum.shot_goal || 0) + (sum.shot_saved || 0) + (sum.shot_blocked || 0) + (sum.shot_missed || 0);
      sum.total_shots = totalShots;
      sum.shot_pct = totalShots > 0 ? (100 * (sum.shot_goal || 0) / totalShots) : 0;
      return sum;
    }

    function getGoalieStatsSum(stats) {
      const sum = {};
      if (!stats.length) return sum;
      Object.keys(stats[0]).forEach(key => {
        if (typeof stats[0][key] === 'number') {
          sum[key] = stats.reduce((acc, item) => acc + (item[key] || 0), 0);
        } else if (key === 'playerId') {
          sum[key] = 'Yhteensä';
        } else {
          sum[key] = '';
        }
      });
      // Laske yhteensä torjuntaprosentti
      const totalFaced = (sum.saves || 0) + (sum.goals_against || 0);
      sum.save_pct = totalFaced > 0 ? (100 * (sum.saves || 0) / totalFaced) : 0;
      return sum;
    }


    // Hae ottelut
    onMounted(async () => {
        //const seasonId = teamStore.selectedSeasonId || 1; // tai muu oletus
        await loadGames(seasonId);  
    });

    // Hae tilastot kun ottelu vaihtuu
    watch(selectedGameId, async (gameId) => {
        if (gameId === null) {
            gamePlayers.value = [];
            gameGoalies.value = [];
            return;
        }
        loading.value = true;
        try {
            if (gameId === 0) {
            // Haetaan kauden kaikki pelaajatilastot
            const playerRes = await fetch(`${config.apiUrl}/season/${seasonId}/gameplayers`, {
                headers: {
                'x-api-key': config.apiKey,
                'Authorization': `Bearer ${authStore.token}`
                }
            });
            gamePlayers.value = playerRes.ok ? await playerRes.json() : [];

            // Haetaan kauden kaikki maalivahtitilastot
            const goalieRes = await fetch(`${config.apiUrl}/season/${seasonId}/gamegoalies`, {
                headers: {
                'x-api-key': config.apiKey,
                'Authorization': `Bearer ${authStore.token}`
                }
            });
            gameGoalies.value = goalieRes.ok ? await goalieRes.json() : [];
            } else {
            // Haetaan yksittäisen ottelun tilastot
            const playerRes = await fetch(`${config.apiUrl}/gameplayers/${gameId}`, {
                headers: {
                'x-api-key': config.apiKey,
                'Authorization': `Bearer ${authStore.token}`
                }
            });
            gamePlayers.value = playerRes.ok ? await playerRes.json() : [];

            const goalieRes = await fetch(`${config.apiUrl}/gamegoalies/${gameId}`, {
                headers: {
                'x-api-key': config.apiKey,
                'Authorization': `Bearer ${authStore.token}`
                }
            });
            gameGoalies.value = goalieRes.ok ? await goalieRes.json() : [];
            }
        } catch (e) {
            gamePlayers.value = [];
            gameGoalies.value = [];
        }
        loading.value = false;
        });

    return {
      loadGames,
      selectGame,
      games,
      teamNames,
      selectedGameId,
      gameOptions,
      gamePlayers,
      gameGoalies,
      loading,
      playerHeaders,
      goalieHeaders,
      summedPlayerStats,
      summedGoalieStats,
      playerStatsWithSum,
      goalieStatsWithSum,
      totalStats,
      totalGoalieStats,
      authStore,
    };
  },
  methods: {
    editGame() {
      console.log('Starting to navigate to edit game with ID:', this.selectedGameId);
      if (this.selectedGameId && this.selectedGameId !== 0) {
        console.log('Navigating to edit game with ID:', this.selectedGameId);
        this.$router.push(`/kliikki/${this.selectedGameId}`);
      } else {
        alert('Valitse ensin ottelu editoitavaksi');
      }
    }
  }
};
</script>

<style scoped>


.v-table td {
    min-width: 20px;
    width: 200px;
  }

  .v-data-table header {
    min-width: 20px;
    width: 200px;
  }

.v-slide-group__next, .v-slide-group__prev {
    display: flex;
}

.v-slide-group__content {
  justify-content: left;
}

.responsive-table.v-data-table {
  min-width: 900px; /* tai haluamasi minimi */
  font-size: 0.92em;
}
.goalie-table .v-table td,
.goalie-table .v-table th {
  padding-left: 4px !important;
  padding-right: 4px !important;
  min-width: 20px;
  width: 50px;
}

.selected-btn {
    background-color: #1976d2;
    color: white;
    margin-top: 9px;
  }

.container {
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 5px;
}


h1 {
  margin: 0px 0; /* Vähennä marginaalia otsikon ympärillä */
}

.games-list-container {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  margin-bottom: 8px; /* Vähennä marginaalia alapuolella */
}

.games-list {
  display: flex;
  overflow: hidden;
  padding: 0 5px;
  margin: 0 8px; /* Vähennä marginaalia vasemmalla ja oikealla */
  flex-grow: 1;
  scrollbar-width: none; /* Piilota vierityspalkki Firefoxissa */
}

.games-list::-webkit-scrollbar {
  display: none; /* Piilota vierityspalkki WebKit-pohjaisissa selaimissa */
}

.games-list button {
  margin-right: 5px; /* Vähennä marginaalia oikealla */
  padding: 10px; /* Vähennä pehmustetta */
  border: none;
  /*background-color: #f0f0f0;*/
  cursor: pointer;
  flex-shrink: 0;
  white-space: normal; /* Salli tekstin rivittyminen */
  word-wrap: break-word; /* Salli pitkien sanojen katkaisu */
}

.games-list button.active {
  background-color: #007bff;
  color: white;
}

.scroll-button {
  background-color: transparent;
  color: black;
  border: none;
  font-size: 2em; /* Vähennä fonttikokoa */
  padding: 0;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.scroll-button.left {
  left: 0;
}

.scroll-button.right {
  right: 0;
}

.team-names-display {
  margin-top: 10px; /* Vähennä marginaalia yläpuolella */
}

.team-names-display h3 {
  font-size: 1.5em;
  color: #2c3e50;
}



/* Media Queries for Responsiveness */
@media (max-width: 768px) {
  .container {
    padding: 0px;
  }

  .games-list button {
    padding: 8px;
    font-size: 0.9em;
  }

  .team-names-display h3 {
    font-size: 1.2em;
  }

}

@media (max-width: 480px) {
  .games-list-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .games-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .games-list button {
    margin-bottom: 10px;
    width: auto; /* Salli painikkeiden laajentua sisällön mukaan */
    flex: 1 1 auto; /* Salli painikkeiden kasvaa ja kutistua */
  }

  .legend li {
    display: block;
    margin-bottom: 10px;
  }

}

@media (prefers-color-scheme: dark) {
    .scroll-button {
        background-color: transparent;
        color: white;
        border: none;
        font-size: 2em; /* Vähennä fonttikokoa */
        padding: 0;
        cursor: pointer;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
    }
   }
 

</style>
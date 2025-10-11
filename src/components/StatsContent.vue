<template>
  <div class="stats-content">
    <!-- Loading Indicator -->
    <div v-if="loading" style="text-align:center; margin: 32px;">
      <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
      <div>Haetaan tilastoja...</div>
    </div>

    <!-- Stats Tables -->
    <div v-else class="stats-table">
      <!-- Player Stats -->
      <div style="overflow-x: auto; width: 100%; text-align: left;">
        <v-data-table
          :items="playerStatsWithSum"
          :headers="playerHeaders"
          :hide-default-header="false"
          :items-per-page="-1"
          :hide-default-footer="true"
          density="compact"
          class="responsive-table"
          style="table-layout: fixed;"
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

      <!-- Goalie Stats -->
      <div style="overflow-x: auto; width: 100%;">
      <v-data-table
        :items="goalieStatsWithSum"
        :headers="goalieHeaders"
        :hide-default-footer="true"
        density="compact"
        class="responsive-table goalie-table"
        style="table-layout: fixed;"
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
            <td>{{ totalGoalieStats.saves || 0 }}</td>
            <td>{{ totalGoalieStats.goals_against || 0 }}</td>
            <td>{{ totalGoalieStats.save_pct ? totalGoalieStats.save_pct.toFixed(2) : '0.00' }}</td>
            <td>{{ totalGoalieStats.xg_against ? totalGoalieStats.xg_against.toFixed(2) : '0.00' }}</td>
            <td>{{ totalGoalieStats.goalperxg ? totalGoalieStats.goalperxg.toFixed(2) : '0.00' }}</td>
            <td>{{ totalGoalieStats.assist || 0 }}</td>
            <td>{{ totalGoalieStats.penalty_2m || 0 }}</td>
            <td>{{ totalGoalieStats.penalty_10m || 0 }}</td>
            <td>{{ totalGoalieStats.penalty_20m || 0 }}</td>
          </tr>
        </template>
      </v-data-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useTeamStore } from '../stores/teamStore'
import config from '../../config'

export default {
  name: 'StatsContent',
  setup() {
    const teamStore = useTeamStore()
    
    // Reactive state
    const playerStats = ref([])
    const goalieStats = ref([])
    const teamNames = ref('')
    const loading = ref(false)
    const selectedGame = ref(null)
    
    // Headers for tables
    const playerHeaders = [
      { title: 'Nimi', value: 'playerName', sortable: true, width: '120px' },
      { title: 'M', value: 'goal', sortable: true, width: '40px' },
      { title: 'S', value: 'assist', sortable: true, width: '40px' },
      { title: 'P', value: 'point', sortable: true, width: '40px' },
      { title: 'LM', value: 'shot_goal', sortable: true, width: '40px' },
      { title: 'LT', value: 'shot_saved', sortable: true, width: '40px' },
      { title: 'LB', value: 'shot_blocked', sortable: true, width: '40px' },
      { title: 'LO', value: 'shot_missed', sortable: true, width: '40px' },
      { title: 'L', value: 'total_shots', sortable: true, width: '40px' },
      { title: 'L%', value: 'shot_pct', sortable: true, width: '50px' },
      { title: 'xG', value: 'xg', sortable: true, width: '50px' },
      { title: 'M/xG', value: 'efficiency', sortable: true, width: '50px' },
      { title: 'BL', value: 'blocked_shot', sortable: true, width: '40px' },
      { title: '+', value: 'plus_goal', sortable: true, width: '40px' },
      { title: '-', value: 'minus_goal', sortable: true, width: '40px' },
      { title: '+/-', value: 'plusminus', sortable: true, width: '45px' },
      { title: '2m', value: 'penalty_2m', sortable: true, width: '40px' },
      { title: '10m', value: 'penalty_10m', sortable: true, width: '40px' },
      { title: '20m', value: 'penalty_20m', sortable: true, width: '40px' },
      { title: 'YV', value: 'powerplaygoal', sortable: true, width: '40px' },
      { title: 'AV', value: 'shorthandedgoal', sortable: true, width: '40px' },
      { title: 'RLM', value: 'penaltyshotgoal', sortable: true, width: '40px' },
      { title: 'RLY', value: 'penaltyshotattempt', sortable: true, width: '40px' }
    ]
    
    const goalieHeaders = [
      { title: 'Nimi', value: 'playerName', width: '100px' },
      { title: 'T', value: 'saves', sortable: true, width: '40px'  },
      { title: 'PM', value: 'goals_against', sortable: true, width: '40px'  },
      { title: 'T%', value: 'save_pct', sortable: true, width: '50px' },
      { title: 'xGA', value: 'xg_against', sortable: true, width: '50px' },
      { title: 'M/xG', value: 'goalperxg', sortable: true, width: '50px' },
      { title: 'S', value: 'assist', sortable: true, width: '40px' },
      { title: '2m', value: 'penalty_2m', sortable: true, width: '40px' },
      { title: '10m', value: 'penalty_10m', sortable: true, width: '40px' },
      { title: '20m', value: 'penalty_20m', sortable: true, width: '40px' },
    ]
    
    // Computed properties
    const summedPlayerStats = computed(() => {
        const statsByPlayer = {};

        playerStats.value.forEach(player => {
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
          p.point = (p.goal || 0) + (p.assist || 0);
        });

        // Palauta summatut tilastot listana
        return Object.values(statsByPlayer);
    });

    const summedGoalieStats = computed(() => {
        const statsByGoalie = {};

        goalieStats.value.forEach(goalie => {
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
      return [...stats];
    });

    const goalieStatsWithSum = computed(() => {
      const stats = summedGoalieStats.value;
      return [...stats];
    });
    
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
      stats.goalperxg = (stats.xg_against && stats.xg_against > 0) ? (stats.goals_against || 0) / stats.xg_against : 0;

      // Anna nimikenttään "Yhteensä"
      stats.playerName = 'Yhteensä';

      return stats;
    });
    

    

    
    // Load game stats
    const loadStats = async (gameId) => {
      if (!gameId) return
      
      loading.value = true
      try {
        // Load player stats
        const playerResponse = await fetch(`${config.apiUrl}/gameplayers/${gameId}`)
        if (playerResponse.ok) {
          playerStats.value = await playerResponse.json()
        }
        
        // Load goalie stats  
        const goalieResponse = await fetch(`${config.apiUrl}/gamegoalies/${gameId}`)
        if (goalieResponse.ok) {
          goalieStats.value = await goalieResponse.json()
        }
        
        // Load team names
        await loadTeamNames(gameId)
        
      } catch (error) {
        console.error('Virhe tilastojen lataamisessa:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadTeamNames = async (gameId) => {
      try {
        const response = await fetch(`${config.apiUrl}/games/${gameId}`)
        if (!response.ok) return
        
        const game = await response.json()
        teamNames.value = game.name || `Ottelu ${gameId}`
        
      } catch (error) {
        console.error('Virhe ottelutietojen lataamisessa:', error)
      }
    }
    
    // Watch for currentGameId changes
    watch(() => teamStore.currentGameId, (newGameId) => {
      if (newGameId) {
        loadStats(newGameId)
      }
    }, { immediate: true })
    
    onMounted(() => {
      if (teamStore.currentGameId) {
        loadStats(teamStore.currentGameId)
      }
    })
    
    return {
      playerStats,
      goalieStats,
      teamNames,
      loading,
      playerHeaders,
      goalieHeaders,
      summedPlayerStats,
      summedGoalieStats,
      playerStatsWithSum,
      goalieStatsWithSum,
      totalStats,
      totalGoalieStats
    }
  }
}
</script>

<style scoped>
.stats-content {
  width: 100%;
}

.team-names-display {
  text-align: center;
  margin-bottom: 16px;
}

.stats-table {
  margin-top: 20px;
}

.stats-table h3 {
  margin-bottom: 16px;
  color: #1976d2;
}

.responsive-table {
  width: 100%;
  overflow-x: auto;
  font-size: 0.85rem;
}

.responsive-table :deep(.v-data-table__th) {
  font-size: 0.8rem !important;
  padding: 0 8px !important;
  white-space: nowrap;
}

.responsive-table :deep(.v-data-table__td) {
  padding: 4px 8px !important;
  text-align: center;
  font-size: 0.8rem;
}

.responsive-table :deep(.v-data-table__td:first-child) {
  text-align: left !important;
}

.goalie-table {
  margin-top: 32px;
}

.goalie-table :deep(.v-data-table__th),
.goalie-table :deep(.v-data-table__td) {
  padding: 4px 8px !important;
  text-align: left !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
}

.goalie-table :deep(.v-data-table__th:first-child),
.goalie-table :deep(.v-data-table__td:first-child) {
  text-align: left !important;
}

@media (max-width: 768px) {
  .responsive-table {
    font-size: 0.8rem;
  }
  
  .stats-table h3 {
    font-size: 1.2rem;
  }
}
</style>
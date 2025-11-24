<template>
  <div class="container">
    <div >
      <h2>Kentälliset</h2>
      <v-btn
        v-if="authStore.token"
        color="primary"
        variant="outlined"
        :loading="scrapingLineups"
        @click="scrapeLineups"
      >
        <v-icon left>mdi-download</v-icon>
        Hae kokoonpanot
      </v-btn>
    </div>
    
    <!-- Kentällisten valinta -->
    <div class="lineup-selector">
      <v-btn-toggle v-model="selectedLineup" mandatory>
        <v-btn value="1. Kentällinen">I</v-btn>    <v-btn value="2. Kentällinen">II</v-btn>
        <v-btn value="3. Kentällinen">III</v-btn>
        <v-btn value="4. Kentällinen">IV</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Ei kokoonpanotietoja -viesti -->
    <v-alert
      v-if="!hasLineupData"
      type="info"
      class="mb-4"
      variant="tonal"
    >
      <v-icon>mdi-information</v-icon>
      <span class="ml-2">
        Ei kokoonpanotietoja saatavilla.
        <span v-if="authStore.token">Käytä "Hae kokoonpanot" -nappia hakeaksesi tiedot.</span>
        <span v-else>Kirjaudu sisään hakeaksesi kokoonpanotiedot.</span>
      </span>
    </v-alert>

    <div v-if="hasLineupData" class="lineup-container">
      <!-- Kotijoukkue -->
      <div class="team-section home-team">
        <h3>{{ lineupData.teams?.home?.team_name || 'Kotijoukkue' }}</h3>
        <div class="field-container">
          <img src="/kuva.png" alt="Kenttä" class="field-image" />
          
          <!-- Kotijoukkueen pelaajat -->
          <div
            v-for="player in getHomeLineup"
            :key="player.person_id"
            class="player home-player"
            :style="getPlayerPosition(player, 'home')"
            @click="showPlayerHistory(player)"
          >
            <div class="player-number">#{{ player.number }} {{ player.status }} {{ getBirthYear(player.birthyear) }}</div>
            <div class="player-name">{{ getLastName(player.name) }}</div>
            <div v-if="getPositionType(player.position) === 'Goalkeeper'" class="player-stats">
              {{ getLastThreeSeasonsMvGames(player) }} / {{ getLastThreeSeasonsTO(player) }} / {{ getLastThreeSeasonsPM(player) }} / {{ getLastThreeSeasonsSavePercent(player) }}%
            </div>
            <div v-else class="player-stats">
              {{ getLastThreeSeasonsMatches(player) }} / {{ getLastThreeSeasonsGoals(player) }} + {{ getLastThreeSeasonsAssists(player) }} = {{ getLastThreeSeasonsPoints(player) }}
            </div>
          </div>
                    <div
            v-for="player in getAwayLineup"
            :key="player.person_id"
            class="player away-player"
            :style="getPlayerPosition(player, 'away')"
            @click="showPlayerHistory(player)"
          >
            <div class="player-number">#{{ player.number }} {{ player.status }} {{ getBirthYear(player.birthyear) }}</div>
            <div class="player-name">{{ getLastName(player.name) }}</div>
            <div v-if="getPositionType(player.position) === 'Goalkeeper'" class="player-stats">
              {{ getLastThreeSeasonsMvGames(player) }} / {{ getLastThreeSeasonsTO(player) }} / {{ getLastThreeSeasonsPM(player) }} / {{ getLastThreeSeasonsSavePercent(player) }}%
            </div>
            <div v-else class="player-stats">
              {{ getLastThreeSeasonsMatches(player) }} / {{ getLastThreeSeasonsGoals(player) }} + {{ getLastThreeSeasonsAssists(player) }} = {{ getLastThreeSeasonsPoints(player) }}
            </div>
          </div>

        </div>
                <h3>{{ lineupData.teams?.away?.team_name || 'Vierasjoukkue' }}</h3>
      </div>

    </div>

    <!-- Pelaajan historia dialogi -->
    <v-dialog v-model="showHistoryDialog" max-width="1000">
    <v-card v-if="selectedPlayer">
        <v-card-title>
        <span class="headline">#{{ selectedPlayer.number }} {{ selectedPlayer.name }}</span>
        </v-card-title>
        <v-card-text>
        <div class="player-info">
            <div><strong>Pelipaikka:</strong> {{ selectedPlayer.position }}</div>
            <div><strong>Status:</strong> {{ selectedPlayer.status }}</div>
            <div v-if="selectedPlayer.birthyear"><strong>Syntymävuosi:</strong> {{ selectedPlayer.birthyear }}</div>
            <div v-if="selectedPlayer.age && authStore.isAuthenticated"><strong>Ikä:</strong> {{ selectedPlayer.age }} vuotta</div>
        </div>
        
        <h4 class="mt-4">Kausikohtaiset tilastot ({{ selectedPlayer.statistics?.length || 0 }} sarjaa)</h4>
        <div v-if="selectedPlayer.position && selectedPlayer.position.toUpperCase().includes('MV')" class="mb-2">
          <small class="text-muted">
            <strong>Mv:</strong> Maalivahtiottelut, <strong>TO:</strong> Torjunnat, <strong>PM:</strong> Päästetyt maalit, <strong>T%:</strong> Torjuntaprosentti
          </small>
        </div>
        <v-data-table
            :headers="historyHeaders"
            :items="selectedPlayer.statistics || []"
            :items-per-page="15"
            :hide-default-footer="true"
            :no-data-text="'Ei tilastoja'"
            density="compact"
            :sort-by="[{ key: 'Kausi', order: 'desc' }]"
        >
            <template #item.Kausi="{ item }">
            <strong>{{ item.Kausi }}</strong>
            </template>
            <template #item.O="{ item }">
            {{ item.O || 0 }}
            </template>
            <template #item.M="{ item }">
            {{ item.M || 0 }}
            </template>
            <template #item.S="{ item }">
            {{ item.S || 0 }}
            </template>
            <template #item.P="{ item }">
            {{ item.P || 0 }}
            </template>
            <template #item.Jmin="{ item }">
            {{ item.Jmin || 0 }}
            </template>
            <template #item.avg="{ item }">
            {{ getPointsPerGame(item) }}
            </template>
        </v-data-table>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showHistoryDialog = false">Sulje</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useTeamStore } from '../stores/teamStore'
import { useAuthStore } from '../stores/authStore'
import config from '../../config'

export default {
    name: 'LineupsView',
    setup() {
        const teamStore = useTeamStore()
        const authStore = useAuthStore()
        
        const selectedLineup = ref('1. Kentällinen')
        const lineupData = ref({})
        const showHistoryDialog = ref(false)
        const selectedPlayer = ref(null)
        const scrapingLineups = ref(false)
        
        // Computed property for headers based on player type
        const historyHeaders = computed(() => {
            if (!selectedPlayer.value) {
                return []
            }
            
            const isGoalkeeper = selectedPlayer.value.position && selectedPlayer.value.position.toUpperCase().includes('MV')
            
            const baseHeaders = [
                { title: 'Kausi', value: 'Kausi', sortable: true, width: '100px' },
                { title: 'Joukkue', value: 'Joukkue', sortable: true, width: '120px' },
                { title: 'Sarja', value: 'Sarja', sortable: true, width: '140px' },
                { title: 'Ottelut', value: 'O', sortable: true, width: '50px' }
            ]
            
            if (isGoalkeeper) {
                // Maalivahtitilastot
                return [
                    ...baseHeaders,
                    { title: 'Mv', value: 'Mv', sortable: true, width: '50px' },
                    { title: 'TO', value: 'TO', sortable: true, width: '50px' },
                    { title: 'PM', value: 'PM', sortable: true, width: '50px' },
                    { title: 'T%', value: 'T%', sortable: true, width: '60px' },
                    { title: 'Pisteet', value: 'P', sortable: true, width: '50px' },
                    { title: 'Jmin', value: 'Jmin', sortable: true, width: '50px' }
                ]
            } else {
                // Kenttäpelaajatilastot
                return [
                    ...baseHeaders,
                    { title: 'Maalit', value: 'M', sortable: true, width: '50px' },
                    { title: 'Syötöt', value: 'S', sortable: true, width: '50px' },
                    { title: 'Pisteet', value: 'P', sortable: true, width: '50px' },
                    { title: 'Jmin', value: 'Jmin', sortable: true, width: '50px' },
                    { title: 'P/O', value: 'avg', sortable: false, width: '50px' }
                ]
            }
        })
        
        const loadLineupData = async () => {
            try {
                const gameId = teamStore.currentGameId
                if (!gameId) {
                    console.error('Ei gameId:tä saatavilla')
                    return
                }
                
                const response = await fetch(`${config.apiUrl}/lineups/${gameId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                lineupData.value = await response.json()
                console.log('Lineup data loaded:', lineupData.value)
            } catch (error) {
                console.error('Virhe kokoonpanojen latauksessa:', error)
                //alert('Virhe kokoonpanojen latauksessa')
            }
        }
        
        // Watch for currentGameId changes
        watch(() => teamStore.currentGameId, (newGameId) => {
            if (newGameId) {
                loadLineupData()
            }
        })
        
        // Computed properties
        const getHomeLineup = computed(() => {
            if (!lineupData.value.teams?.home?.lineups) return []
            
            const currentLineup = lineupData.value.teams.home.lineups[selectedLineup.value] || []
            
            // Kerää kaikki maalivahdit kaikista kentällisistä
            const allGoalkeepers = []
            Object.values(lineupData.value.teams.home.lineups).forEach((lineup) => {
                if (Array.isArray(lineup)) {
                    lineup.forEach(player => {
                        if (player.position && player.position.startsWith('MV/')) {
                            allGoalkeepers.push(player)
                        }
                    })
                }
            })
            
            // Ota vain kentälliset (ei maalivahteja)
            const fieldPlayers = currentLineup.filter(player => !player.position?.startsWith('MV/'))
            
            // Lisää oikea maalivahti kentälliseen
            const goalkeeper = getGoalkeeperForLineup(selectedLineup.value, allGoalkeepers, lineupData.value.teams.home.lineups)
            console.log('Home lineup:', selectedLineup.value, 'Goalkeeper:', goalkeeper?.name, goalkeeper?.position)
            return goalkeeper ? [...fieldPlayers, goalkeeper] : fieldPlayers
        })
        
        const getAwayLineup = computed(() => {
            if (!lineupData.value.teams?.away?.lineups) return []
            
            const currentLineup = lineupData.value.teams.away.lineups[selectedLineup.value] || []
            
            // Kerää kaikki maalivahdit kaikista kentällisistä
            const allGoalkeepers = []
            Object.values(lineupData.value.teams.away.lineups).forEach((lineup) => {
                if (Array.isArray(lineup)) {
                    lineup.forEach(player => {
                        if (player.position && player.position.startsWith('MV/')) {
                            allGoalkeepers.push(player)
                        }
                    })
                }
            })
            
            // Ota vain kentälliset (ei maalivahteja)
            const fieldPlayers = currentLineup.filter(player => !player.position?.startsWith('MV/'))
            
            // Lisää oikea maalivahti kentälliseen
            const goalkeeper = getGoalkeeperForLineup(selectedLineup.value, allGoalkeepers, lineupData.value.teams.away.lineups)
            console.log('Away lineup:', selectedLineup.value, 'Goalkeeper:', goalkeeper?.name, goalkeeper?.position)
            return goalkeeper ? [...fieldPlayers, goalkeeper] : fieldPlayers
        })
        
        const getGoalkeeperForLineup = (lineup, goalkeepers, teamLineups) => {
            if (!Array.isArray(goalkeepers)) return null
            
            // Tarkista onko valittu kentällinen olemassa joukkueella
            const teamLineupKeys = Object.keys(teamLineups || {})
            if (!teamLineupKeys.includes(lineup)) {
                console.log('Lineup not found for team:', lineup, 'Available:', teamLineupKeys)
                return null // Jos kentällistä ei ole, älä näytä maalivahtia
            }
            
            // Etsi MV/1 ja MV/2
            const mv1 = goalkeepers.find(gk => gk.position === 'MV/1')
            const mv2 = goalkeepers.find(gk => gk.position === 'MV/2')
            
            // Etsi joukkueen viimeinen kentällinen dynaamisesti
            const possibleLineups = ['1. Kentällinen', '2. Kentällinen', '3. Kentällinen', '4. Kentällinen']
            const existingLineups = possibleLineups.filter(lineupName => 
                teamLineupKeys.includes(lineupName)
            )
            const lastLineup = existingLineups[existingLineups.length - 1]
            
            console.log('Available lineups:', existingLineups, 'Last:', lastLineup, 'Current:', lineup)
            
            if (lineup === lastLineup && mv2) {
                // Viimeisessä kentällisessä -> MV/2 (jos olemassa)
                return mv2
            } else if (mv1) {
                // Muissa kentällisissä -> MV/1 (tai MV/1 kaikissa jos ei MV/2)
                return mv1
            }
            
            return null
        }
        
        const getTotalMatches = computed(() => {
            if (!selectedPlayer.value?.statistics) return 0
            return selectedPlayer.value.statistics.reduce((sum, stat) => sum + parseInt(stat.O || 0), 0)
        })
        
        const getTotalGoals = computed(() => {
            if (!selectedPlayer.value?.statistics) return 0
            return selectedPlayer.value.statistics.reduce((sum, stat) => sum + parseInt(stat.M || 0), 0)
        })
        
        const getTotalAssists = computed(() => {
            if (!selectedPlayer.value?.statistics) return 0
            return selectedPlayer.value.statistics.reduce((sum, stat) => sum + parseInt(stat.S || 0), 0)
        })
        
        const getTotalPoints = computed(() => {
            if (!selectedPlayer.value?.statistics) return 0
            return selectedPlayer.value.statistics.reduce((sum, stat) => sum + parseInt(stat.P || 0), 0)
        })
        
        // Kolmen viimeisimmän kauden tilastot
        const getLastThreeSeasonsMatches = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.O || 0), 0)
        }
        
        const getLastThreeSeasonsGoals = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.M || 0), 0)
        }
        
        const getLastThreeSeasonsAssists = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.S || 0), 0)
        }
        
        const getLastThreeSeasonsPoints = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.P || 0), 0)
        }

         // Maalivahtien tilastot kolmelta viimeisimmältä kaudelta
        const getLastThreeSeasonsMvGames = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.Mv || 0), 0)
        }
        
        const getLastThreeSeasonsTO = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.TO || 0), 0)
        }
        
        const getLastThreeSeasonsPM = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return 0
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            return lastThree.reduce((sum, stat) => sum + parseInt(stat.PM || 0), 0)
        }
        
        const getLastThreeSeasonsSavePercent = (player) => {
            if (!player?.statistics || player.statistics.length === 0) return '0.0'
            const sortedStats = [...player.statistics].sort((a, b) => {
                return b.Kausi.localeCompare(a.Kausi)
            })
            const lastThree = sortedStats.slice(0, 4)
            
            const totalTO = lastThree.reduce((sum, stat) => sum + parseInt(stat.TO || 0), 0)
            const totalPM = lastThree.reduce((sum, stat) => sum + parseInt(stat.PM || 0), 0)
            
            if (totalTO + totalPM === 0) return '0.0'
            
            const savePercent = (totalTO / (totalTO + totalPM)) * 100
            return savePercent.toFixed(1)
        }

        const hasLineupData = computed(() => {
            return lineupData.value.teams?.home?.lineups || lineupData.value.teams?.away?.lineups
        })
        
        // Methods
        const getPointsPerGame = (item) => {
            const games = parseInt(item.O || 0)
            const points = parseInt(item.P || 0)
            if (games === 0) return '0.00'
            return (points / games).toFixed(2)
        }
        
        const getPlayerPosition = (player, team) => {
            const positionType = getPositionType(player.position)
            const positionDetail = player.position
            
            let x, y
            
            if (team === 'away') {
                // Kotijoukkue (vasemmalta oikealle)
                switch (positionType) {
                case 'Goalkeeper':
                    x = 50; y = 82; break
                case 'Defence':
                    y = 70
                    x = positionDetail.includes('VP') ? 30 : 70
                    break
                case 'Center':
                    x = 50; y = 57; break
                case 'Wing':
                    y = 57
                    x = positionDetail.includes('VL') ? 17 : 83
                    break
                default:
                    x = 40; y = 30
                }
            } else {
                // Vierasjoukkue (peilikuva)
                switch (positionType) {
                case 'Goalkeeper':
                    x = 50; y = 17; break
                case 'Defence':
                    y = 29
                    x = positionDetail.includes('VP') ? 70 : 30
                    break
                case 'Center':
                    x = 50; y = 42; break
                case 'Wing':
                    y = 42
                    x = positionDetail.includes('VL') ? 83 : 17
                    break
                default:
                    x = 60; y = 70
                }
            }
            
            return {
                position: 'absolute',
                left: x + '%',
                top: y + '%',
                transform: 'translate(-50%, -50%)'
            }
        }
        
        const getPositionType = (position) => {
            if (!position) return 'Center'
            if (position.includes('MV')) return 'Goalkeeper'
            if (position.includes('VP') || position.includes('OP')) return 'Defence'
            if (position.includes('KH')) return 'Center'
            if (position.includes('VL') || position.includes('OL')) return 'Wing'
            return 'Center'
        }

        const getBirthYear = (birthyear) => {
            if (!birthyear) return ''
            const yearString = birthyear.toString()
            const lastTwoDigits = yearString.slice(-2)
            return `-${lastTwoDigits}`          
        }

        const getLastNameWithYear = (fullName, birthyear) => {
            if (!fullName) return ''
            const parts = fullName.split(' ')
            const lastName = parts[0]
            
            if (birthyear) {
                const yearString = birthyear.toString()
                const lastTwoDigits = yearString.slice(-2)
                return `${lastName} -${lastTwoDigits}`
            }
            
            return lastName
        }
        
        const getLastName = (fullName) => {
            if (!fullName) return ''
            const parts = fullName.split(' ')
            return parts[0]
        }
        
        const showPlayerHistory = (player) => {
            selectedPlayer.value = player
            showHistoryDialog.value = true
        }
        
        const formatDate = (dateString) => {
            if (!dateString) return '-'
            return new Date(dateString).toLocaleDateString('fi-FI')
        }
        
        const scrapeLineups = async () => {
            const gameId = teamStore.currentGameId
            if (!gameId) {
                alert('Ottelun ID puuttuu')
                return
            }
            
            scrapingLineups.value = true
            console.log('Aloitetaan kokoonpanojen haku...')
            try {
                const response = await fetch(`${config.apiUrl}/scrape-lineups`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        gameId: gameId,
                        stats_count: 8
                    })
                })
                
                if (!response.ok) {
                  const errorData = await response.json()
            
                  // Spesifinen käsittely 404-virheelle (sbl_matchid puuttuu)
                  if (response.status === 404 && errorData.error === 'Game does not have sbl_matchid') {
                      alert('Ottelulta puuttuu SBL-ottelu ID. Kokoonpanotietoja ei voida hakea automaattisesti.')
                      return
                  }          

                  // Muut virheet
                  throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
                }      

                const result = await response.json()
                console.log('Kokoonpanot haettu:', result)
                
                // Lataa päivitetyt tiedot
                await loadLineupData()
                
                // Näytä onnistumisviesti
                alert('Kokoonpanot haettu onnistuneesti!')
                
            } catch (error) {
                console.error('Virhe kokoonpanojen haussa:', error)
                alert(`Virhe kokoonpanojen haussa: ${error.message}`)
            } finally {
                scrapingLineups.value = false
            }
        }
        
        onMounted(() => {
            loadLineupData()
        })
        
        return {
            selectedLineup,
            lineupData,
            showHistoryDialog,
            selectedPlayer,
            historyHeaders,
            scrapingLineups,
            authStore,
            hasLineupData,
            loadLineupData,
            scrapeLineups,
            getHomeLineup,
            getAwayLineup,
            getTotalMatches,
            getTotalGoals,
            getTotalAssists,
            getTotalPoints,
            getLastThreeSeasonsMatches,
            getLastThreeSeasonsGoals,
            getLastThreeSeasonsAssists,
            getLastThreeSeasonsPoints,
            getLastThreeSeasonsMvGames,
            getLastThreeSeasonsTO,
            getLastThreeSeasonsPM,
            getLastThreeSeasonsSavePercent,
            getPointsPerGame,
            getPlayerPosition,
            getPositionType,
            getGoalkeeperForLineup,
            getLastName,
            getBirthYear,
            getLastNameWithYear,
            showPlayerHistory,
            formatDate
        }
    }
};
</script>

<style scoped>
.container {
  padding: 0px 18px 8px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-section h2 {
  margin: 0;
}

.lineup-selector {
  text-align: center;
  margin-bottom: 10px;
}

.lineup-container {
  display: flex;
  gap: 32px;
  justify-content: space-around;
}

.team-section {
  flex: 1;
  max-width: 500px;
}

.team-section h3 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.2em;
  font-weight: bold;
}

.field-container {
  position: relative;
  width: 100%;
}

.field-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.player {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid;
  border-radius: 8px;
  padding: 4px 8px;
  min-width: 100px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.home-player {
  border-color: #d32f2f;
  color: #d32f2f;
}

.away-player {
  border-color: #1976d2;
  color: #1976d2;
}

.player:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10;
}

.player-number {
  font-weight: bold;
  font-size: 1.0em;
  max-width: 125px;
}

.player-name {
  font-size: 1.0em;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 125px;
}

.player-stats {
  font-size: 0.8em;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 125px;
}

.goalkeeper-info {
  font-size: 0.7em;
  font-weight: 500;
  color: #666;
  margin-top: 2px;
  text-align: center;
}

.player-info {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.player-info div {
  margin-bottom: 8px;
}

/* Responsiivisuus */
@media (max-width: 768px) {
  .lineup-container {
    flex-direction: column;
    gap: 24px;
  }
  
  .player {
    min-width: 80px;
    padding: 2px 4px;
    font-size: 0.7em;
  }
  
  .player-name {
    font-size: 0.95em;
    max-width: 80px;
  }
}

@media (max-width: 480px) {
  .lineup-selector .v-btn {
    font-size: 0.9em;
    padding: 8px 12px;
  }
  
  .player {
    min-width: 80px;
    padding: 2px;
    font-size: 0.8em;
  }
}
</style>
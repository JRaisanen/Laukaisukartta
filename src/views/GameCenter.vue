<template>
  <div class="game-center-wrapper">
    <v-container fluid class="pa-2 pa-sm-4">
      <!-- Game Header -->
      <v-card class="mb-4">
        <v-card-title>
          <div class="d-flex align-center">
            <div class="game-header-content">
              <!-- Joukkueet logojen kanssa -->
              <div class="teams-header d-flex align-center justify-center mb-2">
                <!-- Jos joukkueiden nimet ja logot ovat saatavilla -->
                <template v-if="gameInfo?.homeTeamName && gameInfo?.awayTeamName">
                  <div class="team-info d-flex flex-column align-center">
                    <img 
                      v-if="gameInfo?.homeTeamLogo"
                      :src="gameInfo.homeTeamLogo"
                      :alt="gameInfo?.homeTeamName || 'Kotijoukkue'"
                      class="team-logo mb-1"
                      @error="onLogoError"
                    />
                    <span class="team-name">{{ gameInfo.homeTeamName }}</span>
                  </div>
                  
                  <div class="vs-section mx-3">
                    <span class="vs-text">vs</span>
                    <div v-if="gameInfo?.result" class="result-display mt-1">
                      <v-chip 
                        text-color="white"
                        class="result-chip"
                        size="small"
                      >
                        {{ gameInfo.result }}
                      </v-chip>
                    </div>
                  </div>
                  
                  <div class="team-info d-flex flex-column align-center">
                    <img 
                      v-if="gameInfo?.awayTeamLogo"
                      :src="gameInfo.awayTeamLogo"
                      :alt="gameInfo?.awayTeamName || 'Vierasjoukkue'"
                      class="team-logo mb-1"
                      @error="onLogoError"
                    />
                    <span class="team-name">{{ gameInfo.awayTeamName }}</span>
                  </div>
                </template>
                
                <!-- Jos joukkueiden nimiä ei ole, näytä ottelun nimi -->
                <template v-else>
                  <div class="match-title-fallback">
                    <h3 class="mb-0">{{ gameTitle }}</h3>
                    
                    <!-- Painike joukkuetietojen hakemiseen kirjautuneille -->
                    <div v-if="authStore.token && !scrapingGameInfo" class="mt-2">
                      <v-btn
                        @click="scrapeGameInfo"
                        color="primary"
                        size="small"
                        :loading="scrapingGameInfo"
                        prepend-icon="mdi-download"
                      >
                        Hae joukkuetiedot
                      </v-btn>
                    </div>
                    
                    <div v-if="gameInfo?.result" class="result-display mt-2">
                      <v-chip 
                        text-color="white"
                        class="result-chip"
                        size="small"
                      >
                        {{ gameInfo.result }}
                      </v-chip>
                    </div>
                  </div>
                </template>
              </div>

              <div v-if="gameInfo?.gameDate" class="text-center">
                <span class="game-date">{{ formatDate(gameInfo.gameDate) }}</span>
              </div>              
            </div>
            <v-btn 
              icon 
              @click="goBack"
              class="mr-3"
              size="small"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </div>
        </v-card-title>        
      </v-card>

      <!-- Tabs -->
      <v-card >
        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="lineup">
            <v-icon left>mdi-account-group</v-icon>
            Kokoonpano
          </v-tab>
          
          <v-tab value="shots">
            <v-icon left>mdi-target</v-icon>
            Laukaisukartta
          </v-tab>
          
          <v-tab value="stats">
            <v-icon left>mdi-chart-box</v-icon>
            Tilastot
          </v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs-window v-model="activeTab">
            <!-- Lineup Tab -->
            <v-tabs-window-item value="lineup">
              <div v-if="gameId">
                <LineupView />
              </div>
              <v-alert v-else type="error" class="ma-4">
                Ottelun ID puuttuu
              </v-alert>
            </v-tabs-window-item>

            <!-- Shots Tab -->
            <v-tabs-window-item value="shots">
              <div v-if="gameId">
                <GameContent />
              </div>
              <v-alert v-else type="error" class="ma-4">
                Ottelun ID puuttuu
              </v-alert>
            </v-tabs-window-item>

            <!-- Stats Tab -->
            <v-tabs-window-item value="stats">
              <div v-if="gameId">
                <StatsContent />
              </div>
              <v-alert v-else type="error" class="ma-4">
                Ottelun ID puuttuu
              </v-alert>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTeamStore } from '../stores/teamStore'
import { useAuthStore } from '../stores/authStore'
import config from '../../config'

// Import the components that will be used in tabs
import LineupView from './LineupsView.vue'
import GameContent from '../components/GameContent.vue'
import StatsContent from '../components/StatsContent.vue'

export default {
  name: 'GameCenter',
  components: {
    LineupView,
    GameContent,
    StatsContent
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const teamStore = useTeamStore()
    const authStore = useAuthStore()
    
    const activeTab = ref('lineup')
    const loading = ref(false)
    const gameInfo = ref(null)
    const scrapingGameInfo = ref(false) // Uusi muuttuja
    
    // Get gameId from route params
    const gameId = computed(() => {
      return route.params.gameId
    })
    
    const gameTitle = computed(() => {
      // Jos molemmat joukkueiden nimet ovat saatavilla, käytä niitä
      if (gameInfo.value?.homeTeamName && gameInfo.value?.awayTeamName) {
        return `${gameInfo.value.homeTeamName} vs ${gameInfo.value.awayTeamName}`
      }
      
      // Jos joukkueiden nimiä ei ole, käytä ottelun nimeä
      if (gameInfo.value?.name) {
        return gameInfo.value.name
      }
      
      // Viimeisenä vaihtoehtona käytä gameId:tä
      return gameId.value ? `Ottelu #${gameId.value}` : 'Game Center'
    })

    const loadGameInfo = async () => {
      if (!gameId.value) return
      
      loading.value = true
      try {
        const response = await fetch(`${config.apiUrl}/games/${gameId.value}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        gameInfo.value = data
        
        // Hae joukkuetiedot erillisellä kutsulla
        await loadTeamInfo()

        // Automaattinen tabin valinta ottelun tilan perusteella
        setDefaultTab()
        
      } catch (error) {
        console.error('Virhe ottelutietojen lataamisessa:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadTeamInfo = async () => {
      if (!gameId.value) return
      
      try {
        const response = await fetch(`${config.apiUrl}/gameinfo/${gameId.value}`)
        
        if (!response.ok) {
          console.warn('Joukkuetietojen haku epäonnistui, käytetään oletustietoja')
          return
        }
        
        const teamData = await response.json()
        
        // Päivitetään vain joukkuetiedot gameInfo:on
        if (gameInfo.value) {
          gameInfo.value.homeTeamName = teamData.home_team?.name
          gameInfo.value.awayTeamName = teamData.away_team?.name
          gameInfo.value.homeTeamLogo = teamData.home_team?.logo_url
          gameInfo.value.awayTeamLogo = teamData.away_team?.logo_url
        }
        
      } catch (error) {
        console.warn('Virhe joukkuetietojen lataamisessa:', error)
      }
    }

    const setDefaultTab = () => {
      if (!gameInfo.value) return
      
      // Jos ottelulla on tulos, avaa laukaisukartta
      if (gameInfo.value.result && gameInfo.value.result.trim() !== '') {
        activeTab.value = 'shots'
      } else {
        // Jos tulosta ei ole, avaa kokoonpanotiedot
        activeTab.value = 'lineup'
      }
    }
        
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('fi-FI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const getResultColor = (result) => {
      if (!result) return 'grey'
      
      const parts = result.split('-')
      if (parts.length === 2) {
        const home = parseInt(parts[0])
        const away = parseInt(parts[1])
        if (home > away) return 'green'
        if (home < away) return 'red'
        return 'orange' // Tasapeli
      }
      return 'grey'
    }
    
    const scrapeGameInfo = async () => {
      if (!gameId.value) {
        alert('Ottelun ID puuttuu')
        return
      }
      
      scrapingGameInfo.value = true
      console.log('Aloitetaan joukkuetietojen haku...')
      try {
        const response = await fetch(`${config.apiUrl}/scrape-gameinfo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gameId: gameId.value
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Joukkuetiedot haettu:', result)
        
        // Lataa päivitetyt tiedot
        await loadTeamInfo()
        
        // Näytä onnistumisviesti
        alert('Joukkuetiedot haettu onnistuneesti!')
        
      } catch (error) {
        console.error('Virhe joukkuetietojen haussa:', error)
        alert(`Virhe joukkuetietojen haussa: ${error.message}`)
      } finally {
        scrapingGameInfo.value = false
      }
    }

    const goBack = () => {
      router.push('/matches')
    }
    
    const refreshData = () => {
      loadGameInfo()
      // Trigger refresh on child components if needed
      // This could be enhanced by emitting events to child components
    }

    const onLogoError = (event) => {
      // Piilotetaan kuva jos se ei lataudu
      event.target.style.display = 'none'
    }
    
    // Watch for route changes
    watch(() => route.params.gameId, (newGameId) => {
      if (newGameId) {
        teamStore.setCurrentGameId(String(newGameId))
        loadGameInfo()
      }
    }, { immediate: true })
    
    // Watch for gameInfo changes to set default tab
    watch(() => gameInfo.value, () => {
      if (gameInfo.value) {
        setDefaultTab()
      }
    })
    
    onMounted(() => {
      if (gameId.value) {
        teamStore.setCurrentGameId(String(gameId.value))
        loadGameInfo()
      }
    })
    
    return {
      activeTab,
      loading,
      gameInfo,
      gameId,
      gameTitle,
      loadGameInfo,
      loadTeamInfo,
      setDefaultTab,
      formatDate,
      getResultColor,
      goBack,
      refreshData,
      onLogoError,
      scrapingGameInfo,  // Uusi
      scrapeGameInfo,
      authStore
    }
  }
}
</script>

<style scoped>
.game-center-wrapper {
  width: 100%;
}

.game-center {
  padding: 16px;
}

.game-date {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: normal;
}

.v-card {
  width: 100%;
  border-radius: 0; /* Poistaa pyöristetyt kulmat reunoilta */
}

.v-tabs {
  width: 100%;
  margin-bottom: 0;
}

.v-tabs .v-tab {
  flex: 1; /* Jakaa tabit tasaisesti koko leveydelle */
  max-width: none !important;
}

.v-card-title h2 {
  font-size: 1.5rem;
  font-weight: 500;
}

.v-chip {
  font-weight: bold;
}

.game-header-left {
  flex: 1;
}

.v-card-text {
    padding-left: 16px;
    padding-top: 0px;
}

/*
.result-chip {
  font-size: 1.25rem !important;
  font-weight: bold;
  padding: 0px 22px !important;
  min-width: 80px;
  
}
*/
/* Ensure tab content has proper spacing */
.v-tabs-window-item {
  padding-top: 16px;
}

.game-header-content {
  flex: 1;
  text-align: center;
}

.teams-header {
  min-height: 50px;
}

.team-info {
  flex: 1;
}

.team-logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: 4px;
}

.team-name {
  font-weight: 500;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.vs-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.vs-text {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: normal;
}

.result-display {
  margin-top: 4px;
}

.result-chip {
  font-size: 0.875rem !important;
  font-weight: bold;
  padding: 2px 22px !important;
  min-width: 50px;
}

.game-date {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: normal;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .v-container {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  
  .v-card {
    margin-bottom: 8px;
  }
  
  .v-card-text {
    padding: 0px !important;
  }
  
  .v-tabs-window-item {
    padding-top: 2px;
  }

  .team-logo {
    width: 70px;
    height: 70px;
  }
  
  .team-name {
    font-size: 0.9rem;
    max-width: 100px;
  }
  
  .vs-section {
    min-width: 50px;
  }
}

@media (max-width: 400px) {
  .v-container {
    padding-left: 2px !important;
    padding-right: 2px !important;
  }
  
  .v-card-text {
    padding: 0px !important;
  }
}
</style>
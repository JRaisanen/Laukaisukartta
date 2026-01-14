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
                <v-btn 
                  icon 
                  @click="goBack"
                  class="mr-0"
                  size="small"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>

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
                    <div v-if="gameInfo?.gameDate" class="text-center">
                      <span class="game-date">{{ formatDate(gameInfo.gameDate) }}</span>
                    </div>              

                    <div v-if="gameInfo?.result" class="result-display mt-1">
                      
                      <v-chip 
                        text-color="white"
                        class="result-chip"
                      >
                        {{ gameInfo.result }}
                      </v-chip>

                    </div>
                    <span v-else class="vs-text">vs</span>
                    
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
                    
                    <div v-if="gameInfo?.result" class="result-display">
                      <v-chip 
                        text-color="white"
                        class="result-chip"
                        size="x-large"
                      >
                        {{ gameInfo.result }}
                      </v-chip>
                    </div>
                  </div>
                </template>
              </div>

            </div>
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
          
          <v-tab v-if="authStore.isAuthenticated || analysisResult" value="ai">
            <v-icon left>mdi-brain</v-icon>
            AI Analyysi
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
            
            <!-- AI Analysis Tab -->
            <v-tabs-window-item value="ai" v-if="authStore.isAuthenticated || analysisResult">
              <div v-if="gameId">
                <v-card class="ma-4">
                  <v-card-title>AI Analyysi</v-card-title>
                  <v-card-text>
                    <div v-if="authStore.isAuthenticated" class="d-flex flex-column align-center mb-4">
                      <v-btn
                        @click="runAIAnalysis"
                        color="primary"
                        size="large"
                        :loading="loadingAnalysis"
                        :disabled="loadingAnalysis"
                        prepend-icon="mdi-brain"
                      >
                        Tee analyysi
                      </v-btn>
                    </div>  

                    <div v-if="authStore.isAuthenticated" class="d-flex flex-column align-center mb-4">
                      <v-btn
                        @click="saveAIAnalysis"
                        color="primary"
                        size="large"
                        :disabled="!analysisResult"
                        prepend-icon="mdi-content-save"
                      >
                        Tallenna analyysi
                      </v-btn>
                    </div>  
                    <div v-if="authStore.isAuthenticated" class="d-flex flex-column align-center mb-4">

                      <v-btn
                        @click="deleteAIFiles"
                        color="primary"
                        size="large"
                        prepend-icon="mdi-brain"
                      >
                        Poista AI-tiedostot
                      </v-btn>
                    </div>
                    
                    <v-alert v-if="analysisStatus" type="info" class="mt-4">
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        size="20"
                        class="mr-3"
                      ></v-progress-circular>
                      {{ analysisStatus }}
                    </v-alert>
                    
                    <v-card v-if="analysisResult" variant="outlined" class="mt-4">
                      <v-card-text>
                        <div class="analysis-content">
                          {{ analysisResult }}
                        </div>
                      </v-card-text>
                    </v-card>
                    
                    <v-alert v-if="analysisError" type="error" class="mt-4">
                      {{ analysisError }}
                    </v-alert>
                  </v-card-text>
                </v-card>
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
    const loadingAnalysis = ref(false)
    const analysisResult = ref(null)
    const analysisError = ref(null)
    const analysisStatus = ref(null)
    
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
        
        console.log('Ottelutiedot ladattu:', data)
        // Hae AI-analyysi jos se on olemassa
        await loadAIAnalysis()

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

    const loadAIAnalysis = async () => {
      if (!gameId.value) return
      
      try {
        const response = await fetch(`${config.apiUrl}/get-ai-analysis/${gameId.value}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.analysis) {
            analysisResult.value = data.analysis
            console.log('AI-analyysi ladattu tietokannasta')
          }
        } else if (response.status !== 404) {
          // 404 on ok (ei analyysiä), muut virheet logitetaan
          console.warn('Virhe AI-analyysin lataamisessa:', response.status)
        }
      } catch (error) {
        console.warn('Virhe AI-analyysin lataamisessa:', error)
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
        //const response = await fetch(`${config.apiUrl}/gatheraidata`, {
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
    
    const checkAnalysisStatus = async (threadId, runId) => {
      try {
        const response = await fetch(`${config.apiUrl}/ai-analysis-status/${threadId}/${runId}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('Virhe statuksen tarkistuksessa:', error)
        throw error
      }
    }
    
    const runAIAnalysis = async () => {
      if (!gameId.value) {
        analysisError.value = 'Ottelun ID puuttuu'
        return
      }
      
      loadingAnalysis.value = true
      analysisError.value = null
      analysisResult.value = null
      analysisStatus.value = 'Käynnistetään analyysi...'
      
      try {
        // Käynnistä analyysi
        const response = await fetch(`${config.apiUrl}/analyze-game-with-ai`, {
        //const response = await fetch(`${config.apiUrl}/test-code-interpreter`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            gameId: gameId.value, 
            question: "Analysoi ottelu eräkohtaisesti" 
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        const { threadId, runId } = result
        
        analysisStatus.value = `Analyysi käynnistetty. Ladatut tiedostot: ${result.filesUploaded || 0}. Odotetaan tulosta...`
        
        // Pollaa statusta kunnes valmis
        let attempts = 0
        const maxAttempts = 15 // Max 5 minuuttia (60 * 5s)
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)) // Odota 5 sekuntia
          
          const statusResult = await checkAnalysisStatus(threadId, runId)
          
          if (statusResult.status === 'completed') {
            // Analyysi valmis
            const response = statusResult.response
            let analysisText = ''
            
            if (Array.isArray(response)) {
              response.forEach(item => {
                if (item.type === 'text') {
                  analysisText += item.text.value + '\n'
                }
              })
            } else if (typeof response === 'string') {
              analysisText = response
            } else if (response?.text?.value) {
              analysisText = response.text.value
            }
            
            analysisResult.value = analysisText || 'Analyysi valmis, mutta ei sisältöä'
            analysisStatus.value = null
            break
          } else if (statusResult.status === 'failed') {
            throw new Error(statusResult.error || 'Analyysi epäonnistui')
          } else {
            // Vielä käynnissä
            analysisStatus.value = `Analyysi käynnissä... (${attempts + 1}/${maxAttempts})`
          }
          
          attempts++
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('Analyysi aikakatkaistiin (maksimiaika ylittyi)')
        }
        
      } catch (error) {
        console.error('Virhe AI-analyysin suorittamisessa:', error)
        analysisError.value = `Virhe AI-analyysin suorittamisessa: ${error.message}`
        analysisStatus.value = null
      } finally {
        loadingAnalysis.value = false
      }
    }

    const deleteAIFiles = async () => {
      if (!gameId.value) {
        alert('Ottelun ID puuttuu')
        return
      }
      
      if (!confirm('Haluatko varmasti poistaa kaikki AI-tiedostot?')) {
        return
      }
      
      try {
        const response = await fetch(`${config.apiUrl}/openai-files`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('AI-tiedostot poistettu:', result)
        alert(`AI-tiedostot poistettu onnistuneesti! Poistettu: ${result.deletedCount || 0} tiedostoa`)
        
      } catch (error) {
        console.error('Virhe AI-tiedostojen poistossa:', error)
        alert(`Virhe AI-tiedostojen poistossa: ${error.message}`)
      }
    }

    const saveAIAnalysis = async () => {
      if (!gameId.value) {
        alert('Ottelun ID puuttuu')
        return
      }
      
      if (!analysisResult.value) {
        alert('Ei tallennettavaa analyysiä. Tee ensin analyysi.')
        return
      }
      
      try {
        const response = await fetch(`${config.apiUrl}/save-ai-analysis`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gameId: gameId.value,
            analysis: analysisResult.value
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('AI-analyysi tallennettu:', result)
        alert('AI-analyysi tallennettu onnistuneesti!')
        
      } catch (error) {
        console.error('Virhe AI-analyysin tallennuksessa:', error)
        alert(`Virhe AI-analyysin tallennuksessa: ${error.message}`)
      }
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
      loadAIAnalysis,
      setDefaultTab,
      formatDate,
      getResultColor,
      goBack,
      refreshData,
      onLogoError,
      scrapingGameInfo,  // Uusi
      scrapeGameInfo,
      authStore,
      loadingAnalysis,
      analysisResult,
      analysisError,
      analysisStatus,
      runAIAnalysis,
      saveAIAnalysis,
      deleteAIFiles
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
  font-size: 2.5rem !important;
  font-weight: bold;
  padding: 2px 14px !important;
  min-width: 80px;
  min-height: 60px;
}

.game-date {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: bold;
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

.analysis-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.6;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
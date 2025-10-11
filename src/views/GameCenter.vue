<template>
  <div class="game-center-wrapper">
    <v-container fluid class="pa-2 pa-sm-4">
      <!-- Game Header -->
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="game-header-left">
            <h3>{{ gameTitle }}</h3>
            <div class="text-center mt-2" v-if="gameInfo?.result">
              <v-chip 
                text-color="white"
                class="result-chip"
                size="large"
              >
                {{ gameInfo.result }}
              </v-chip>
            </div>
          </div>
          <div>
            <v-btn 
              icon 
              @click="goBack"
              class="mr-2"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        
        <v-card-subtitle v-if="gameInfo?.gameDate">
          {{ formatDate(gameInfo.gameDate) }}
        </v-card-subtitle>
      </v-card>

      <!-- Tabs -->
      <v-card>
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
            <v-tabs-window-item value="shots"  padding="0">
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
    
    // Get gameId from route params
    const gameId = computed(() => {
      return route.params.gameId
    })
    
    const gameTitle = computed(() => {
      if (gameInfo.value?.name) {
        return gameInfo.value.name
      }
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
        
        // Automaattinen tabin valinta ottelun tilan perusteella
        setDefaultTab()
        
      } catch (error) {
        console.error('Virhe ottelutietojen lataamisessa:', error)
      } finally {
        loading.value = false
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
    
    const goBack = () => {
      router.push('/matches')
    }
    
    const refreshData = () => {
      loadGameInfo()
      // Trigger refresh on child components if needed
      // This could be enhanced by emitting events to child components
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
      setDefaultTab,
      formatDate,
      getResultColor,
      goBack,
      refreshData
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

.v-tabs {
  margin-bottom: 0;
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

.result-chip {
  font-size: 1.25rem !important;
  font-weight: bold;
  padding: 8px 16px !important;
  min-width: 80px;
}

/* Ensure tab content has proper spacing */
.v-tabs-window-item {
  padding-top: 16px;
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
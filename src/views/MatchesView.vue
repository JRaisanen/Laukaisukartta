<template>
  <div class="matches-view">
    <v-container fluid>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>      {{ teamStore.selectedTeam?.name || 'Valitse joukkue' }} - Kausi
      {{ teamStore.selectedTeamSeason?.name || 'Valitse kausi' }}
</span>
          <v-tooltip 
            :text="authStore.isAuthenticated ? 'Lisää uusi ottelu' : 'Kirjaudu sisään lisätäksesi otteluita'"
            location="bottom"
          >
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props"
                color="primary" 
                @click="showAddDialog = true"
                :disabled="!authStore.isAuthenticated"
              >
                <v-icon left>mdi-plus</v-icon>
                Lisää ottelu
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-title>
        
        <v-data-table
          :headers="headers"
          :items="games"
          :loading="loading"
          density="compact"
          :hide-default-footer="true"
          :sort-by="[{ key: 'gameDate', order: 'desc' }]"
          class="elevation-1"
        >
          <template v-slot:item.gameDate="{ item }">
            {{ formatDate(item.gameDate) }}
          </template>
          
          <template v-slot:item.result="{ item }">
            <v-chip
              text-color="white"
              small
            >
              {{ item.result || 'Tulossa' }}
            </v-chip>
          </template>
          
          <template v-slot:item.actions="{ item }">
            <v-tooltip 
              v-if="authStore.isAuthenticated"
              text="Muokkaa ottelua"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  @click="editGame(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            
            <v-tooltip 
              text="Avaa ottelukeskus"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  @click="openGameCenter(item)"
                  class="ml-2"
                >
                  <v-icon>mdi-view-dashboard</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
          
          <template v-slot:no-data>
            <v-alert
              type="info"
              class="ma-4"
            >
              Ei otteluita löytynyt
            </v-alert>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Edit Game Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Muokkaa ottelua</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedGame.name"
                  label="Ottelun nimi"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedGame.gameDate"
                  label="Päivämäärä"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedGame.result"
                  label="Tulos (esim. 5-3)"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedGame.shortname"
                  label="Lyhyt nimi"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedGame.sbl_matchid"
                  label="Tulospalvelun otteluid"
                ></v-text-field>
                </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="closeEditDialog"
          >
            Peruuta
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveGame"
          >
            Tallenna
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Game Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Lisää uusi ottelu</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newGame.name"
                  label="Ottelun nimi"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newGame.gameDate"
                  label="Päivämäärä"
                  type="date"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newGame.result"
                  label="Tulos (esim. 5-3)"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newGame.shortname"
                  label="Lyhyt nimi"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newGame.sbl_matchid"
                  label="Tulospalvelun otteluid"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="closeAddDialog"
          >
            Peruuta
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="addGame"
          >
            Lisää
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '../stores/teamStore';
import { useAuthStore } from '../stores/authStore';
import config from '../../config';

export default {
  name: 'MatchesView',
  setup() {
    const router = useRouter()
    const teamStore = useTeamStore()
    const authStore = useAuthStore()
    
    const games = ref([])
    const loading = ref(true)
    const editDialog = ref(false)
    const showAddDialog = ref(false)
    const editedGame = ref({})
    const newGame = ref({
      name: '',
      gameDate: '',
      result: '',
      shotname: '',
      sbl_matchid: ''
    })
    
    const headers = [
      {
        title: 'Päivämäärä',
        key: 'gameDate',
        sortable: true,
        width: '100px'
      },
      {
        title: 'Ottelu',
        key: 'name',
        sortable: true,
        width: '300px'
      },
      {
        title: 'Tulos',
        key: 'result',
        sortable: false,
        width: '80px'
      },
      {
        title: 'Toiminnot',
        key: 'actions',
        sortable: false,
        width: '80px'
      }
    ]
    
    const loadGames = async () => {
      loading.value = true
      try {
        const seasonId =  teamStore.selectedTeamSeason?.seasonId         
        const teamId = teamStore.selectedTeam.teamId || authStore.user?.team_id

        if (!teamId) {
          console.error('Joukkue ID puuttuu')
          return
        }
        
        console.log('Ladataan otteluita kaudelle ID:', seasonId, 'ja joukkueelle ID:', teamId)
        //const config = await import('@/config.js')
        const response = await fetch(`${config.apiUrl}/games/season/${seasonId}`);
        //const response = await fetch(`${config.API_BASE_URL}/games?seasonId=${seasonId}&teamId=${teamId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        games.value = data.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate))
        
      } catch (error) {
        console.error('Virhe otteluiden lataamisessa:', error)
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('fi-FI')
    }
    
    const getResultColor = (result) => {
      if (!result) return 'grey'
      
      // Yksinkertainen logiikka: jos ensimmäinen luku on suurempi, se on voitto
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
    
    const editGame = (game) => {
      editedGame.value = { ...game }
      editDialog.value = true
    }
    
    const closeEditDialog = () => {
      editDialog.value = false
      editedGame.value = {}
    }
    
    const saveGame = async () => {
      try {
        const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8';
        const gameId = editedGame.value.gameId || editedGame.value.id;
        
        console.log('Tallennetaan ottelua ID:', gameId, editedGame.value)
        
        // Prepare the data to send - only send the fields that should be updated
        const updateData = {
          name: editedGame.value.name,
          gameDate: editedGame.value.gameDate,
          result: editedGame.value.result,
          shortname: editedGame.value.shortname || '',
          sbl_matchid: editedGame.value.sbl_matchid || ''
        };
        
        console.log('Lähetetään data:', updateData);
        
        const response = await fetch(`${config.apiUrl}/games/${gameId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Virhe tallentamisessa:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Päivitä paikallinen lista
        const index = games.value.findIndex(g => (g.gameId || g.id) === gameId);
        if (index !== -1) {
          games.value[index] = { ...games.value[index], ...updateData };
        }
        
        closeEditDialog()
        console.log('Ottelu tallennettu onnistuneesti');
        
      } catch (error) {
        console.error('Virhe ottelun tallentamisessa:', error)
        alert(`Virhe tallentamisessa: ${error.message}`);
      }
    }
    
    const closeAddDialog = () => {
      showAddDialog.value = false
      newGame.value = {
        name: '',
        gameDate: '',
        result: '',
        shortname: '',
        sbl_matchid: ''
      }
    }
    
    const addGame = async () => {
      try {
        //const config = await import('@/config.js')
        const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8';
        
        if (!teamStore.selectedTeam?.teamId || !teamStore.selectedTeamSeason?.seasonId) {
          alert('Valitse ensin joukkue ja kausi');
          return;
        }
        
        const gameData = {
          ...newGame.value,
          teamId: teamStore.selectedTeam.teamId,
          seasonId: teamStore.selectedTeamSeason.seasonId
        }
        
        console.log('Lisätään uusi ottelu:', gameData);
        console.log('Valittu joukkue:', teamStore.selectedTeam);
        console.log('Valittu kausi:', teamStore.selectedTeamSeason);
        
        const response = await fetch(`${config.apiUrl}/games`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(gameData)
        })
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Virhe ottelun lisäämisessä:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const newGameData = await response.json()
        console.log('Uusi ottelu lisätty:', newGameData);
        
        games.value.push(newGameData)
        games.value.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate))
        closeAddDialog()
        
        // Näytä onnistumisviesti
        console.log('Ottelu lisätty onnistuneesti!');
        
      } catch (error) {
        console.error('Virhe ottelun lisäämisessä:', error)
        alert(`Virhe ottelun lisäämisessä: ${error.message}`);
      }
    }
    
    const viewStats = (game) => {
      const gameId = game.gameId || game.id;
      router.push(`/stats/game/${gameId}`)
    }
    
    const openGameCenter = (game) => {
      const gameId = game.gameId || game.id;
      router.push(`/gamecenter/${gameId}`)
    }
    
    onMounted(() => {
      loadGames()
    })
    
    return {
      games,
      authStore,
      teamStore,
      loading,
      headers,
      editDialog,
      showAddDialog,
      editedGame,
      newGame,
      loadGames,
      formatDate,
      getResultColor,
      editGame,
      closeEditDialog,
      saveGame,
      closeAddDialog,
      addGame,
      viewStats,
      openGameCenter
    }
  }
}
</script>

<style scoped>
.matches-view {
  padding: 16px;
}

.v-data-table {
  background-color: white;
}

.v-chip {
  font-weight: bold;
}
</style>
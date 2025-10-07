<template>
    <div class="games-container">
      <h2>Otteluiden ylläpito</h2>
      <v-list>
        <v-list-item
          v-for="game in games"
          :key="game.gameId"
          class="game-item"
        >
          <v-list-item-content>
            <v-list-item-title>{{ game.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ game.date }}</v-list-item-subtitle>
          </v-list-item-content>
           <v-btn 
            color="primary" 
            @click="editGame(game.gameId)"
            prepend-icon="mdi-pencil"
            variant="outlined"
            size="small"
          >
            Editoi
          </v-btn>
          <v-btn 
            color="error" 
            @click="deleteGame(game.gameId)"
            prepend-icon="mdi-delete"
            variant="outlined"
            size="small"
          >
            Poista
          </v-btn>
        </v-list-item>
      </v-list>
      <p v-if="games.length === 0">Ei otteluita valitulle joukkueelle ja kaudelle.</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router'; // Lisää tämä
  import { useTeamStore } from '../stores/teamStore';
  import { useAuthStore } from '../stores/authStore';
  import config from '../../config';
  
  const teamStore = useTeamStore();
  const authStore = useAuthStore();
  const router = useRouter();
  
  const games = ref([]);
  
  // Lisää editGame-metodi
  const editGame = (gameId) => {
    console.log(`Editoidaan ottelu ID: ${gameId}`);
    router.push(`/kliikki/${gameId}`);
  };

  const fetchGames = async () => {
    // Tarkista, että kausi on valittu
    if (!teamStore.selectedTeamSeason) {
        console.warn('Kautta ei ole valittu.');
        games.value = []; // Tyhjennä lista, jos kautta ei ole valittu
        return;
    }

    try {
        // Käytä backendin valmista reittiä kauden otteluiden hakemiseen
        const response = await fetch(
        `${config.apiUrl}/games/season/${teamStore.selectedTeamSeason.seasonId}`,
        {
            headers: {
            Authorization: `Bearer ${authStore.token}`,
            },
        }
        );

        if (!response.ok) throw new Error('Virhe haettaessa otteluita');
        games.value = await response.json(); // Päivitä ottelulista
    } catch (error) {
        console.error('Virhe haettaessa otteluita:', error);
        games.value = []; // Tyhjennä lista virheen sattuessa
    }
};

  const deleteGame = async (gameId) => {
    if (!confirm('Haluatko varmasti poistaa tämän ottelun?')) return;
  
    try {
      console.log(`Poistetaan ottelu ID: ${gameId}`);
      const response = await fetch(`${config.apiUrl}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      if (!response.ok) throw new Error('Virhe poistettaessa ottelua');
      games.value = games.value.filter((game) => game.id !== gameId);
      console.log('Ottelu ja siihen liittyvät tapahtumat poistettu.');
      fetchGames(); // Päivitä ottelulista
    } catch (error) {
      console.error('Virhe poistettaessa ottelua:', error);
    }
  };
  
  console.log('Avattu');
  onMounted(fetchGames);
  </script>
  
  <style scoped>
  .games-container {
    padding: 16px;
  }
  
  .game-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .v-btn {
    margin-left: 16px;
  }
  </style>
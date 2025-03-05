<template>
  <div class="container">
    <v-divider :thickness="10"></v-divider>

    <v-sheet class="responsive-sheet mx-auto">
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
            @click="loadEvents(game.gameId)"
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
  
    <div v-if="events.length > 0" class="stats-table">
      <h4>Pelaajatilastot</h4>
      <v-data-table         
        :headers="headers"
        :hide-default-header="false"
        :items="sortedPlayerStats"
        :no-data-text="no_results_text"
        :items-per-page="-1"
        :hide-default-footer="true"
        density="compact"
        class="responsive-table">
        <template v-slot:body.append>
            <tr class="summary-row2">
              <td class="summit">Kaikki yhteensä</td>
              <td>{{ totalStats.maali }}</td>
              <td>{{ totalStats.torjunta }}</td>
              <td>{{ totalStats.blokki }}</td>
              <td>{{ totalStats.ohi }}</td>
              <td>{{ totalStats.totaali }}</td>
              <td>{{ totalStats.laukaisuprosentti }}</td>
              <td>{{ totalStats.blokatut }}</td>
            </tr>
        </template>

      </v-data-table>
      <v-divider :thickness="10"></v-divider>

      <h4>Maalivahtitilastot</h4>
      <v-data-table         
          :headers="goalieHeaders"
          :hide-default-header="false"
          :items="sortedGoalieStats"
          :no-data-text="no_results_text"
          :items-per-page="-1"
          density="compact"
          class="responsive-table"
          :hide-default-footer="true">
          <template v-slot:body.append>
              <tr class="summary-row2">
                <td class="summit">Kaikki yhteensä</td>
                <td>{{ totalGoalieStats.torjunta }}</td>
                <td>{{ totalGoalieStats.maali }}</td>
                <td>{{ totalGoalieStats.totalShots }}</td>
                <td>{{ totalGoalieStats.torjuntaprosentti }}</td>
              </tr>
          </template>

        </v-data-table>
      </div>
  </div>
</template>
  
  <script>
  import { useTeamStore } from '../stores/teamStore';
  import config from '../../config.js'; // Tuo konfiguraatiotiedosto
  
  export default {
    data() {
      return {
        games: [],
        events: [],
        teamNames: '',
        selectedPlayer: '',
        selectedGameId: null,
        sortKey: 'totaali',
        sortOrder: 'desc',
        goalieSortKey: 'totaali',
        goalieSortOrder: 'asc',
        fields: [
        { key: 'player', label: 'Pelaaja', sortable: false },
        { key: 'maali', label: 'Maali', sortable: true },
        { key: 'torjunta', label: 'Torjunta', sortable: true },
        { key: 'blokki', label: 'Blokki', sortable: true },
        { key: 'ohi', label: 'Ohi', sortable: true },
        { key: 'totaali', label: 'Yhteensä', sortable: true },
        { key: 'laukaisuprosentti', label: 'L-%', sortable: true },
        { key: 'blokatut', label: 'Blokatut', sortable: true },
        ],
        headers: [
          { title: 'Pelaaja', value: 'player', sortable: false },
          { title: 'Maali', value: 'maali', sortable: true},
          { title: 'Torjunta', value: 'torjunta', sortable: true },
          { title: 'Blokki', value: 'blokki', sortable: true },
          { title: 'Ohi', value: 'ohi', sortable: true },
          { title: 'Yhteensä', value: 'totaali', sortable: true },
          { title: 'L-%', value: 'laukaisuprosentti', sortable: true },
          { title: 'Blokit', value: 'blokatut', sortable: true },
        ],
        goalieHeaders: [
          { title: 'Maalivahti', value: 'player', width: '20%', sortable: false },
          { title: 'Torjunta', value: 'torjunta', width: '20%', sortable: true },
          { title: 'Maali', value: 'maali', width: '20%', sortable: true },
          { title: 'Laukauksia yht', value: 'totalShots', width: '20%', sortable: true },
          { title: 'Torjunta%', value: 'torjuntaprosentti', width: '20%', sortable: true },
        ],
        no_results_text: "Ei valittua ottelua"
      };
    },
    computed: {
      uniquePlayers() {
        const players = this.events.map(event => event.playerName);
        return Array.from(new Set(players));
      },
      totalStats() {
      const total = {
        maali: 0,
        torjunta: 0,
        blokki: 0,
        ohi: 0,
        totaali: 0,
        laukaisuprosentti: 0,
        blokatut: 0,
      };
      Object.values(this.playerStats).forEach(stats => {
        total.maali += stats.maali;
        total.torjunta += stats.torjunta;
        total.blokki += stats.blokki;
        total.ohi += stats.ohi;
        total.totaali += stats.maali + stats.torjunta + stats.blokki + stats.ohi;
        total.blokatut += stats.blokatut;
      });
      total.laukaisuprosentti = total.totaali > 0 ? ((total.maali / total.totaali) * 100).toFixed(2) : 0;
      return total;
    },
      filteredEvents() {
        if (this.selectedPlayer) {
          return this.events.filter(event => event.playerName === this.selectedPlayer);
        }
        return this.events;
      },
      playerStats() {
        const stats = {};
        this.events.forEach(event => {
          const playerName = event.playerName;
          if (!stats[playerName] && playerName !== 'Vastustaja') {
              stats[playerName] = { maali: 0, torjunta: 0, blokki: 0, ohi: 0, blokatut: 0 };
          }
          if (event.blockerId && event.action === 'blokki') {
            if (!stats[event.blockerName]) {
              stats[event.blockerName] = { maali: 0, torjunta: 0, blokki: 0, ohi: 0, blokatut: 0 };
            }
            stats[event.blockerName]['blokatut']++;
          }

          if (playerName !== 'Vastustaja')
          {
            stats[playerName][event.action]++;
          }
        });
        return stats;
    },
    sortedPlayerStats() {
        const statsArray = Object.entries(this.playerStats).map(([player, stats]) => {
            const totaali = stats.maali + stats.torjunta + stats.blokki + stats.ohi;
            const laukaisuprosentti = totaali > 0 ? (stats.maali / totaali *100).toFixed(1) : '0.00';
            return {
                player,
                ...stats,
                totaali,
                laukaisuprosentti,
            };
        });
  
        return statsArray.sort((a, b) => {
            let result = 0;
            if (this.sortKey === 'player') {
                result = a.player.localeCompare(b.player);
            } else {
                result = a[this.sortKey] - b[this.sortKey];
            }
            return this.sortOrder === 'asc' ? result : -result;
        });
      },
      totalGoalieStats() {
      const total = {
        maali: 0,
        torjunta: 0,
        totalShots: 0,
        torjuntaprosentti: 0,
      };
      Object.values(this.goalieStats).forEach(stats => {
        total.maali += stats.maali;
        total.torjunta += stats.torjunta;
        total.totalShots += stats.totalShots;
      });
      total.torjuntaprosentti = total.totalShots > 0 ? ((total.torjunta / total.totalShots) * 100).toFixed(2) : '0.00';
      return total;
    },
    sortedGoalieStats() {
      const statsArray = Object.entries(this.goalieStats).map(([player, stats]) => ({
        player,
        ...stats,
      }));

      return statsArray.sort((a, b) => {
        let result = 0;
        if (this.goalieSortKey === 'player') {
          result = a.player.localeCompare(b.player);
        } else {
          result = a[this.goalieSortKey] - b[this.goalieSortKey];
        }
        return this.goalieSortOrder === 'asc' ? result : -result;
      });
    },
    goalieStats() {
      const stats = {};
      this.events.forEach(event => {
        if (event.goalieId) {
          const goalieName = event.goalieName;
          if (!stats[goalieName]) {
            stats[goalieName] = { player: goalieName, maali: 0, torjunta: 0, torjuntaprosentti: 0 };
          }
          if (event.action === 'maali') {
            stats[goalieName].maali += 1;
          } else if (event.action === 'torjunta') {
            stats[goalieName].torjunta += 1;
          }
        }
      });
      Object.values(stats).forEach(stat => {
        const totalShots = stat.maali + stat.torjunta;
        stat.totalShots = totalShots;
        stat.torjuntaprosentti = totalShots > 0 ? ((stat.torjunta / totalShots) * 100).toFixed(2) : '0.00';
      });
      return stats;
    },
    },
    methods: {
      loadGames(seasonId) {
        console.log('Loading games...' + seasonId);
        fetch(`${config.apiUrl}/games/season/${seasonId}`)
          .then(response => response.json())
          .then(data => {
            this.games = data || [];
            // Lisää "Kaikki ottelut" -vaihtoehto
            this.games.push({ gameId: 0, shortname: 'Kaikki ottelut' });
            console.log('Games loaded: ' + this.games);
          })
          .catch(error => {
            console.error('Error loading games:', error);
            alert('Virhe ladattaessa otteluita.');
          });
      },
      loadEvents(gameId) {
        this.selectedGameId = gameId;
        console.log('Loading events...' + gameId);
        if (gameId === 0) {
            const teamStore = useTeamStore();
            const seasonId = teamStore.selectedTeamSeason.seasonId;

            fetch(`${config.apiUrl}/season/${seasonId}/gameevents/`)
              .then(response => response.json())
              .then(data => {
                this.events = data || [];
            })
            .catch(error => {
              console.error('Error loading events:', error);
              alert('Virhe ladattaessa tapahtumia.');
          });
        } 
        else {
            fetch(`${config.apiUrl}/gameevents/${gameId}`)
              .then(response => response.json())
              .then(data => {
                this.events = data || [];
              })
              .catch(error => {
                console.error('Error loading events:', error);
                alert('Virhe ladattaessa tapahtumia.');
              });
          }
          this.teamNames = this.games.find(game => game.gameId === gameId).name;
      },
      /*
        loadGames() {
            console.log('Loading games... beissi: '|| import.meta.env.VITE_BASE_URL);            
            fetch('/Laukaisukartta/team/games/index.json')
                .then(response => response.json())
                .then(data => {
                    this.games = data.games || [];
                    })
                .catch(error => {
                console.error('Error loading games:', error);
                alert('Virhe ladattaessa otteluita.');
            });
        },
    loadEvents(gameId) {
      console.log(`Loading events for game ID: ${gameId}`);
      this.selectedGameId = gameId;
      fetch(`/Laukaisukartta/team/games/${gameId}.json`)
        .then(response => response.json())
        .then(data => {
          console.log('Events loaded:', data);
          this.teamNames = data.teamNames || '';
          this.events = data.events || [];
        })
        .catch(error => {
          console.error('Error loading events:', error);
          alert('Virhe ladattaessa tiedostoa. Varmista, että tiedosto on oikeassa muodossa.');
        });
    },*/
    countEvents(action) {
      const count = this.filteredEvents.filter(event => event.action === action).length;
      console.log(`Count for action "${action}": ${count}`);
      return count;
    },
    allEvents() {
      const count = this.filteredEvents.length;
      console.log('Total events:', count);
      return count;
    },
    sortBy(key) {
      console.log(`Sorting by key: ${key}`);
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'desc';
      }
    },
    sortGoaliesBy(key) {
      if (this.goalieSortKey === key) {
        this.goalieSortOrder = this.goalieSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.goalieSortKey = key;
        this.goalieSortOrder = 'asc';
      }
    },
    scrollLeft() {
        const container = this.$el.querySelector('.games-list');
        container.scrollBy({ left: -200, behavior: 'smooth' });
    },
    scrollRight() {
        const container = this.$el.querySelector('.games-list');
        container.scrollBy({ left: 200, behavior: 'smooth' });
    },
},
    created() {
      const teamStore = useTeamStore();
      if (teamStore.selectedTeamSeason) {
        console.log('Opening page statsview...' + teamStore.selectedTeamSeason.seasonId);
        this.loadGames(teamStore.selectedTeamSeason.seasonId);
      }
  },
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
  justify-content: center;
}

.selected-btn {
    background-color: #1976d2;
    color: white;
    margin-top: 9px;
  }

.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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

.legend ul {
     list-style-type: none;
     padding: 0;
   }

   .legend li {
     display: inline-block;
     margin-right: 10px;
     padding: 5px 10px;
     border-radius: 5px;
     color: white;
   }

.legend .maali {
  background-color: green;
}

.legend .torjunta {
  background-color: cyan;
}

.legend .blokki {
  background-color: yellow;
  color: black; /* Keltainen tausta, joten musta teksti */
}

.legend .ohi {
  background-color: red;
}

.legend .kaikki {
  background-color: beige;
  color: black; /* Beige tausta, joten musta teksti */
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
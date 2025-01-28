<template>
    <div class="container">
      <h1>Valitse ottelu:</h1>
      <div class="games-list-container">
        <button class="scroll-button left" @click="scrollLeft">‹</button>
        <div class="games-list">
            <button
            v-for="game in games"
            :key="game.id"
            @click="loadEvents(game.id)"
            :class="{ active: selectedGameId === game.id }"
            >
            {{ game.name }}
            </button>
        </div>
        <button class="scroll-button right" @click="scrollRight">›</button>
      </div>  
      <div v-if="teamNames" class="team-names-display">
        <h2>{{ teamNames }}</h2>
      </div>
  
      <div v-if="events.length > 0" class="stats-table">
        <h2>Pelaajatilastot</h2>
        <table>
          <thead>
            <tr>
              <th @click="sortBy('player')">Pelaaja</th>
              <th @click="sortBy('maali')">Maali</th>
              <th @click="sortBy('torjunta')">Torjunta</th>
              <th @click="sortBy('blokki')">Blokki</th>
              <th @click="sortBy('ohi')">Ohi</th>
              <th @click="sortBy('totaali')">Yhteensä</th>
              <th @click="sortBy('laukaisuprosentti')">Laukaisu%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stats, player) in sortedPlayerStats" :key="player">
              <td>{{ stats.player }}</td>
              <td>{{ stats.maali }}</td>
              <td>{{ stats.torjunta }}</td>
              <td>{{ stats.blokki }}</td>
              <td>{{ stats.ohi }}</td>
              <td>{{ stats.totaali }}</td>
              <td>{{ stats.laukaisuprosentti }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legend">
        <ul>
          <li class="maali">Maali: {{ countEvents('maali') }}</li>
          <li class="torjunta">Torjunta: {{ countEvents('torjunta') }}</li>
          <li class="blokki">Blokki: {{ countEvents('blokki') }}</li>
          <li class="ohi">Ohi: {{ countEvents('ohi') }}</li>
          <li class="kaikki">Yhteensä: {{ allEvents() }}</li>
        </ul>
      </div>

    </div>
  </template>
  
  <script>
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
      };
    },
    computed: {
      uniquePlayers() {
        const players = this.events.map(event => event.player.name);
        return Array.from(new Set(players));
      },
      filteredEvents() {
        if (this.selectedPlayer) {
          return this.events.filter(event => event.player.name === this.selectedPlayer);
        }
        return this.events;
      },
      playerStats() {
        const stats = {};
        this.events.forEach(event => {
        const playerName = event.player.name;
        if (!stats[playerName]) {
            stats[playerName] = { maali: 0, torjunta: 0, blokki: 0, ohi: 0 };
        }
        stats[playerName][event.action]++;
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
    },
    methods: {
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
    },
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
        console.log('Component created, loading games...');
        this.loadGames();
  },
};
</script>

<style scoped>
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
/*
.legend {
  margin-top: 10px; 
}

.legend ul {
  list-style-type: none;
  padding: 0;
}
*/

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
  background-color: blue;
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

.stats-table {
  margin-top: 10px; /* Vähennä marginaalia yläpuolella */
  width: 100%;
  overflow-x: auto;
}

.stats-table table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th, .stats-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.stats-table th {
  /*background-color: #f2f2f2;*/
  font-weight: bold;
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

  .stats-table th, .stats-table td {
    padding: 6px;
    font-size: 0.8em;
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

  .stats-table th, .stats-table td {
    padding: 4px;
    font-size: 0.7em;
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
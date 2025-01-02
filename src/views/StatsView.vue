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
        <h3>{{ teamNames }}</h3>
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
            console.log('Loading games...');
            fetch('/team/games/index.json')
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
      fetch(`/team/games/${gameId}.json`)
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

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
}

.games-list-container {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.games-list {
  display: flex;
  overflow: hidden;
  margin-bottom: 20px;
  margin-left: 20px;
  margin-right: 20px;
  flex-grow: 1;
  scrollbar-width: none; /* Piilota vierityspalkki Firefoxissa */
}

.games-list::-webkit-scrollbar {
  display: none; /* Piilota vierityspalkki WebKit-pohjaisissa selaimissa */
}

.games-list button {
  margin-right: 10px;
  padding: 15px;
  border: none;
  background-color: #f0f0f0;
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
  color: Black;
  border: none;
  font-size: 2.5em;
  padding: 0px;
  cursor: pointer;
  position: absolute;
  top: 30%;
  transform: translateY(-50%);
  z-index: 1;
}

.scroll-button.left {
  left: 0;
}

.scroll-button.right {
  right: 0;
}

.image-containeri {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 342px; /* Kiinteä maksimi leveys */
  height: auto; /* Automaattinen korkeus */
}

.image-containeri img {
  width: 100%; /* Skaalaa kuva täyttämään kontti */
  height: auto; /* Automaattinen korkeus */
  object-fit: cover; /* Skaalaa kuva täyttämään kontti */
}

.number {
  position: absolute;
  background-color: transparent; 
  padding: 2px 1px;
  border: none;
  border-radius: 1px;
  transform: translate(-50%, -50%);
}

.marker {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.marker.maali {
  background-color: green;
}

.marker.torjunta {
  background-color: blue;
}

.marker.blokki {
  background-color: yellow;
}

.marker.ohi {
  background-color: red;
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

.team-names-display {
  margin-top: 20px;
}

.team-names-display h3 {
  font-size: 1.5em;
  color: #2c3e50;
}

.filter-container {
  margin-top: 20px;
}

.stats-table {
  margin-top: 20px;
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
  background-color: #f2f2f2;
  font-weight: bold;
}

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
  .container {
    padding: 10px;
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
  .games-list {
    flex-direction: column;
  }

  .games-list button {
    margin-bottom: 10px;
    width: 100%;
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
</style>
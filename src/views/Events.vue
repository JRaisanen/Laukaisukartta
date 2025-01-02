<template>
    <div class="container">
      <h1>Tallennetut tapahtumat</h1>
      <input type="file" @change="loadEvents" />
      <div class="team-names">
        <h2>Joukkueet</h2>
      </div>
      <div v-if="teamNames" class="team-names-display">
        <h3>{{ teamNames }}</h3>
      </div>

      <div v-if="events.length > 0" class="filter-container">
      <label for="player-select">Valitse pelaaja:</label>
      <select id="player-select" v-model="selectedPlayer">
        <option value="">Kaikki pelaajat</option>
        <option v-for="player in uniquePlayers" :key="player" :value="player">
          {{ player }}
        </option>
      </select>
    </div>

      <div v-if="filteredEvents.length > 0" class="image-containeri">
        <img src="/kuva.jpg" alt="Field" />
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          :class="['marker', event.action]"
          :style="{ top: event.y + '%', left: event.x + '%' }"
          :title="event.player.number + ' ' + event.player.name + ' ' + event.action"
        ></div>
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="number"
          :style="{ top: event.y + '%', left: event.x + 5 + '%' }"
          :title="event.player.number + ' ' + event.player.name + ' ' + event.action"
        >
          {{ event.player.number }}
        </div>

      </div>
      <div class="legend">
      <h2>Selitteet</h2>
      <ul>
        <li
          class="maali"
          @click="toggleActionVisibility('maali')"
          :class="{ active: visibleActions.includes('maali') }"
        >
          Maali: {{ countEvents('maali') }}
        </li>
        <li
          class="torjunta"
          @click="toggleActionVisibility('torjunta')"
          :class="{ active: visibleActions.includes('torjunta') }"
        >
          Torjunta: {{ countEvents('torjunta') }}
        </li>
        <li
          class="blokki"
          @click="toggleActionVisibility('blokki')"
          :class="{ active: visibleActions.includes('blokki') }"
        >
          Blokki: {{ countEvents('blokki') }}
        </li>
        <li
          class="ohi"
          @click="toggleActionVisibility('ohi')"
          :class="{ active: visibleActions.includes('ohi') }"
        >
          Ohi: {{ countEvents('ohi') }}
        </li>
        <li class="kaikki">Yhteensä: {{ allEvents() }}</li>
      </ul>
    </div>
    </div>
  </template>
  
  <script>
export default {
  data() {
    return {
      events: [],
      teamNames: '',
      selectedPlayer: '',
      sortKey: 'player',
      sortOrder: 'asc',
      visibleActions: ['maali', 'torjunta', 'blokki', 'ohi'],
    };
  },
  computed: {
    uniquePlayers() {
      const players = this.events.map(event => event.player.name);
      return Array.from(new Set(players));
    },
    filteredEvents() {
      return this.events.filter(event => {
        return (
          (!this.selectedPlayer || event.player.name === this.selectedPlayer) &&
          this.visibleActions.includes(event.action)
        );
      });
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
      const statsArray = Object.entries(this.playerStats).map(([player, stats]) => ({
        player,
        ...stats,
      }));
      return statsArray.sort((a, b) => {
        if (this.sortOrder === 'asc') {
          return a[this.sortKey] > b[this.sortKey] ? 1 : -1;
        } else {
          return a[this.sortKey] < b[this.sortKey] ? 1 : -1;
        }
      });
    },
  },
  methods: {
    loadEvents(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            this.teamNames = data.teamNames || '';
            this.events = data.events || [];
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Virhe ladattaessa tiedostoa. Varmista, että tiedosto on oikeassa muodossa.');
          }
        };
        reader.readAsText(file);
      }
    },
    countEvents(action) {
      return this.filteredEvents.filter(event => event.action === action).length;
    },
    allEvents() {
      return this.filteredEvents.length;
    },
    toggleActionVisibility(action) {
      const index = this.visibleActions.indexOf(action);
      if (index > -1) {
        this.visibleActions.splice(index, 1);
      } else {
        this.visibleActions.push(action);
      }
    },
    sortTable(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
  },
};
</script>


<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.image-containeri {
  position: relative;
  display: inline-block;
  width: 342px; /* Kiinteä leveys */
  height: 574px; /* Kiinteä korkeus */
}

.image-container img {
  width: 342px; /* Kiinteä leveys */
  height: 574px; /* Kiinteä korkeus */
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
  cursor: pointer;
}

.legend li.active {
  font-weight: bold;
  text-decoration: underline;
}

.legend .maali {
  background-color: green;
}

.legend .torjunta {
  background-color: blue;
}

.legend .blokki {
  background-color: yellow;
  color: black;
}

.legend .ohi {
  background-color: red;
}
.legend .kaikki {
  background-color: beige;
  color: black
}
.team-names-display {
  margin-top: 20px;
}
.team-names-display h3 {
  font-size: 24px;
  color: #2c3e50;
}
  </style>
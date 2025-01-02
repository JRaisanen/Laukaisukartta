<template>
    <div class="container">
      <h1>Tallennetut tapahtumat</h1>
      <input type="file" @change="loadEvents" />
      <div v-if="teamNames" class="team-names-display">
        <h3>{{ teamNames }}</h3>
      </div>
  
      <div class="legend">
        <ul>
          <li class="maali">Maali: {{ countEvents('maali') }}</li>
          <li class="torjunta">Torjunta: {{ countEvents('torjunta') }}</li>
          <li class="blokki">Blokki: {{ countEvents('blokki') }}</li>
          <li class="ohi">Ohi: {{ countEvents('ohi') }}</li>
          <li class="kaikki">Yhteensä: {{ allEvents('') }}</li>
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
    </div>    </div>
  </template>
  
  <script>
export default {
  data() {
    return {
      events: [],
      teamNames: '',
      selectedPlayer: '',
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
  sortBy(key) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
  },
}
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
  color: black; /* Keltainen tausta, joten musta teksti */
}

.team-names-display {
  margin-top: 20px;
}

.team-names-display h3 {
  font-size: 24px;
  color: #2c3e50;
}

.filter-container {
  margin-top: 20px;
}

.stats-table {
  margin-top: 20px;
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
</style>
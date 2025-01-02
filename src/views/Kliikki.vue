<template>
  <div class="container">
    <div class="top-section">
    <div class="app">
      <h1>Laukaisukartta</h1>
      <div class="team-names">
      <h2>Joukkueet</h2>
      <input type="text" v-model="teamNames" placeholder="Esim. SaiPa - EräViikingit" />
    </div>
      <div @click="handleClick" class="image-container">
        <img src="/kuva.jpg" alt="Field" />
        <div
        v-for="event in events"
        :key="event.id"
        :class="['marker', event.action]"
        :style="{ top: event.y + '%', left: event.x + '%' }"
        :title="event.player.number + ' ' + event.player.name + ' ' + event.action"
      ></div>

      </div>
    </div>

    <div>
        <h2>Valitse pelaaja ja toimenpide</h2>
        <div class="selection-container">
            <ul class="player-list">
                <li
                v-for="player in players"
                :key="player.id"
                @click="selectPlayer(player)"
                :class="{ selected: selectedPlayer && selectedPlayer.id === player.id }"
                >
                {{ player.number + ' ' + player.name }}
                </li>
            </ul>
            <ul class="action-list">
                <li
                v-for="action in actions"
                :key="action"
                @click="selectAction(action)"
                :class="{ selected: selectedAction === action }"
                :style="getActionStyle(action)"
                >
                {{ action }}
                </li>
            </ul>
        </div>
    </div>
</div>
    <h2>Tapahtumat</h2>
      <ul>
        <li v-for="event in events" :key="event.id">
          {{ event.player.name }} - {{ event.action }} @ ({{ event.x }}%, {{ event.y }}%)
          <button @click="deleteEvent(event.id)">X</button>
        </li>
      </ul>
      <button @click="downloadEvents">Lataa tapahtumat</button>
  </div>

  </template>
  
  <script>
  export default {
    data() {
      return {
        players: [
        { id: 6, name: 'Ronja Hämäläinen', number: 6 },
        { id: 12, name: 'Mathilda Fernandez', number: 12 },
        { id: 13, name: 'Miija Turunen', number: 13 },
        { id: 18, name: 'Sini Luostarinen', number: 18 },
        { id: 19, name: 'Amelia Ukkonen', number: 19 },
        { id: 21, name: 'Emilia Suurnäkki', number: 21 },
        { id: 24, name: 'Jessica Aarrevuo', number: 24 },
        { id: 27, name: 'Ella Räisänen', number: 27 },
        { id: 28, name: 'Netta Viinanen', number: 28 },
        { id: 31, name: 'Silja Ilves', number: 31 },
        { id: 34, name: 'Ella Sorjonen', number: 34 },
        { id: 68, name: 'Sara Ihalainen', number: 68 },
        { id: 80, name: 'Sini Mikkola', number: 80 },
        { id: 95, name: 'Saana Tohka', number: 95 }
      ],
        actions: ['maali', 'torjunta', 'blokki', 'ohi'],
        events: [],
        selectedPoint: null,
        selectedPlayer: null,
        selectedAction: null,
        teamNames: '',
      };
    },
    methods: {
      handleClick(event) {
        const rect = event.target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        this.selectedPoint = { x, y };
      },
       selectPlayer(player) {
       this.selectedPlayer = player;
      },
        selectAction(action) {
        this.selectedAction = action;
        this.saveEvent();
        },
      saveEvent() {
        if (this.selectedPlayer && this.selectedAction) {
          this.events.push({
            id: Date.now(),
            x: this.selectedPoint.x,
            y: this.selectedPoint.y,
            player: this.selectedPlayer,
            action: this.selectedAction,
          });
          this.selectedPoint = null;
          this.selectedPlayer = null;
          this.selectedAction = null;
        } else {
          alert('Valitse pelaaja ja toimenpide');
        }
      },
      deleteEvent(eventId) {
      this.events = this.events.filter(event => event.id !== eventId);
      },
      downloadEvents() {
        const data = JSON.stringify({ teamNames: this.teamNames, events: this.events }, null, 2);
        console.log('Data to be saved:', data); // Debugging log
        const blob = new Blob([data], { type: 'application/json' });        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      getActionStyle(action) {
      switch (action) {
        case 'maali':
          return { backgroundColor: 'green', color: 'white' };
        case 'torjunta':
          return { backgroundColor: 'blue', color: 'white' };
        case 'blokki':
          return { backgroundColor: 'yellow' };
        case 'ohi':
          return { backgroundColor: 'red', color: 'white' };
        default:
          return {};
      }
    }
    
    },
  };
  </script>
  
  <style>

 .container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

 .top-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px; /* Lisää väli ylä- ja alaosan väliin */
}

 .selection-container {
  display: flex;
  gap: 20px;
}

 .image-container {
  position: relative;
  display: inline-block;
  width: 342px; /* Kiinteä leveys */
  height: 574px; /* Kiinteä korkeus */
}
 .image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Skaalaa kuva täyttämään kontti */
}

  .player-list {
  max-width: 200px; /* Voit säätää leveyttä tarpeen mukaan */
}

li {
  padding: 8px;
  background: #f0f0f0;
  margin-bottom: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

li:hover {
  background: #e0e0e0;
}

 .marker {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  pointer-events: none; /* Estää klikkaustapahtumat */
}

.number {
  position: absolute;
  background-color: transparent; 
  padding: 2px 1px;
  border: none;
  border-radius: 1px;
  transform: translate(-50%, -50%);
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

.player-list, .action-list {
  list-style-type: none;
  padding: 0;
}
.player-list {
  width: 200px; /* Voit säätää tätä arvoa tarpeen mukaan */
}
.player-list li, .action-list li {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  margin: 5px 0;
}
.player-list li.selected, .action-list li.selected {
  background-color: #ddd;
}
  </style>
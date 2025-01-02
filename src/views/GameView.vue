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
        games: [],
        events: [],
        teamNames: '',
        selectedPlayer: '',
        selectedGameId: null,
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
         this.selectedGameId = gameId;
         fetch(`/team/games/${gameId}.json`)
           .then(response => response.json())
           .then(data => {
             this.teamNames = data.teamNames || '';
             this.events = data.events || [];
           })
           .catch(error => {
             console.error('Error loading events:', error);
             alert('Virhe ladattaessa tiedostoa. Varmista, että tiedosto on oikeassa muodossa.');
           });
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
        console.log('Opening page...');
       this.loadGames();
     },
   };
   </script>

   <style>
   .container {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
   }

   .games-list {
     display: flex;
     overflow-x: auto;
     margin-bottom: 20px;
   }

   .games-list button {
     margin-right: 10px;
     padding: 10px;
     border: none;
     background-color: #f0f0f0;
     cursor: pointer;
   }

   .games-list button.active {
     background-color: #007bff;
     color: white;
   }

   .image-containeri {
     position: relative;
     display: inline-block;
     width: 342px; /* Kiinteä leveys */
     height: 574px; /* Kiinteä korkeus */
   }

   .image-containeri img {
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
     color: black;
   }

   .team-names-display {
     margin-top: 20px;
   }

   .team-names-display h3 {
     font-size: 24px;
     color: #2c3e50;
   }
   </style>
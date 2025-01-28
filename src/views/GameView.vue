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
/*import axios from 'axios';*/

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
       this.selectedGameId = gameId;
       fetch(`/Laukaisukartta/team/games/${gameId}.json`)
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
      /*
      async fetchGames() {
        try 
        {
          console.log('Fetching games...');
          const response = await axios.get('http://localhost:3000/games');
          this.geimit = response.data;
        } 
        catch (error) 
        {
          console.error('Error fetching games:', error);
        }
      },*/
   },
   created() {
      console.log('Opening page...');
     this.loadGames();
     /*this.fetchGames();*/
   },
 };
 </script>
 
<style>
   .container {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
     padding: 5px;
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
        padding: 0 5px;
        overflow: hidden;
        margin: 0 8px; /* Vähennä marginaalia vasemmalla ja oikealla */
        flex-grow: 1;
        scrollbar-width: none; /* Piilota vierityspalkki Firefoxissa */
    }

    .games-list::-webkit-scrollbar {
        display: none; /* Piilota vierityspalkki WebKit-pohjaisissa selaimissa */
    }

    /* 
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
     */

    .games-list button {
        margin-right: 5px; /* Vähennä marginaalia oikealla */
        padding: 10px; /* Vähennä pehmustetta */
        border: none;
        cursor: pointer;
        flex-shrink: 0;
        white-space: normal; /* Salli tekstin rivittyminen */
        word-wrap: break-word; /* Salli pitkien sanojen katkaisu */
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
     /*color: #2c3e50;*/
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
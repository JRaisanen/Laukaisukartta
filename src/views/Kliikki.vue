<template>
  <div class="container">
    <div class="top-section">
    <div class="app">
      <h2>Laukaisukartan syöttäminen</h2>
      <div class="team-names">
      <h3>Joukkueet</h3>
      <input type="text" v-model="teamNames" placeholder="Esim. SaiPa - EräViikingit" />
      <input type="text" v-model="shortteamNames" placeholder="Esim. SaSu-ErVi" />
    </div>
      <div @click="handleClick" class="image-container">
        <img src="/kuva.png" alt="Field" />
        <div
        v-for="event in events"
        :key="event.id"
        :class="['marker', event.action, event.player.playerId < 100 ? 'circle' : 'square']"
        :style="{ top: event.y + '%', left: event.x + '%' }"
        :title="event.player.number + ' ' + event.player.name + ' ' + event.action"
      ></div>
      <h3>Valitse maalivahti</h3>
      <v-list lines="one" class="player-list">
            <v-list-item 
                v-for="goalie in localGoalies"
                @click="selectGoalie(goalie)"
                density="compact"
                :class="{ selected: selectedGoalie && selectedGoalie.playerId === goalie.playerId,
                  'not-selected': !selectedGoalie || selectedGoalie.playerId !== goalie.playerId
                 }">
                  <v-card class="rounded-card">
                {{ goalie.number + ' ' + goalie.name }}
              </v-card>
            </v-list-item>
          </v-list>
      </div>
    </div>

    <div>
      <h2>Valitse pelaaja ja toimenpide</h2>
      <div class="selection-container">
        <v-list lines="one" class="player-list">
            <v-list-item 
                v-for="player in localPlayers"
                @click="selectPlayer(player)"
                density="compact"
                :class="{
                  selected: selectedPlayer && selectedPlayer.playerId === player.playerId,
                  'not-selected': !selectedPlayer || selectedPlayer.playerId !== player.playerId
                  }"
                  :key="player.id">
                  <v-card class="rounded-card">
                {{ player.number + ' ' + player.name }}
              </v-card>
            </v-list-item>
          </v-list>
          <v-list lines="one" class="action-list">
            <v-list-item 
            v-for="action in actions"
                :key="action"
                @click="selectAction(action)"
                :class="{ selected: selectedAction === action,
                  'not-selected': !selectedAction || selectedAction !== action
                }"
                >
                <v-card class="rounded-card-action" :style="getActionStyle(action)">
                {{ action }}
              </v-card>

            </v-list-item>
          </v-list>
          <v-list v-if="selectedPlayer && selectedPlayer.playerId >= 100 && selectedAction == 'blokki'" class="player-list" lines="one">
            <v-list-item 
                v-for="player in ownPlayers"
                @click="selectBlocker(player)"
                density="compact"
                :class="{ selected: selectedBlocker && selectedBlocker.id === player.playerId,
                  'not-selected': !selectedBlocker || selectedBlocker.id !== player.playerId }"
                :key="player.id">
                <v-card class="rounded-card">
                  {{ player.number + ' ' + player.name }}
                </v-card>
            </v-list-item>
          </v-list>

        </div>

    </div>
</div>
    <h2>Tapahtumat</h2>
      <ul>
        <li v-for="event in reversedEvents" :key="event.eventId">
          {{ event.player.name }} - {{ event.action }} @ ({{ event.x.toFixed(2) }}%, {{ event.y.toFixed(2) }}%)
          <span v-if="event.goalie">: {{ event.goalie.name }}</span>
          <span v-if="event.blocker">: {{ event.blocker.name }}</span>
          <button @click="deleteEvent(event.eventId)">X</button>
        </li>
      </ul>
      <button @click="downloadEvents">Lataa tapahtumat</button>
  </div>

  </template>
  
  <script>
  import { useTeamStore } from '../stores/teamStore';
  import { useAuthStore } from '../stores/authStore';

  export default {
    data() {
      const teamStore = useTeamStore();
      
      teamStore.fetchTeams();
      console.log('Kliikki - Joukkueet:', teamStore.teams);
      console.log('Kliikki - Kaudet:', teamStore.teamSeasons);
      console.log('Kliikki - Kausi' + teamStore.selectedTeamSeason);
      //console.log('Kliikki - Joukkue' + teamId);
  
      return {
      teamStore,
      actions: ['maali', 'torjunta', 'blokki', 'ohi'],
      events: [],
      selectedPoint: null,
      selectedPlayer: null,
      selectedAction: null,
      selectedBlocker: null,
      selectedGoalie: null,
      teamNames: '',
      shortteamNames: '',
      };
    },

    computed: {
      reversedEvents() {
        return this.events.slice().reverse();
      },
      localPlayers() {
        const teamStore = useTeamStore();
        const players = teamStore.players;
        console.log('Pelaajasdfsdfs dfsdf sdf sdft:', players);
        players.push({ playerId: 100, name: 'Vastustaja', number: 100 });
        return players.filter(player => player.active === 1 || player.playerId === 100);
      },
      ownPlayers() {
        const teamStore = useTeamStore();
        return teamStore.players.filter(player => player.playerId !== 100 && player.active === 1);
      },
      localGoalies() {
        const teamStore = useTeamStore();
        const goalies = teamStore.goalies;
        console.log('Mokkesdfsdfs dfsdf sdf sdft:', goalies);
        goalies.push({ playerId: 0, name: 'Ei maalivahtia', number: 0 });
        return goalies.filter(goalie => goalie.active === 1 || goalie.playerId === 0);
      },

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
          if (this.selectedPlayer.playerId >= 100 && (!this.selectedGoalie || this.selectedAction === 'torjunta' && this.selectedGoalie.playerId === 0))
          {

            alert('Valitse maalivahti');
          }
          else
          {
            if (this.selectedPlayer.playerId < 100 || this.selectedPlayer.playerId >= 100 && this.selectedAction !== 'blokki')
            {
              this.saveEvent();
            }
          }
        },
        selectBlocker(player) {
          this.selectedBlocker = player;
          this.saveEvent();
        },
        selectGoalie(goalie) {
          console.log(`Valittu veskari: ${goalie.number}`);
          this.selectedGoalie = goalie;
        },

      saveEvent() {
        if (this.selectedPlayer && this.selectedAction && this.selectedPoint) {
          const event = {
          eventId: Date.now(),
          x: this.selectedPoint.x,
          y: this.selectedPoint.y,
          player: this.selectedPlayer,
          action: this.selectedAction,
          blocker: this.selectedBlocker,
        };
        if (this.selectedPlayer.playerId >= 100 && (this.selectedAction === 'torjunta' || this.selectedAction === 'maali')) {
          event.goalie = this.selectedGoalie;
        }
        this.events.push(event);
        /*
        this.events.push({
            id: Date.now(),
            x: this.selectedPoint.x,
            y: this.selectedPoint.y,
            player: this.selectedPlayer,
            action: this.selectedAction,
            blocker: this.selectedBlocker,
            goalie: this.selectedGoalie
          });
          */
          this.selectedPoint = null;
          this.selectedPlayer = null;
          this.selectedAction = null;
          this.selectedBlocker = null;
        } else {
          alert('Valitse pelaaja ja toimenpide');
        }
      },
      deleteEvent(eventId) {
      this.events = this.events.filter(event => event.eventId !== eventId);
      },
      async downloadEvents() {
        // luodaan ensin ottelu
        const authStore = useAuthStore(); // Hae authStore
        const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8'; // Korvaa tämä omalla API-avaimellasi
        const newGame = {
          name: this.teamNames,
          shortname: this.shortteamNames,
          teamId: this.teamStore.selectedTeam.teamId,
          seasonId: this.teamStore.selectedTeamSeason.seasonId
        };
        let gameId;
        console.log('Adding new game:', newGame);
        try {
          const response = await fetch('http://localhost:3000/games', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',
              'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
            },
            body: JSON.stringify(newGame)
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          gameId = data.gameId;
          console.log('Added new game:', data);
        } catch (error) {
          console.error('Error adding game:', error);
        }

        const eventsToSave = this.events.map(event => ({
        eventId: null,
        xCoordinate: event.x,
        yCoordinate: event.y,
        playerId: event.player.playerId,
        playerName: event.player.name,
        playerNumber: event.player.number,
        action: event.action,
        blockerId: event.blocker ? event.blocker.playerId : null,
        blockerName: event.blocker ? event.blocker.name : null,
        blockerNumber: event.blocker ? event.blocker.number : null,
        goalieId: event.goalie ? event.goalie.playerId : null,
        goalieName: event.goalie ? event.goalie.name : null,
        goalieNumber: event.goalie ? event.goalie.number : null,
        gameId: gameId
      }));

      console.log('Events to be saved:', eventsToSave);
      // Lähetä kaikki eventit backendille
      try {
          const response = await fetch('http://localhost:3000/gameevent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',  // Korvaa omalla API-avaimellasi
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          },
          body: JSON.stringify(eventsToSave)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const responseData = await response.json();
        console.log('Events saved to backend:', responseData);
        } catch (error) {
        console.error('Error saving events to backend:', error);
      }
      },
      getActionStyle(action) {
        switch (action) {
          case 'maali':
            return { backgroundColor: 'lightgreen', color: 'black' };
          case 'torjunta':
            return { backgroundColor: 'darkblue', color: 'white' };
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
  gap: 10px;
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

.goalie-list {
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
  pointer-events: none; /* Estää klikkaustapahtumat */
}

.circle {
  border-radius: 50%;
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
  background-color: lightgreen;
}
.marker.torjunta {
  background-color: darkblue;
}
.marker.blokki {
  background-color: yellow;
}
.marker.ohi {
  background-color: red;
}

.square {
  border-radius: 0%;
}

.player-list, .action-list, .blocker-player-list, .goalie-list {
  list-style-type: none;
  padding: 10;
}
.player-list {
  width: 240px; /* Voit säätää tätä arvoa tarpeen mukaan */
}

.action-list {
  width: 110px; /* Voit säätää tätä arvoa tarpeen mukaan */
}

.blocker-player-list {
  width: 200px; /* Voit säätää tätä arvoa tarpeen mukaan */
}
.player-list li, .action-list li, .blocker-player-list li, .goalie-list li {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  margin: 4px 0;
}
.player-list li.selected, .action-list li.selected, .blocker-player-list li.selected, .goalie-list li.selected {
  background-color: #bbb;
}

.selected {
  background-color: #bbb;
  color: white;
}

.not-selected {
  background-color: whitesmoke;
  color: black;
}


.goalie-list {
  margin-top: 20px;
}

.goalie-list li:hover {
  background: #e0e0e0;
}

.rounded-card {
    border-radius: 10px;
    border: black;
    border-style: none;
    height: 30px;
    width: 200px;
    padding-left: 15%;
    padding-right: 5%;
    padding-top: 2px;
}

.rounded-card-action {
  border-radius: 20px;
    height: 30px;
    width: 75px;
    padding-left: 15%;
    padding-right: 5%;

}

  </style>
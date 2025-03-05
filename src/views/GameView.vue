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

    <div v-if="teamNames" class="team-names-display">
      <v-card-title class="text-h7">{{ teamNames }}</v-card-title>
    </div>

    <div v-if="events.length > 0" class="filter-container">
      <v-container class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col>
            <v-checkbox class="checkbox-label" label="Omat" v-model="showHomeTeam"></v-checkbox>
          </v-col>
          <v-col>
              <v-checkbox class="checkbox-label" label="Vastustaja" v-model="showOpponentTeam"></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox class="checkbox-label" label="Numerot" v-model="showNumbers"></v-checkbox>
          </v-col>
          <v-col>
            <v-select
              v-model="selectedPlayer"
              :items="allPlayers"
              label="Valitse pelaaja"
              item-text="name"
              item-value="id"
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-card>
      <v-tabs
        v-model="tab"
        bg-color="primary"
      >
        <v-tab value="one">Kartta</v-tab>
        <v-tab value="two">Laukaukset</v-tab>
        <v-tab value="three">Maalit</v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="one">
            <div v-if="filteredEvents.length > 0" class="image-containeri">
              <img src="/kuva.png" alt="Field" />
              <div
                v-for="event in filteredEvents"
                :key="event.eventId"
                :class="['marker', event.action, event.playerId < 100 ? 'circle' : 'square']"
                :style="{ top: event.yCoordinate + '%', left: event.xCoordinate + '%' }"
                :title="event.playerNumber + ' ' + event.playerName + ' ' + event.action"
              ></div>
              <div
                v-if="showNumbers"
                v-for="event in filteredEvents"
                :key="event.eventId"
                class="number"
                :style="{ top: event.yCoordinate + '%', left: event.xCoordinate + 5 + '%' }"
                :title="event.blockerId ? event.action + ' '+ event.blockerId + ' ' + event.blockerName : event.playerNumber + ' ' + event.playerName + ' ' + event.action"
              >
                {{ event.playerId === 100 && event.action === 'blokki' ? event.blockerNumber : event.playerId === 100 ? ' ' : event.playerNumber }}
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="two">
            <div class="centered-text">Laukauksia</div>
            <div class="centered-text">Osuus kaikista</div>
            <div v-if="filteredEvents.length > 0" class="image-containeri">
              <img src="/kuva_pohja.png" alt="Field" />
                <svg class="overlay" viewBox="0 0 342 574">
                  <path
                    v-for="area in areas"
                    :key="area.id"
                    :d="area.d"
                    fill="none"
                  />
                  <text
                    v-for="area in areas"
                    :key="area.id + '-label'"
                    :x="getAreaCenter(area.points).x"
                    :y="getAreaCenter(area.points).y < 287 ? getAreaCenter(area.points).y - 10 : getAreaCenter(area.points).y + 0"
                    fill="black"
                    font-size="10"
                    text-anchor="middle"
                    alignment-baseline="middle"
                  >
                  {{ getEventCount(area) }}
                  </text>
                  <path
                    v-for="area in areas"
                    :key="area.id"
                    :d="area.d"
                    fill="none"
                  />
                  <text
                    v-for="area in areas"
                    :key="area.id + '-label'"
                    :x="getAreaCenter(area.points).x"
                    :y="getAreaCenter(area.points).y < 287 ? getAreaCenter(area.points).y : getAreaCenter(area.points).y + 10"
                    fill="black"
                    font-size="9"
                    text-anchor="middle"
                    alignment-baseline="middle"
                  >
                  {{ getEventPercentage(area) }}
                  </text>
                </svg>              
                </div>  

          </v-tabs-window-item>

          <v-tabs-window-item value="three">
            <div class="centered-text">Laukaisuprosentti</div>
            <div class="centered-text">Osuus maaleista</div>

            <div v-if="filteredEvents.length > 0" class="image-containeri">
              <img src="/kuva_pohja.png" alt="Field" />
              <svg class="overlay" viewBox="0 0 342 574">
                <path
                  v-for="area in areas"
                  :key="area.id"
                  :d="area.d"
                  fill="none"
                />
                <text
                  v-for="area in areas"
                  :key="area.id + '-label'"
                  :x="getAreaCenter(area.points).x"
                  :y="getAreaCenter(area.points).y < 287 ? getAreaCenter(area.points).y - 10 : getAreaCenter(area.points).y + 0"
                  fill="black"
                  font-size="10"
                  text-anchor="middle"
                  alignment-baseline="middle"
                >
                {{ getShootingPercentage(area) }}
                </text>
                <path
                  v-for="area in areas"
                  :key="area.id"
                  :d="area.d"
                  fill="none"
                />
                <text
                  v-for="area in areas"
                  :key="area.id + '-label'"
                  :x="getAreaCenter(area.points).x"
                  :y="getAreaCenter(area.points).y < 287 ? getAreaCenter(area.points).y : getAreaCenter(area.points).y + 10"
                  fill="black"
                  font-size="9"
                  text-anchor="middle"
                  alignment-baseline="middle"
                >
                {{ getPercentageOfGoals(area) }}
                </text>
              </svg>              
            </div>

          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
  </v-card>

    <h5>Selitteet/suodattimet (ympyrä = oma joukkue/neliö = vastustaja):</h5>

    <v-list class="legend horizontal-list">
      <v-list-item
        v-for="action in actions"
        :key="action"
        @click="toggleActionVisibility(action)"
        :class="{ active: visibleActions.includes(action), [action]: true }"
      >
        <v-list-item-title>{{ action.charAt(0).toUpperCase() + action.slice(1) }}: 
          {{ action === 'yhteensä' ? allEvents() : countEvents(action) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider :thickness="10"></v-divider>

    <div class="stats-table">
      <h4>Laukausten yhteenveto</h4>
      <v-data-table
        :headers="teamStatsHeaders"
        :items="teamStats"
        :hide-default-header="false"
        :no-data-text="no_results_text"
        :items-per-page="-1"
        :hide-default-footer="true"
        density="compact">
        </v-data-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useTeamStore } from '../stores/teamStore';
import config from '../../config.js'; // Tuo konfiguraatiotiedosto
import { parseSVG } from 'svg-path-parser';
import pointInPolygon from 'point-in-polygon';

export default {
  data() {
    return {
      games: [],
      events: [],
      areas: [],
      areaEvents: {},
      teamNames: '',
      selectedPlayer: '',
      selectedGameId: null,
      showHomeTeam: true,
      showOpponentTeam: true,
      showNumbers: true,
      sortKey: 'player',
      sortOrder: 'asc',
      tab: null,
      actions: ['maali', 'torjunta', 'blokki', 'ohi', 'yhteensä'],
      visibleActions: ['maali', 'torjunta', 'blokki', 'ohi'],
      no_results_text: "Ei valittua ottelua",
      teamStatsHeaders: [
        { title: 'Joukkue', value: 'team', width: '10%' },
        { title: 'Maali', value: 'maali', width: '10%' },
        { title: 'Torjunta', value: 'torjunta', width: '10%' },
        { title: 'Blokki', value: 'blokki', width: '10%' },
        { title: 'Ohi', value: 'ohi', width: '10%' },
        { title: 'Yhteensä', value: 'total', width: '10%' }
      ]
    };
  },
  computed: {
    uniquePlayers() {
      const players = this.events.filter(event => event.playerId !== 100).map(event => event.playerName);
      return Array.from(new Set(players));
    },
    allPlayers() {
      const plyers = [ 'Kaikki pelaajat' , ...this.uniquePlayers];
      console.log(plyers);
      return plyers;
      /*return [{ id: 0, name: 'Kaikki pelaajat' }, ...this.uniquePlayers];*/
    },
    filteredEvents() {
      let events = this.events;
      console.log(this.selectedPlayer);

      if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
        events = events.filter(event => event.playerName === this.selectedPlayer);
      }

      if (!this.showHomeTeam) {
        events = events.filter(event => event.playerId >= 100);
      }

      if (!this.showOpponentTeam) {
        events = events.filter(event => event.playerId && event.playerId < 100);
      }

      return events.filter(event => this.visibleActions.includes(event.action));
    },
    homeTeamStats() {
      const stats = { maali: 0, torjunta: 0, blokki: 0, ohi: 0, total: 0 };
      this.events.forEach(event => {
        if (event.playerId < 100) {
          stats[event.action]++;
          stats.total++;
        }
      });
      return stats;
    },
    opponentTeamStats() {
      const stats = { maali: 0, torjunta: 0, blokki: 0, ohi: 0, total: 0 };
      this.events.forEach(event => {
        if (event.playerId >= 100) {
          stats[event.action]++;
          stats.total++;
        }
      });
      return stats;
    },
    teamStats() {
      return [
        {
          team: 'Oma joukkue',
          maali: this.homeTeamStats.maali,
          torjunta: this.homeTeamStats.torjunta,
          blokki: this.homeTeamStats.blokki,
          ohi: this.homeTeamStats.ohi,
          total: this.homeTeamStats.total
        },
        {
          team: 'Vastustaja',
          maali: this.opponentTeamStats.maali,
          torjunta: this.opponentTeamStats.torjunta,
          blokki: this.opponentTeamStats.blokki,
          ohi: this.opponentTeamStats.ohi,
          total: this.opponentTeamStats.total
        }
      ];
    }
  },
  watch: {
    showHomeTeam() {
      this.filteredEvents;
    },
    showOpponentTeam() {
      this.filteredEvents;
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
          this.games.push({ gameId: 0, shortname: 'Kaikki ottelut', name: 'Kaikki kauden ottelut' });
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
              this.calculateAreaEvents();
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
              this.calculateAreaEvents();
            })
            .catch(error => {
              console.error('Error loading events:', error);
              alert('Virhe ladattaessa tapahtumia.');
            });
        }
      this.selectedPlayer = 'Kaikki pelaajat';
      this.teamNames = this.games.find(game => game.gameId === gameId).name;
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
      async loadAreas() {
        try {
          const response = await axios.get('/alueet.json');
          const areas = response.data.alueet || [];
          this.areas = areas.map(area => {
            const points = this.calculatePoints(area.d);
            return { ...area, points };
          });
          console.log('Areas loaded:', this.areas);
        } catch (error) {
          console.error('Error loading areas:', error);
          alert('Virhe ladattaessa otteluita.');
        }
      },
      calculatePoints(pathData) {
        const commands = parseSVG(pathData);
        const points = [];
        let currentX = 0;
        let currentY = 0;

        for (const command of commands) {
          switch (command.code) {
            case 'M':
            case 'm':
              currentX = command.code === 'M' ? command.x : currentX + command.x;
              currentY = command.code === 'M' ? command.y : currentY + command.y;
              points.push([currentX, currentY]);
              break;
            case 'L':
            case 'l':
              currentX = command.code === 'L' ? command.x : currentX + command.x;
              currentY = command.code === 'L' ? command.y : currentY + command.y;
              points.push([currentX, currentY]);
              break;
            case 'H':
            case 'h':
              currentX = command.code === 'H' ? command.x : currentX + command.x;
              points.push([currentX, currentY]);
              break;
            case 'V':
            case 'v':
              currentY = command.code === 'V' ? command.y : currentY + command.y;
              points.push([currentX, currentY]);
              break;
            case 'C':
            case 'c':
              points.push([currentX, currentY, command.x1, command.y1, command.x2, command.y2, command.x, command.y]);
              currentX = command.code === 'C' ? command.x : currentX + command.x;
              currentY = command.code === 'C' ? command.y : currentY + command.y;
              break;
            case 'Z':
            case 'z':
              // Sulje polku, jos tarpeen
              break;
            // Lisää tuki muille komennoille tarvittaessa
          }
        }
        return points;
      },
      isPointInPath(x, y, points) {
        return pointInPolygon([x, y], points);
      },
      calculateAreaEvents() {
        const areaEvents = {};
        for (const area of this.areas) {
          areaEvents[area.id] = {
            home: {
              maali: 0,
              torjunta: 0,
              blokki: 0,
              ohi: 0,
              yhteensä: 0
            },
            away: {
              maali: 0,
              torjunta: 0,
              blokki: 0,
              ohi: 0,
              yhteensä: 0
            }
          };
        }
        for (const event of this.events) {
          const x = (event.xCoordinate / 100) * 342;
          const y = (event.yCoordinate / 100) * 574;
          const areaId = this.findAreaContainingPoint(x, y);
          if (areaId) {
            const team = event.playerId < 100 ? 'home' : 'away';
            areaEvents[areaId][team][event.action]++;
            areaEvents[areaId][team].yhteensä++;
          }
        }
        this.areaEvents = areaEvents;
        console.log('Area events:', this.areaEvents);
      },
      findAreaContainingPoint(x, y) {
        for (const area of this.areas) {
          if (this.isPointInPath(x, y, area.points)) {
            return area.id;
          }
        }
        return null;
      },
      getAreaCenter(points) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const point of points) {
          const [x, y] = point;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        return {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2
        };
      },
      getEventCount(area) {
        if (!this.areaEvents[area.id]) {
          return '0';
        }
        const centerY = this.getAreaCenter(area.points).y;
        return centerY < 287 ? this.areaEvents[area.id].home.yhteensä : this.areaEvents[area.id].away.yhteensä;
      },
      getEventPercentage(area) {
        if (!this.areaEvents[area.id]) {
          return '0 %';
        }
        const centerY = this.getAreaCenter(area.points).y;
        return centerY < 287 ? ((this.areaEvents[area.id].home.yhteensä / this.homeTeamStats.total) * 100).toFixed(2) + ' %' : ((this.areaEvents[area.id].away.yhteensä / this.opponentTeamStats.total) * 100).toFixed(2) + ' %';
      },
      getShootingPercentage(area) {
        if (!this.areaEvents[area.id]) {
          return '0 %';
        }
        const centerY = this.getAreaCenter(area.points).y;
        if (centerY < 287) {
          if (this.areaEvents[area.id].home.maali === 0) {
            return '0.00 %';
          }          
        }
        else {
          if (this.areaEvents[area.id].away.maali === 0) {
            return '0.00 %';
          }
        }
        return centerY < 287 ? ((this.areaEvents[area.id].home.maali / this.areaEvents[area.id].home.yhteensä) * 100).toFixed(2) + ' %' : ((this.areaEvents[area.id].away.maali / this.areaEvents[area.id].away.yhteensä) * 100).toFixed(2) + ' %';
      },
      getPercentageOfGoals(area) {
        if (!this.areaEvents[area.id]) {
          return '0 %';
        }
        const centerY = this.getAreaCenter(area.points).y;
        return centerY < 287 ? ((this.areaEvents[area.id].home.maali / this.homeTeamStats.maali) * 100).toFixed(2) + ' %' : ((this.areaEvents[area.id].away.maali / this.opponentTeamStats.maali) * 100).toFixed(2) + ' %';
      }
    },
    created() {
      const teamStore = useTeamStore();
      this.loadAreas();
      console.log('Opening page...' + teamStore.selectedTeamSeason.seasonId);
      this.loadGames(teamStore.selectedTeamSeason.seasonId);

      //this.loadGames();
      /*this.fetchGames();*/
    },
 };
 </script>
 
<style>
   .container {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
     padding: 0px;
     margin: 0px;
   }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Estää SVG:n vaikuttamasta hiiren tapahtumiin */
  }

  .overlay text {
    font-family: Arial, sans-serif;
    font-weight: bold;
  }

  .overlay path {
    stroke: red;
    stroke-width: 0;
    fill: none;
  }

  .responsive-table {
    overflow-x: clip;
  }

  .responsive-sheet {
    max-width: 100%;
    width: 100%;
  }

  .centered-text {
    text-align: center;
    width: 100%;
    margin: 0;
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

   .selected-btn {
    background-color: #1976d2;
    color: white;
    margin-top: 9px;
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
     color: black;
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

   .circle {
     border-radius: 50%;
  }
 
   .square {
     border-radius: 0%;
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

   .legend .v-list-item.active {
    font-weight: bold;
    text-decoration: underline;
  }
   .legend .maali {
     background-color: lightgreen;
     color: black;
   }

   .legend .torjunta {
     background-color: darkblue;
     color: white;
   }

   .legend .blokki {
     background-color: yellow;
     color: black;
   }

   .legend .ohi {
     background-color: red;
     color: white;
   }

   .legend .yhteensä {
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

.summary-table {
  margin-top: 10px;
}

.summary-table table {
  width: 100%;
  border-collapse: collapse;
}

.summary-table th, .summary-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.summary-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 5px; /* Lisää väliä valintaruutujen väliin */
  padding: 0%;
  margin: 0;
}

.horizontal-list {
  display: flex;
  flex-direction: row;
}

.legend .v-list-item {
  cursor: pointer;
}

.legend .v-list-item.active {
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
  .responsive-sheet {
    max-width: 100%;
  }
  .v-btn {
    font-size: 0.7em; /* Pienennä painikkeiden tekstiä kapeammilla näytöillä */
    padding: 2px 4px; /* Pienennä painikkeiden pehmustetta kapeammilla näytöillä */
  }

  .v-toolbar-title {
    font-size: 1em; /* Pienennä työkalupalkin otsikon tekstiä kapeammilla näytöillä */
  }

  .stats-table th, .stats-table td, .stats-table tr {
    font-size: 1.1em; /* Pienennä taulukon tekstiä kapeammilla näytöillä */
    padding: 0px;
    max-width: 80px;
    min-width: 38px;
  }
  .stats-table {
    overflow: visible;
    text-overflow: clip;
    max-width: 100%;
  }

  .v-table > .v-table__wrapper > table > tbody > tr > td,
  .v-table > .v-table__wrapper > table > tbody > tr > th,
  .v-table > .v-table__wrapper > table > thead > tr > td,
  .v-table > .v-table__wrapper > table > thead > tr > th,
  .v-table > .v-table__wrapper > table > tfoot > tr > td,
  .v-table > .v-table__wrapper > table > tfoot > tr > th {
    padding: 0 4px;
  }

  .v-checkbox {
    font-size: 0.9em; /* Pienennä valintaruutujen tekstiä kapeammilla näytöillä */
  }

  .checkbox-label .v-label{
    font-size: 10px; /* Pienennä valintaruutujen tekstiä kapeammilla näytöillä */
  }

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

  .filter-container {
    flex-direction: column;
    gap: 5px; /* Pienennä väliä valintaruutujen väliin */
  }

  .filter-container .v-col {
    width: 100%; /* Aseta valintaruudut täysleveiksi */
  }

  .v-field, .v-list-item-title  {
  font-size: 12px;
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

    .number {
      color: black;
    }
   }

   @media (min-width: 960px) {
  .responsive-sheet {
    max-width: 800px;
  }
}

@media (min-width: 1280px) {
  .responsive-sheet {
    max-width: 1000px;
  }
}

@media (max-width: 430px) {
  .stats-table th, .stats-table td {
    padding: 2px;
    font-size: 0.6em;
  }
}



   </style>
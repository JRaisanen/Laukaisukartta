<template>
  <div class="container">
    <v-divider :thickness="10"></v-divider>

<v-dialog v-model="showGoalDialog" max-width="480" @update:modelValue="val => { if (!val) closeGoalDialog(); }">
  <v-card v-if="selectedGoalEvent">
    <v-card-title class="headline d-flex align-center" style="background: #1976d2; color: white;">
      <v-icon left class="mr-2">mdi-soccer</v-icon>
      Maalin tiedot
    </v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-account</v-icon> Maalintekijä
            <v-list-item-subtitle v-if="selectedGoalEvent.scorerNumber !== 100">#{{ selectedGoalEvent.scorerNumber }} {{ selectedGoalEvent.scorerName }}</v-list-item-subtitle>
            <v-list-item-subtitle v-else>{{ selectedGoalEvent.scorerName }}</v-list-item-subtitle>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6" v-if="selectedGoalEvent.assistName">
          <v-list-item>
            <v-icon color="primary">mdi-account-multiple</v-icon> Syöttäjä
            <v-list-item-subtitle v-if="selectedGoalEvent.assistNumber !== 100">#{{ selectedGoalEvent.assistNumber }} {{ selectedGoalEvent.assistName }}</v-list-item-subtitle>
            <v-list-item-subtitle v-else>{{ selectedGoalEvent.assistName }}</v-list-item-subtitle>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-target-variant</v-icon> Tyyppi
            <v-list-item-subtitle>
              {{
                selectedGoalEvent.scoringtype
                  ? (goalTypeOptions.find(opt => opt.value === selectedGoalEvent.scoringtype)?.title || selectedGoalEvent.scoringtype)
                  : '-'
              }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-lightbulb-outline</v-icon> Taktinen tilanne
            <v-list-item-subtitle>
              {{
                selectedGoalEvent.tacticalsituation
                  ? (tacticalSituationOptions.find(opt => opt.value === selectedGoalEvent.tacticalsituation)?.title || selectedGoalEvent.tacticalsituation)
                  : '-'
              }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-timer-outline</v-icon> Erä
            <v-list-item-subtitle>{{ selectedGoalEvent.period }}</v-list-item-subtitle>
          </v-list-item>
        </v-col>

        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-account-group</v-icon> Kenttätilanne
            <v-list-item-subtitle>{{ goalSituationText }}</v-list-item-subtitle>
          </v-list-item>
        </v-col>        
        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-target</v-icon> Rangaistuslaukaus
            <v-list-item-subtitle>{{ selectedGoalEvent.penaltyshot ? 'Kyllä' : 'Ei' }}</v-list-item-subtitle>
          </v-list-item>
        </v-col>
        <v-col cols="12" sm="6">
          <v-list-item>
            <v-icon color="primary">mdi-alert-circle-outline</v-icon> Oma maali
              <v-list-item-subtitle>{{ selectedGoalEvent.owngoal ? 'Kyllä' : 'Ei' }}</v-list-item-subtitle>
          </v-list-item>
        </v-col>
        <v-col cols="12">
          <v-list-item>
            <v-icon color="primary">mdi-account-multiple-outline</v-icon> Pelaajat kentällä
              <v-list-item-subtitle>
                {{ selectedGoalEvent.ownplayersinfield }}
              </v-list-item-subtitle>
          </v-list-item>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="closeGoalDialog">
        <v-icon left>mdi-close</v-icon>
        Sulje
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

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

    <div class="map-and-eventlist">
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
            <div style="text-align:center; margin-bottom: 4px;">
              <strong>Oma joukkue xG:</strong> {{ filteredHomeXg.toFixed(2) }}
            </div>

            <div class="image-containeri">

              <img src="/kenttasektoreilla.png" alt="Field" />
              <div
                v-for="event in filteredEvents"
                :key="event.eventId"
                :class="[
                  'marker',
                  event.action,
                  event.playerNumber < 100 ? 'circle' : 'square',
                  { 'highlighted-marker': selectedEventId === event.eventId || hoveredEventId === event.eventId }
                ]"
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
            <div style="text-align:center; margin-top: 4px;">
              <strong>Vastustaja xG:</strong> {{ filteredOpponentXg.toFixed(2) }}
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="two">
            <div class="centered-text">Laukauksia sektorista</div>
            <div class="centered-text">Osuus kaikista laukauksista</div>
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
                    font-size="11"
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
                    font-size="10"
                    text-anchor="middle"
                    alignment-baseline="middle"
                  >
                  {{ getEventPercentage(area) }}
                  </text>
                </svg>              
                </div>  

          </v-tabs-window-item>

          <v-tabs-window-item value="three">
            <div class="centered-text">Laukaisuprosentti sektorista</div>
            <div class="centered-text">Osuus tehdyistä maaleista (kpl)</div>

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
                  font-size="11"
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
                  font-size="10"
                  text-anchor="middle"
                  alignment-baseline="middle"
                >
                {{ getPercentageOfGoals(area) }} ({{ getGoalCount(area) }})
                </text>
              </svg>              
            </div>

          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
  </v-card>
    <div v-if="tab === 'one'" class="event-list-side">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0;">Tapahtumat</h3>
        <v-btn
          icon
          size="small"
          @click="showEventList = !showEventList"
          style="margin-left: 8px;"
          :title="showEventList ? 'Piilota tapahtumat' : 'Näytä tapahtumat'"
          variant="text"
        >
          <v-icon>{{ showEventList ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
        </v-btn>
      </div>
      <v-list v-if="showEventList" dense>
        <v-list-item
          v-for="event in filteredEvents"
          :key="event.eventId"
          :value="event.eventId"
          @click="handleEventClick(event)"
          @mouseenter="hoveredEventId = event.eventId"
          @mouseleave="hoveredEventId = null"
          :class="{ 'selected-event': selectedEventId === event.eventId }"
          style="cursor: pointer;"
        >
          <v-list-item-title>
            {{ event.playerName }} – {{ event.action }} -  xG: {{ event.xg.toFixed(2) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

  </div>

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

    <span style="margin-right: 10px;">Erä/kenttätilanne (klikkaa valituksi/pois):</span>
    <div style="margin: 5px 0; display: flex; align-items: center;">
      <v-list style="display: flex; flex-direction: row; padding: 0;" class="period-list">
          <v-list-item
            v-for="period in periodOptions"
            :key="period.value"
            :class="{ selected: selectedPeriod === period.value,
              'not-selected': !selectedPeriod || selectedPeriod !== period.value
              }"
            @click="selectedPeriod = (selectedPeriod === period.value ? null : period.value)"
            style="width: 90px; justify-content: center; cursor: pointer;"
          >
            <v-card :color="selectedPeriod === period.value ? 'primary' : ''" class="rounded-card-period" style="text-align: center;">
              {{ period.title }}
            </v-card>
          </v-list-item>
        </v-list>      
      </div>
      
      <div style="margin: 5px 0; display: flex; align-items: center;">
        <v-list style="display: flex; flex-direction: row; padding: 0;" class="period-list">
          <v-list-item
            v-for="situation in situationOptions"
            :key="situation.value"
            :class="{ selected: selectedSituation === situation.value,
              'not-selected': !selectedSituation || selectedSituation !== situation.value
              }"
            @click="selectedSituation = (selectedSituation === situation.value ? null : situation.value)"
            style="width: 90px; justify-content: center; cursor: pointer;"
          >
            <v-card :color="selectedSituation === situation.value ? 'primary' : ''" class="rounded-card-period" style="text-align: center;">
              {{ situation.title }}
            </v-card>
          </v-list-item>
        </v-list>      
      </div>

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

    <div class="pie-charts-row">
  <div>
    <h4>Oma joukkue: Maalin syntytavat</h4>
    <PieChart :labels="homeGoalTypePie.labels" :values="homeGoalTypePie.values" title="Oma joukkue: Maalin syntytavat" />
  </div>
  <div>
    <h4>Vastustaja: Maalin syntytavat</h4>
    <PieChart :labels="awayGoalTypePie.labels" :values="awayGoalTypePie.values" title="Vastustaja: Maalin syntytavat" />
  </div>
</div>
<div class="pie-charts-row">
  <div>
    <h4>Oma joukkue: Taktinen tilanne</h4>
    <PieChart :labels="homeTacticalPie.labels" :values="homeTacticalPie.values" title="Oma joukkue: Taktinen tilanne" />
  </div>
  <div>
    <h4>Vastustaja: Taktinen tilanne</h4>
    <PieChart :labels="awayTacticalPie.labels" :values="awayTacticalPie.values" title="Vastustaja: Taktinen tilanne" />
  </div>
</div>
  </div>
</template>

<script>
import axios from 'axios';
import { useTeamStore } from '../stores/teamStore';
import { useAuthStore } from '../stores/authStore';
import config from '../../config.js'; // Tuo konfiguraatiotiedosto
import { parseSVG } from 'svg-path-parser';
import pointInPolygon from 'point-in-polygon';
import PieChart from '../components/PieChart.vue';

export default {
  data() {
    return {
      games: [],
      events: [],
      goalevents: [],
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
        { title: 'xG', value: 'xg', width: '10%' },
        { title: 'Yhteensä', value: 'total', width: '10%' }
      ],
      selectedPeriod: null,
      selectedSituation: null,
      periodOptions: [
        { value: 1, title: 'I' },
        { value: 2, title: 'II' },
        { value: 3, title: 'III' },
        { value: 4, title: 'JA' }
      ],
      situationOptions: [
        { value: 1, title: '5v5' },
        { value: 2, title: 'Av' },
        { value: 3, title: 'Yv' },
        { value: 4, title: 'Tv' },
      ],
      selectedEventId: null,
      hoveredEventId: null,
      showGoalDialog: false,
      selectedGoalEvent: null,
      goalTypeOptions: [
              { value: 'kuljetus', title: 'Laukaus kuljetuksesta/läpiajosta' },
              { value: '2vs1', title: 'Ylivoimahyökkäys (2v1 ym)' },
              { value: 'laukauspaikaltaan', title: 'Laukaus paikaltaan' },
              { value: 'suoraansyotosta', title: 'Laukaus suoraan syötöstä' },
              { value: 'rebound', title: 'Rebound' },
              { value: 'ohjaus', title: 'Ohjaus' },
              { value: 'vapari', title: 'Vapari/vaparikuvio' },
              { value: 'rangaistuslaukaus', title: 'Rangaistuslaukaus' },
              { value: 'omamaali', title: 'Oma maali' }
        ],
      tacticalSituationOptions: [
          { value: 'organisoitu', title: 'Organisoitu hyökkäys' },
          { value: 'kaanto', title: 'Kääntö' },
          { value: 'kaannonkaanto', title: 'Käännön kääntö' },
        ],
      showEventList: window.innerWidth >= 900,
    };
  },
  components: {
    PieChart,
    // muut komponentit
  },
  computed: {
    uniquePlayers() {
      /*
      const players = this.events.filter(event => event.playerId !== 100).map(event => event.playerName);
      return Array.from(new Set(players));
      */
      const players = this.events.filter(event => event.playerId !== 100).map(event => ({ name: event.playerName, number: event.playerNumber }));

      // Poista duplikaatit pelaajan nimen perusteella
      const uniquePlayers = Array.from(new Map(players.map(player => [player.name, player])).values());

      // Järjestä pelaajat numeron mukaan
      return uniquePlayers.sort((a, b) => a.number - b.number).map(player => player.name);
    },
    allPlayers() {
      const plyers = [ 'Kaikki pelaajat' , ...this.uniquePlayers];
      console.log(plyers);
      return plyers;
      /*return [{ id: 0, name: 'Kaikki pelaajat' }, ...this.uniquePlayers];*/
    },
    /*
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
    */
    filteredEvents() {
      let events = this.events;

      if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
        events = events.filter(event => event.playerName === this.selectedPlayer);
      }
      if (!this.showHomeTeam) {
        events = events.filter(event => event.playerNumber >= 100);
      }
      if (!this.showOpponentTeam) {
        events = events.filter(event => event.playerId && event.playerNumber < 100);
      }
      // Suodata erän mukaan
      if (this.selectedPeriod) {
        events = events.filter(event => event.period == this.selectedPeriod);
      }
      // Suodata kenttätilanteen mukaan
      if (this.selectedSituation) {
        events = events.filter(event => event.situation === this.selectedSituation);
      }

      return events.filter(event => this.visibleActions.includes(event.action));
    },
    homeTeamStats() {
      const stats = { maali: 0, torjunta: 0, blokki: 0, ohi: 0, total: 0, xg: 0 };
      const shotActions = ['maali', 'torjunta', 'blokki', 'ohi'];
      this.events.forEach(event => {
        if (event.playerNumber < 100 && shotActions.includes(event.action)) {
          stats[event.action]++;
          stats.total++;
          stats.xg += event.xg || 0;
          //console.log('Event:', event, 'Stats:', stats);
        }
      });
      return stats;
    },
    opponentTeamStats() {
      const stats = { maali: 0, torjunta: 0, blokki: 0, ohi: 0, total: 0, xg: 0 };
      const shotActions = ['maali', 'torjunta', 'blokki', 'ohi'];
      this.events.forEach(event => {
        if (event.playerNumber >= 100 && shotActions.includes(event.action)) {
          stats[event.action]++;
          stats.total++;
          stats.xg += event.xg || 0;
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
          total: this.homeTeamStats.total,
          xg: this.homeTeamStats.xg.toFixed(2),
        },
        {
          team: 'Vastustaja',
          maali: this.opponentTeamStats.maali,
          torjunta: this.opponentTeamStats.torjunta,
          blokki: this.opponentTeamStats.blokki,
          ohi: this.opponentTeamStats.ohi,
          total: this.opponentTeamStats.total,
          xg: this.opponentTeamStats.xg.toFixed(2),
        }
      ];
    },
    filteredHomeXg() {
      return this.filteredEvents
        .filter(e => e.playerNumber < 100)
        .reduce((sum, e) => sum + (e.xg || 0), 0);
    },
    filteredOpponentXg() {
      return this.filteredEvents
        .filter(e => e.playerNumber >= 100)
        .reduce((sum, e) => sum + (e.xg || 0), 0);
    },
    goalSituationText() {
      if (!this.selectedGoalEvent) return '-';
      if (this.selectedGoalEvent.evenstrength) return 'Tasaviisikoin';
      if (this.selectedGoalEvent.powerplay) return 'Ylivoima';
      if (this.selectedGoalEvent.shorthanded) return 'Alivoima';
      return '-';
    },
    homeGoalTypePie() {
      // Kotijoukkueen maalit
      const data = {};
      this.goalTypeOptions.forEach(opt => data[opt.title] = 0);
      this.goalevents.filter(g => g.ownteam === 1).forEach(g => {
        const opt = this.goalTypeOptions.find(opt => opt.value === g.scoringtype);
        if (opt) data[opt.title]++;
      });
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      };
    },
    awayGoalTypePie() {
      // Vierasjoukkueen maalit
      const data = {};
      this.goalTypeOptions.forEach(opt => data[opt.title] = 0);
      this.goalevents.filter(g => g.ownteam === 0).forEach(g => {
        const opt = this.goalTypeOptions.find(opt => opt.value === g.scoringtype);
        if (opt) data[opt.title]++;
      });
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      };
    },
    homeTacticalPie() {
      const data = {};
      this.tacticalSituationOptions.forEach(opt => data[opt.title] = 0);
      this.goalevents.filter(g => g.ownteam === 1).forEach(g => {
        const opt = this.tacticalSituationOptions.find(opt => opt.value === g.tacticalsituation);
        if (opt) data[opt.title]++;
      });
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      };
    },
    awayTacticalPie() {
      const data = {};
      this.tacticalSituationOptions.forEach(opt => data[opt.title] = 0);
      this.goalevents.filter(g => g.ownteam === 0).forEach(g => {
        const opt = this.tacticalSituationOptions.find(opt => opt.value === g.tacticalsituation);
        if (opt) data[opt.title]++;
      });
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      };
    }
  },
  watch: {
    showHomeTeam() {
      this.filteredEvents;
    },
    showOpponentTeam() {
      this.filteredEvents;
    },
    selectedPlayer() {
      this.calculateAreaEvents();
    }
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
    async loadEvents(gameId) {
       this.selectedGameId = gameId;
       console.log('Loading events...' + gameId);
       if (gameId === 0) {
          const teamStore = useTeamStore();
          const seasonId = teamStore.selectedTeamSeason.seasonId;

          fetch(`${config.apiUrl}/season/${seasonId}/gameevents/`)
            .then(response => response.json())
            .then(async data => {
              this.events = data || [];
              // Laske xG jokaiselle laukaus-/maalitapahtumalle
              console.log('Events loaded: ', this.events);
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
            .then(async data => {
              this.events = data || [];
              this.calculateAreaEvents();
            })
            .catch(error => {
              console.error('Error loading events:', error);
              alert('Virhe ladattaessa tapahtumia.');
            });
        }
        // haetaan goaleventit
        if (gameId === 0) {
          const teamStore = useTeamStore();
          const seasonId = teamStore.selectedTeamSeason.seasonId;

          fetch(`${config.apiUrl}/season/${seasonId}/goalevents/`)
            .then(response => response.json())
            .then(async data => {
              this.goalevents = data || [];
              // Laske xG jokaiselle laukaus-/maalitapahtumalle
              console.log('Events loaded: ', this.goalevents);
          })
          .catch(error => {
            console.error('Error loading goal events:', error);
            alert('Virhe ladattaessa tapahtumia.');
         });
       } 
       else {
          fetch(`${config.apiUrl}/goalevents/${gameId}`)
            .then(response => response.json())
            .then(async data => {
              this.goalevents = data || [];
            })
            .catch(error => {
              console.error('Error loading goal events:', error);
              alert('Virhe ladattaessa tapahtumia.');
            });
        }

      this.selectedPlayer = 'Kaikki pelaajat';
      this.teamNames = this.games.find(game => game.gameId === gameId).name;
    },
    handleEventClick(event) {
      // Jos klikattu rivi on jo valittuna, poista valinta
      if (this.selectedEventId === event.eventId) {
        this.selectedEventId = null;
        this.selectedGoalEvent = null;
        this.showGoalDialog = false;
        return;
      }
      this.selectedEventId = event.eventId;

      // Tarkista löytyykö goalevent samalla eventId:llä
      const goal = this.goalevents.find(g => g.eventId === event.eventId);
      if (goal) {
        this.selectedGoalEvent = goal;
        this.showGoalDialog = true;
        console.log('Selected goal event:', this.selectedGoalEvent);
      } else {
        this.selectedGoalEvent = null;
        this.showGoalDialog = false;
      }
    },
    closeGoalDialog() {
      this.showGoalDialog = false;
      this.selectedGoalEvent = null;
      this.selectedEventId = null;
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
          const response = await axios.get('/Laukaisukartta/alueet2.json');
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
        for (const event of this.filteredEvents) {
          const x = (event.xCoordinate / 100) * 342;
          const y = (event.yCoordinate / 100) * 574;
          const areaId = this.findAreaContainingPoint(x, y);
          if (areaId) {
            const team = event.playerNumber < 100 ? 'home' : 'away';
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
        console.log('Area not found for point:', x, y);

        for (const area of this.areas) {
          if (this.isPointInPath(x+0.2, y-0.2, area.points)) {
            return area.id;
          }
        }
        console.log('Attempt1: Area not found for point:', x+0.2, y-0.2);

        for (const area of this.areas) {
          if (this.isPointInPath(x+0.2, y-0.2, area.points)) {
            return area.id;
          }
        }
        console.log('Attempt2: Area not found for point:', x+0.2, y-0.2);

        for (const area of this.areas) {
          if (this.isPointInPath(x+0.5, y-0.5, area.points)) {
            return area.id;
          }
        }
        console.log('Attempt3: Area not found for point:', x+0.5, y-0.5);

        for (const area of this.areas) {
          if (this.isPointInPath(x+2, y-2, area.points)) {
            return area.id;
          }
        }
        console.log('Attempt4: Area not found for point:', x+2, y-2);

        for (const area of this.areas) {
          if (this.isPointInPath(x-2, y+2, area.points)) {
            return area.id;
          }
        }
        console.log('Failed and final: Area not found for point:', x-2, y+2);

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

        if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
          return this.areaEvents[area.id].home.yhteensä;
        }

        return centerY < 287 ? this.areaEvents[area.id].home.yhteensä : this.areaEvents[area.id].away.yhteensä;
      },
      getEventPercentage(area) {
        if (!this.areaEvents[area.id]) {
          return '0.0 %';
        }
        if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
          return ((this.areaEvents[area.id].home.yhteensä / this.allEvents()) * 100).toFixed(1) + ' %';
        }

        const centerY = this.getAreaCenter(area.points).y;
        return centerY < 287 ? ((this.areaEvents[area.id].home.yhteensä / this.homeTeamStats.total) * 100).toFixed(1) + ' %' : ((this.areaEvents[area.id].away.yhteensä / this.opponentTeamStats.total) * 100).toFixed(1) + ' %';
      },
      getShootingPercentage(area) {
        if (!this.areaEvents[area.id]) {
          return '0.0 %';
        }
        const centerY = this.getAreaCenter(area.points).y;
        if (centerY < 287) {
          if (this.areaEvents[area.id].home.maali === 0) {
            return '0.0 %';
          }          
        }
        else {
          if (this.areaEvents[area.id].away.maali === 0) {
            return '0.0 %';
          }
        }

        if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
          return ((this.areaEvents[area.id].home.maali / this.areaEvents[area.id].home.yhteensä) * 100).toFixed(1) + ' %';
        }

        return centerY < 287 ? ((this.areaEvents[area.id].home.maali / this.areaEvents[area.id].home.yhteensä) * 100).toFixed(1) + ' %' : ((this.areaEvents[area.id].away.maali / this.areaEvents[area.id].away.yhteensä) * 100).toFixed(1) + ' %';
      },
      getPercentageOfGoals(area) {
        if (!this.areaEvents[area.id]) {
          return '0.0 %';
        }

        if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
          if (this.filteredEvents.filter(event => event.action === 'maali').length == 0) {
            return '0.0 %';
          }
          return ((this.areaEvents[area.id].home.maali / this.filteredEvents.filter(event => event.action === 'maali').length) * 100).toFixed(1) + ' %';
        }

        const centerY = this.getAreaCenter(area.points).y;
        return centerY < 287 ? ((this.areaEvents[area.id].home.maali / this.homeTeamStats.maali) * 100).toFixed(1) + ' %' : ((this.areaEvents[area.id].away.maali / this.opponentTeamStats.maali) * 100).toFixed(1) + ' %';
      },
      getGoalCount(area) {
        if (!this.areaEvents[area.id]) {
          return '0';
        }
        const centerY = this.getAreaCenter(area.points).y;

        if (this.selectedPlayer && this.selectedPlayer !== 'Kaikki pelaajat') {
          return this.areaEvents[area.id].home.maali;
        }

        return centerY < 287 ? this.areaEvents[area.id].home.maali : this.areaEvents[area.id].away.maali;
      },
      async getPredictedXG(x, y) {
        const authStore = useAuthStore(); 
        // Muunna prosentit metreiksi
        const imgWidthPx = 342;
        const imgHeightPx = 574;
        const fieldWidthM = 20;
        const fieldHeightM = 40;
        const goalXPercent = 50;
        const goalYPercent = 10.453;

        const shotXPx = (x / 100) * imgWidthPx;
        const shotYPx = (y / 100) * imgHeightPx;
        const goalXPx = (goalXPercent / 100) * imgWidthPx;
        const goalYPx = (goalYPercent / 100) * imgHeightPx;

        const pxToM_X = fieldWidthM / imgWidthPx;
        const pxToM_Y = fieldHeightM / imgHeightPx;

        const shotXM = shotXPx * pxToM_X;
        const shotYM = shotYPx * pxToM_Y;
        const goalXM = goalXPx * pxToM_X;
        const goalYM = goalYPx * pxToM_Y;

        const dx = shotXM - goalXM;
        const dy = shotYM - goalYM;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleRad = Math.atan2(dx, dy);
        const angleDeg = angleRad * (180 / Math.PI);

        try {
          const response = await fetch(`${config.apiUrl}/predict-goal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify({ distance, angle: angleDeg })
          });
          if (!response.ok) throw new Error('xG ennusteen haku epäonnistui');
          
          const data = await response.json();
          console.log('xG ennuste:', data);
          return data.probability ?? 0.05;
        } catch (e) {
          console.error('Virhe xG ennusteessa:', e);
          return 0.05;
        }
      },
    },
    created() {
      const teamStore = useTeamStore();
      const authStore = useAuthStore();
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

  .period-list {
    list-style-type: none;
    padding: 10;
  }

  .period-list li {
    cursor: pointer;
    padding: 5px;
    border: 1px solid #ccc;
    margin: 4px 0;
  }
  .period-list li.selected {
    background-color: #007bff;
    color: white;
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

   .pie-charts-row {
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
    margin-bottom: 32px;
  }

  .pie-charts-row > div {
    flex: 1 1 320px;
    min-width: 280px;
    max-width: 400px;
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

   .highlighted-marker {
      box-shadow: 0 0 0 2px gold, 0 0 4px 4px orange;
      z-index: 2;
      width: 12px !important;
      height: 12px !important;
      border: 2px solid orange;
      transform: translate(-30%, -30%);
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

.map-and-eventlist {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 900px) {
  .map-and-eventlist {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
  }
  .image-containeri {
    flex-shrink: 0;
  }
  .event-list-side {
    max-height: 674px;
    overflow-y: auto;
    min-width: 220px;
    width: 320px;
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
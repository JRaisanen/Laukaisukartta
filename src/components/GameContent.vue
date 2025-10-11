<template>
  <div class="game-content">
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

    <!-- Team Names Display -->
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
              item-title="name"
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
                  event.playerId < 100 ? 'circle' : 'square',
                  { 'highlighted-marker': selectedEventId === event.eventId || hoveredEventId === event.eventId }
                ]"
                :style="getMarkerStyle(event)"
                :title="event.playerNumber + ' ' + event.playerName + ' ' + event.action"
              ></div>
              <div
                v-if="showNumbers"
                v-for="event in filteredEvents"
                :key="event.eventId"
                class="number"
                :style="getNumberStyle(event)"
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
                    :x="getAreaCenter(area).x"
                    :y="getAreaCenter(area).y < 287 ? getAreaCenter(area).y - 10 : getAreaCenter(area).y + 0"
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
                    :x="getAreaCenter(area).x"
                    :y="getAreaCenter(area).y < 287 ? getAreaCenter(area).y : getAreaCenter(area).y + 10"
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
                  :x="getAreaCenter(area).x"
                  :y="getAreaCenter(area).y < 287 ? getAreaCenter(area).y - 10 : getAreaCenter(area).y + 0"
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
                  :x="getAreaCenter(area).x"
                  :y="getAreaCenter(area).y < 287 ? getAreaCenter(area).y : getAreaCenter(area).y + 10"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useTeamStore } from '../stores/teamStore'
import config from '../../config'
import PieChart from './PieChart.vue'
import { parseSVG } from 'svg-path-parser'
import pointInPolygon from 'point-in-polygon'

export default {
  name: 'GameContent',
  components: {
    PieChart
  },
  setup() {
    const teamStore = useTeamStore()
    
    // Reactive state
    const events = ref([])
    const teamNames = ref('')
    const loading = ref(false)
    const tab = ref('one')
    const showGoalDialog = ref(false)
    const selectedGoalEvent = ref(null)
    
    // Filter states
    const showHomeTeam = ref(true)
    const showOpponentTeam = ref(true)
    const showNumbers = ref(true)
    const selectedPlayer = ref(null)
    const selectedEventId = ref(null)
    const hoveredEventId = ref(null)
    const showEventList = ref(true)
    const selectedPeriod = ref(null)
    const selectedSituation = ref(null)
    
    // Game data
    const areas = ref([])
    const areaEvents = ref({})
    const goalevents = ref([])
    const visibleActions = ref(['maali', 'torjunta', 'ohi', 'blokki'])
    const actions = ['maali', 'torjunta', 'ohi', 'blokki', 'yhteensä']
    
    // Goal dialog options
    const goalTypeOptions = [
      { value: 'kuljetus', title: 'Laukaus kuljetuksesta/läpiajosta' },
      { value: 'laukauspaikaltaan', title: 'Laukaus paikaltaan' },
      { value: 'suoraansyotosta', title: 'Laukaus suoraan syötöstä' },
      { value: 'rebound', title: 'Rebound' },
      { value: 'vapari', title: 'Vapari/vaparikuvio' },
      { value: 'rangaistuslaukaus', title: 'Rangaistuslaukaus' },
      { value: 'omamaali', title: 'Oma maali' }
    ]
    
    const tacticalSituationOptions = [
      { value: 'organisoitu', title: 'Organisoitu hyökkäys' },
      { value: 'kaanto', title: 'Kääntö' },
      { value: 'kaannonkaanto', title: 'Käännön kääntö' }
    ]
    
    const periodOptions = [
      { title: 'I', value: 1 },
      { title: 'II', value: 2 },
      { title: 'III', value: 3 },
      { title: 'JA', value: 4 }
    ]
    
    const situationOptions = [
        { value: 1, title: '5v5' },
        { value: 2, title: 'Yv' },
        { value: 3, title: 'Av' },
        { value: 4, title: 'Tv' },
    ]
    
    const teamStatsHeaders = [
      { title: 'Joukkue', key: 'team', sortable: false },
      { title: 'Maalit', key: 'goals', sortable: false },
      { title: 'Torjunnat', key: 'saves', sortable: false },
      { title: 'Ohi', key: 'misses', sortable: false },
      { title: 'Blokki', key: 'blocks', sortable: false },
      { title: 'Yhteensä', key: 'total', sortable: false },
      { title: 'xG', key: 'xg', sortable: false }
    ]
    
    const no_results_text = 'Ei tuloksia'
    
    // Computed properties for filtering
    const filteredEvents = computed(() => {
      return events.value.filter(event => {
        // Home/Away team filtering
        if (!showHomeTeam.value && event.playerId < 100) return false
        if (!showOpponentTeam.value && event.playerId >= 100) return false
        
        // Player filtering
        if (selectedPlayer.value && event.playerId !== selectedPlayer.value) return false
        
        // Period filtering
        if (selectedPeriod.value && event.period !== selectedPeriod.value) return false
        
        // Suodata kenttätilanteen mukaan
        if (selectedSituation.value && event.situation !== selectedSituation.value) return false

        // Tactical situation filtering
        //if (selectedSituation.value && event.tacticalsituation !== selectedSituation.value) return false
        
        // Action visibility filtering
        if (!visibleActions.value.includes(event.action)) return false
        
        return true
      })
    })
    
    const filteredShotEvents = computed(() => {
      return filteredEvents.value.filter(event => 
        event.eventType === 'shot' || event.eventType === 'goal'
      )
    })
    
    const filteredGoalEvents = computed(() => {
      return filteredEvents.value.filter(event => event.eventType === 'goal')
    })
    
    const filteredHomeXg = computed(() => {
      return filteredEvents.value
        .filter(event => event.playerId < 100)
        .reduce((sum, event) => sum + (parseFloat(event.xg) || 0), 0)
    })
    
    const filteredOpponentXg = computed(() => {
      return filteredEvents.value
        .filter(event => event.playerId >= 100)
        .reduce((sum, event) => sum + (parseFloat(event.xg) || 0), 0)
    })
    
    const allPlayers = computed(() => {
      // Get unique players based on playerId and playerName
      const uniquePlayersMap = new Map()
      events.value.forEach(event => {
        if (event.playerId && event.playerName) {
          uniquePlayersMap.set(event.playerId, {
            id: event.playerId,
            name: event.playerName
          })
        }
      })
      
      const players = Array.from(uniquePlayersMap.values())
      console.log('Kaikki pelaajat:', players)
      return [{ id: null, name: 'Kaikki pelaajat' }, ...players]
    })
    
    const teamStats = computed(() => {
      const homeEvents = filteredEvents.value.filter(e => e.playerId < 100)
      const awayEvents = filteredEvents.value.filter(e => e.playerId >= 100)
      
      return [
        {
          team: 'Oma joukkue',
          goals: homeEvents.filter(e => e.action === 'maali').length,
          saves: homeEvents.filter(e => e.action === 'torjunta').length,
          misses: homeEvents.filter(e => e.action === 'ohi').length,
          blocks: homeEvents.filter(e => e.action === 'blokki').length,
          total: homeEvents.length,
          xg: homeEvents.reduce((sum, e) => sum + (parseFloat(e.xg) || 0), 0).toFixed(2)
        },
        {
          team: 'Vastustaja',
          goals: awayEvents.filter(e => e.action === 'maali').length,
          saves: awayEvents.filter(e => e.action === 'torjunta').length,
          misses: awayEvents.filter(e => e.action === 'ohi').length,
          blocks: awayEvents.filter(e => e.action === 'blokki').length,
          total: awayEvents.length,
          xg: awayEvents.reduce((sum, e) => sum + (parseFloat(e.xg) || 0), 0).toFixed(2)
        }
      ]
    })
    
    const homeGoalTypePie = computed(() => {
      // Kotijoukkueen maalit goaleventien kautta - suodatettu
      const data = {}
      goalTypeOptions.forEach(opt => data[opt.title] = 0)
      
      // Suodata goalevents samalla logiikalla kuin events
      const filteredGoalevents = goalevents.value.filter(g => {
        // Period filtering
        if (selectedPeriod.value && g.period !== selectedPeriod.value) return false
        
        // Situation filtering (jos goaleventissa on situation kenttä)
        if (selectedSituation.value && g.situation && g.situation !== selectedSituation.value) return false
        
        return g.ownteam === 1
      })
      
      filteredGoalevents.forEach(g => {
        const opt = goalTypeOptions.find(opt => opt.value === g.scoringtype)
        if (opt) data[opt.title]++
      })
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      }
    })
    
    const awayGoalTypePie = computed(() => {
      // Vierasjoukkueen maalit goaleventien kautta - suodatettu
      const data = {}
      goalTypeOptions.forEach(opt => data[opt.title] = 0)
      
      // Suodata goalevents samalla logiikalla kuin events
      const filteredGoalevents = goalevents.value.filter(g => {
        // Period filtering
        if (selectedPeriod.value && g.period !== selectedPeriod.value) return false
        
        // Situation filtering (jos goaleventissa on situation kenttä)
        if (selectedSituation.value && g.situation && g.situation !== selectedSituation.value) return false
        
        return g.ownteam === 0
      })
      
      filteredGoalevents.forEach(g => {
        const opt = goalTypeOptions.find(opt => opt.value === g.scoringtype)
        if (opt) data[opt.title]++
      })
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      }
    })
    
    const homeTacticalPie = computed(() => {
      const data = {}
      tacticalSituationOptions.forEach(opt => data[opt.title] = 0)
      
      // Suodata goalevents samalla logiikalla kuin events
      const filteredGoalevents = goalevents.value.filter(g => {
        // Period filtering
        if (selectedPeriod.value && g.period !== selectedPeriod.value) return false
        
        // Situation filtering (jos goaleventissa on situation kenttä)
        if (selectedSituation.value && g.situation && g.situation !== selectedSituation.value) return false
        
        return g.ownteam === 1
      })
      
      filteredGoalevents.forEach(g => {
        const opt = tacticalSituationOptions.find(opt => opt.value === g.tacticalsituation)
        if (opt) data[opt.title]++
      })
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      }
    })
    
    const awayTacticalPie = computed(() => {
      const data = {}
      tacticalSituationOptions.forEach(opt => data[opt.title] = 0)
      
      // Suodata goalevents samalla logiikalla kuin events
      const filteredGoalevents = goalevents.value.filter(g => {
        // Period filtering
        if (selectedPeriod.value && g.period !== selectedPeriod.value) return false
        
        // Situation filtering (jos goaleventissa on situation kenttä)
        if (selectedSituation.value && g.situation && g.situation !== selectedSituation.value) return false
        
        return g.ownteam === 0
      })
      
      filteredGoalevents.forEach(g => {
        const opt = tacticalSituationOptions.find(opt => opt.value === g.tacticalsituation)
        if (opt) data[opt.title]++
      })
      return {
        labels: Object.keys(data),
        values: Object.values(data)
      }
    })
    
    const goalSituationText = computed(() => {
      if (!selectedGoalEvent.value) return '-'
      if (selectedGoalEvent.value.evenstrength) return 'Tasaviisikoin'
      if (selectedGoalEvent.value.powerplay) return 'Ylivoima'
      if (selectedGoalEvent.value.shorthanded) return 'Alivoima'
      return '-'
    })
    
    // Computed for positioning markers with fixed coordinates
    const getMarkerStyle = (event) => {
      const x = (event.xCoordinate / 100) * 342
      const y = (event.yCoordinate / 100) * 574
      return {
        top: y + 'px',
        left: x + 'px'
      }
    }
    
    const getNumberStyle = (event) => {
      const x = ((event.xCoordinate + 5) / 100) * 342
      const y = (event.yCoordinate / 100) * 574
      return {
        top: y + 'px',
        left: x + 'px'
      }
    }
    
    // Methods
    const loadEvents = async (gameId) => {
      if (!gameId) return
      
      loading.value = true
      try {
        const response = await fetch(`${config.apiUrl}/gameevents/${gameId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        events.value = data || []
        console.log('Tapahtumat ladattu:', data)
        
        // Load team names
        await loadTeamNames(gameId)
        
        // Load areas data
        await loadAreas()
        
        // Calculate area events after everything is loaded
        if (areas.value.length > 0) {
          calculateAreaEvents()
        }
        
        // Load goal events
        await loadGoalEvents(gameId)
        
      } catch (error) {
        console.error('Virhe tapahtumien lataamisessa:', error)
        events.value = []
      } finally {
        loading.value = false
      }
    }
    
    const loadGoalEvents = async (gameId) => {
      if (!gameId) return
      
      try {
        const response = await fetch(`${config.apiUrl}/goalevents/${gameId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        goalevents.value = data || []
        console.log('Goal events ladattu:', goalevents.value)
        
      } catch (error) {
        console.error('Virhe goal events lataamisessa:', error)
        goalevents.value = []
      }
    }
    
    const loadAreas = async () => {
      try {
        const response = await fetch('/alueet2.json')
        if (response.ok) {
          const data = await response.json()
          const areasData = data.alueet || []
          areas.value = areasData.map(area => {
            const points = calculatePoints(area.d)
            return { ...area, points }
          })
          console.log('Alueet ladattu:', areas.value.length)
          
          // Calculate area events if we have events loaded
          if (events.value.length > 0) {
            calculateAreaEvents()
          }
        }
      } catch (error) {
        console.error('Virhe alueiden lataamisessa:', error)
        areas.value = []
      }
    }
    
    const loadTeamNames = async (gameId) => {
      try {
        const response = await fetch(`${config.apiUrl}/games/${gameId}`)
        if (!response.ok) return
        
        const game = await response.json()
        teamNames.value = game.name || `Ottelu ${gameId}`
        
      } catch (error) {
        console.error('Virhe ottelutietojen lataamisessa:', error)
      }
    }
    
    const getEventPosition = (event) => {
      return {
        position: 'absolute',
        left: `${event.xCoord || 0}%`,
        top: `${event.yCoord || 0}%`,
        transform: 'translate(-50%, -50%)'
      }
    }
    
    const showEventDetails = (event) => {
      if (event.eventType === 'goal') {
        selectedGoalEvent.value = event
        showGoalDialog.value = true
      }
    }
    
    const closeGoalDialog = () => {
      showGoalDialog.value = false
      selectedGoalEvent.value = null
      selectedEventId.value = null
    }
    
    // Event handling methods
    const handleEventClick = (event) => {
      // Jos klikattu rivi on jo valittuna, poista valinta
      if (selectedEventId.value === event.eventId) {
        selectedEventId.value = null
        selectedGoalEvent.value = null
        showGoalDialog.value = false
        return
      }
      selectedEventId.value = event.eventId

      // Tarkista löytyykö goalevent samalla eventId:llä
      const goal = goalevents.value.find(g => g.eventId === event.eventId)
      if (goal) {
        selectedGoalEvent.value = goal
        showGoalDialog.value = true
        console.log('Selected goal event:', selectedGoalEvent.value)
      } else {
        selectedGoalEvent.value = null
        showGoalDialog.value = false
      }
    }
    
    const toggleActionVisibility = (action) => {
      const index = visibleActions.value.indexOf(action)
      if (index > -1) {
        visibleActions.value.splice(index, 1)
      } else {
        visibleActions.value.push(action)
      }
    }
    
    const countEvents = (action) => {
      return filteredEvents.value.filter(e => e.action === action).length
    }
    
    const allEvents = () => {
      return filteredEvents.value.length
    }
    
    // Area calculation methods - copied from GameView.vue
    const getAreaCenter = (area) => {
      // Check if area has points array
      if (!area || !area.points || !Array.isArray(area.points)) {
        console.warn('Area missing points:', area)
        return { x: 171, y: 287 } // Default center
      }
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const point of area.points) {
        const [x, y] = point
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
      return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      }
    }

    const getEventCount = (area) => {
      if (!areaEvents.value[area.id]) {
        return '0'
      }
      const centerY = getAreaCenter(area).y

      if (selectedPlayer.value && selectedPlayer.value !== 'Kaikki pelaajat') {
        return areaEvents.value[area.id].home.yhteensä
      }

      return centerY < 287 ? areaEvents.value[area.id].home.yhteensä : areaEvents.value[area.id].away.yhteensä
    }

    const getEventPercentage = (area) => {
      if (!areaEvents.value[area.id]) {
        return '0.0 %'
      }
      if (selectedPlayer.value && selectedPlayer.value !== 'Kaikki pelaajat') {
        return ((areaEvents.value[area.id].home.yhteensä / allEvents()) * 100).toFixed(1) + ' %'
      }

      const centerY = getAreaCenter(area).y
      const homeTotal = teamStats.value.find(t => t.team === 'Oma joukkue')?.total || 1
      const awayTotal = teamStats.value.find(t => t.team === 'Vastustaja')?.total || 1
      
      return centerY < 287 
        ? ((areaEvents.value[area.id].home.yhteensä / homeTotal) * 100).toFixed(1) + ' %' 
        : ((areaEvents.value[area.id].away.yhteensä / awayTotal) * 100).toFixed(1) + ' %'
    }

    const getShootingPercentage = (area) => {
      if (!areaEvents.value[area.id]) {
        return '0.0 %'
      }
      const centerY = getAreaCenter(area).y
      
      if (centerY < 287) {
        if (areaEvents.value[area.id].home.maali === 0) {
          return '0.0 %'
        }          
      } else {
        if (areaEvents.value[area.id].away.maali === 0) {
          return '0.0 %'
        }
      }

      if (selectedPlayer.value && selectedPlayer.value !== 'Kaikki pelaajat') {
        return ((areaEvents.value[area.id].home.maali / areaEvents.value[area.id].home.yhteensä) * 100).toFixed(1) + ' %'
      }

      return centerY < 287 
        ? ((areaEvents.value[area.id].home.maali / areaEvents.value[area.id].home.yhteensä) * 100).toFixed(1) + ' %' 
        : ((areaEvents.value[area.id].away.maali / areaEvents.value[area.id].away.yhteensä) * 100).toFixed(1) + ' %'
    }

    const getPercentageOfGoals = (area) => {
      if (!areaEvents.value[area.id]) {
        return '0.0 %'
      }

      if (selectedPlayer.value && selectedPlayer.value !== 'Kaikki pelaajat') {
        const totalGoals = filteredEvents.value.filter(event => event.action === 'maali').length
        if (totalGoals === 0) {
          return '0.0 %'
        }
        return ((areaEvents.value[area.id].home.maali / totalGoals) * 100).toFixed(1) + ' %'
      }

      const centerY = getAreaCenter(area).y
      const homeGoals = teamStats.value.find(t => t.team === 'Oma joukkue')?.goals || 1
      const awayGoals = teamStats.value.find(t => t.team === 'Vastustaja')?.goals || 1
      
      return centerY < 287 
        ? ((areaEvents.value[area.id].home.maali / homeGoals) * 100).toFixed(1) + ' %' 
        : ((areaEvents.value[area.id].away.maali / awayGoals) * 100).toFixed(1) + ' %'
    }

    const getGoalCount = (area) => {
      if (!areaEvents.value[area.id]) {
        return '0'
      }
      const centerY = getAreaCenter(area).y

      if (selectedPlayer.value && selectedPlayer.value !== 'Kaikki pelaajat') {
        return areaEvents.value[area.id].home.maali
      }

      return centerY < 287 ? areaEvents.value[area.id].home.maali : areaEvents.value[area.id].away.maali
    }
    
    // SVG Path parsing functions
    const calculatePoints = (pathData) => {
      const commands = parseSVG(pathData)
      const points = []
      let currentX = 0
      let currentY = 0

      for (const command of commands) {
        switch (command.code) {
          case 'M':
          case 'm':
            currentX = command.code === 'M' ? command.x : currentX + command.x
            currentY = command.code === 'M' ? command.y : currentY + command.y
            points.push([currentX, currentY])
            break
          case 'L':
          case 'l':
            currentX = command.code === 'L' ? command.x : currentX + command.x
            currentY = command.code === 'L' ? command.y : currentY + command.y
            points.push([currentX, currentY])
            break
          case 'H':
          case 'h':
            currentX = command.code === 'H' ? command.x : currentX + command.x
            points.push([currentX, currentY])
            break
          case 'V':
          case 'v':
            currentY = command.code === 'V' ? command.y : currentY + command.y
            points.push([currentX, currentY])
            break
          case 'C':
          case 'c':
            points.push([currentX, currentY, command.x1, command.y1, command.x2, command.y2, command.x, command.y])
            currentX = command.code === 'C' ? command.x : currentX + command.x
            currentY = command.code === 'C' ? command.y : currentY + command.y
            break
          case 'Z':
          case 'z':
            // Close path
            break
        }
      }
      return points
    }

    const isPointInPath = (x, y, points) => {
      return pointInPolygon([x, y], points)
    }

    const findAreaContainingPoint = (x, y) => {
      for (const area of areas.value) {
        if (isPointInPath(x, y, area.points)) {
          return area.id
        }
      }

      // Try with small offsets if no exact match
      const offsets = [
        [0.2, -0.2], [-0.2, 0.2], [0.5, -0.5], [-0.5, 0.5], 
        [2, -2], [-2, 2]
      ]
      
      for (const [offsetX, offsetY] of offsets) {
        for (const area of areas.value) {
          if (isPointInPath(x + offsetX, y + offsetY, area.points)) {
            return area.id
          }
        }
      }

      console.log('Area not found for point:', x, y)
      return null
    }

    const calculateAreaEvents = () => {
      const newAreaEvents = {}
      
      for (const area of areas.value) {
        newAreaEvents[area.id] = {
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
        }
      }

      for (const event of filteredEvents.value) {
        const x = (event.xCoordinate / 100) * 342
        const y = (event.yCoordinate / 100) * 574
        const areaId = findAreaContainingPoint(x, y)
        
        if (areaId) {
          const team = event.playerId < 100 ? 'home' : 'away'
          newAreaEvents[areaId][team][event.action]++
          newAreaEvents[areaId][team].yhteensä++
        }
      }
      
      areaEvents.value = newAreaEvents
      console.log('Area events calculated:', areaEvents.value)
    }
    
    // Watch for currentGameId changes
    watch(() => teamStore.currentGameId, (newGameId) => {
      if (newGameId) {
        loadEvents(newGameId)
      }
    }, { immediate: true })
    
    // Watch for changes that require area events recalculation
    watch([filteredEvents, selectedPlayer], () => {
      if (areas.value.length > 0) {
        calculateAreaEvents()
      }
    })
    
    onMounted(() => {
      if (teamStore.currentGameId) {
        loadEvents(teamStore.currentGameId)
      }
    })
    
    return {
      events,
      teamNames,
      loading,
      tab,
      showGoalDialog,
      selectedGoalEvent,
      showHomeTeam,
      showOpponentTeam,
      showNumbers,
      selectedPlayer,
      selectedEventId,
      hoveredEventId,
      showEventList,
      selectedPeriod,
      selectedSituation,
      areas,
      areaEvents,
      goalevents,
      visibleActions,
      actions,
      periodOptions,
      situationOptions,
      goalTypeOptions,
      tacticalSituationOptions,
      teamStatsHeaders,
      no_results_text,
      filteredEvents,
      filteredShotEvents,
      filteredGoalEvents,
      filteredHomeXg,
      filteredOpponentXg,
      allPlayers,
      teamStats,
      homeGoalTypePie,
      awayGoalTypePie,
      homeTacticalPie,
      awayTacticalPie,
      goalSituationText,
      getMarkerStyle,
      getNumberStyle,
      getEventPosition,
      showEventDetails,
      closeGoalDialog,
      handleEventClick,
      toggleActionVisibility,
      countEvents,
      allEvents,
      getAreaCenter,
      getEventCount,
      getEventPercentage,
      getShootingPercentage,
      getPercentageOfGoals,
      getGoalCount,
      calculateAreaEvents
    }
  }
}
</script>

<style scoped>
.game-content {
  width: 100%;
}

.team-names-display {
  text-align: center;
  margin-bottom: 10px;
}

.filter-container {
  margin-bottom: 0px;
}

.checkbox-label {
  font-size: 0.9rem;
}

.image-containeri {
  position: relative;
  text-align: center;
  width: 342px;
  height: 574px;
  margin: 0 auto;
  overflow: auto;
}

.image-containeri img {
  width: 342px;
  height: 574px;
  display: block;
  object-fit: contain;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.overlay text {
  font-family: Arial, sans-serif;
  font-weight: bold;
}

.shot-event, .goal-event {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
}

.shot-event {
  background-color: #2196F3;
  border: 2px solid #1976D2;
}

.goal-event {
  background-color: #4CAF50;
  border: 2px solid #388E3C;
}

.home-event {
  border-color: #1976D2;
}

.opponent-event {
  border-color: #F44336;
  background-color: #FFCDD2;
}

.player-number {
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.7);
}

/* Shot and goal markers */
.marker {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  cursor: pointer;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.marker.circle {
  border-radius: 50%;
}

.marker.square {
  border-radius: 2px;
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

.highlighted-marker {
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  border-width: 3px !important;
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

.event-list {
  max-height: 400px;
  overflow-y: auto;
}

.event-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-item:hover {
  background-color: #f5f5f5;
}

.goal-item {
  background-color: #f8fff8;
}

.event-info {
  flex: 1;
}

.event-details {
  color: #666;
  font-size: 0.9rem;
}

.assist-info {
  color: #888;
  font-style: italic;
}

.event-result {
  font-weight: bold;
  color: #1976D2;
}

.goal-result {
  color: #4CAF50;
}

/* Media queries for responsive image handling */
@media (max-width: 768px) {
  .image-containeri {
    width: 100%;
    max-width: 342px;
    height: auto;
    max-height: 574px;
    overflow: auto;
  }
  
  .image-containeri img {
    width: 342px;
    height: 574px;
  }
}

@media (max-width: 400px) {
  .image-containeri {
    width: 100%;
    max-width: 342px;
    height: auto;
    max-height: 574px;
    overflow: auto;
  }
  
  .image-containeri img {
    width: 342px;
    height: 574px;
  }
}
</style>
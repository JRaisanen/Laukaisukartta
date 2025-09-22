<template>
  <div class="container">
    <div class="top-section">
    <div class="app">
      <h2>Laukaisukartan syöttäminen</h2>
      <div class="team-names">
        <h3>{{ teamNames }}</h3>
      </div>  

      <div>
        <!-- Dialogitemplaatit -->
          <v-dialog v-model="gamedialog" max-width="500">
            <template v-slot:activator="{ props: activatorProps }" v-if="!gameId">
              <v-btn
                v-bind="activatorProps"
                v-on="on"
                color="surface-variant"
                text="Uusi ottelu"
                variant="flat"
                :disabled="gameId" 
              ></v-btn>
            </template>

            <v-card>
              <v-card-title>
                <span class="headline">Uusi ottelu</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="valid">
                  <v-text-field
                    v-model="newGame.teamNames"
                    label="Ottelun nimi: (esim. SaiPa/Sudet - EräViikingit 02.11.2024)"
                    :rules="[v => !!v || 'Nimi on pakollinen']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="newGame.shortteamNames"
                    label="Ottelun lyhyt nimi (esim. SaSu-ErVi 0211)"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text="Tallenna"
                  @click="saveGame"
                ></v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  text="Peruuta"
                  @click="gamedialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- Maalitietojen dialogi -->
        <v-dialog v-model="goalDialog" max-width="500">
          <v-card>
            <v-card-title>Maalin lisätiedot</v-card-title>
            <v-card-text>
              <v-select
                v-model="goalData.goalScoringTeam"
                :items="goalScoringTeamOptions"
                item-title="title"
                item-value="value"
                label="Maalin tehnyt joukkue"
                clearable
              />
              <v-select
                v-if="goalData.scoringPlayer && goalData.scoringPlayer.playerId !== 100"
                v-model="goalData.scoringPlayer"
                :items="localPlayers"
                :return-object="true"
                item-title="name"
                item-value="playerId"
                label="Maalintekijä"
                clearable
              />
              <!-- Jos valittu maalintekijä on vastustaja, näytä tekstikenttä -->
              <v-text-field
                v-if="goalData.scoringPlayer && goalData.scoringPlayer.playerId === 100"
                v-model="opponentScorerName"
                label="Syötä maalintekijä"
                required
              />
              <v-select
                v-if="goalData.scoringPlayer && goalData.scoringPlayer.playerId !== 100"
                v-model="goalData.assistingPlayer"
                :items="assistCandidates"
                :return-object="true"
                item-title="name"
                item-value="playerId"
                label="Syöttäjä"
                clearable
              />
              <!-- Jos valittu syöttäjä on vastustaja, näytä tekstikenttä -->
              <v-text-field
                v-if="goalData.scoringPlayer && goalData.scoringPlayer.playerId === 100"
                v-model="opponentAssistName"
                label="Syöttäjä"                
              />
              <v-checkbox
                v-model="goalData.shortHanded"
                :true-value="1"
                :false-value="0"
                label="AV (alivoima)"
              />
              <v-checkbox
                v-model="goalData.powerPlay"
                :true-value="1"
                :false-value="0"
                label="YV (ylivoima)"
              />
              <v-select
                v-model="goalData.onField"
                :items="ownPlayers"
                item-title="name"
                item-value="number"
                label="Kentällä olleet pelaajat"
                multiple
                clearable
              />
              <v-select
                v-model="goalData.type"
                :items="goalTypeOptions"
                label="Maalin syntytapa"
                clearable
              />
              <v-select
                v-model="goalData.tacticalSituation"
                :items="tacticalSituationOptions"
                label="Taktinen tilanne"
                clearable
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="confirmGoalDialog">OK</v-btn>
              <v-btn text @click="goalDialog = false">Peruuta</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- xG-arvon syöttö dialogi -->
        <v-dialog v-model="xgDialog" max-width="400">
          <v-card>
            <v-card-title>Määritä xG-arvo</v-card-title>
            <v-card-text>
              <div v-if="xgLoading" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 120px;">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="32"
                    style="margin-bottom: 12px;"
                  ></v-progress-circular>
                  <div style="text-align:center; margin-bottom:8px;">Haetaan xG-arviota...</div>
                </div>
                <div v-else style="display: flex; flex-direction: row; align-items: center;">
                  <!-- Vasemman puolen painikkeet -->
                  <div style="display: flex; flex-direction: column; gap: 8px; margin-right: 16px;">
                    <v-btn size="small" @click="xgValue = Math.max(0, xgValue * 0.90)">-10 %</v-btn>
                    <v-btn size="small" @click="xgValue = Math.max(0, xgValue * 0.75)">-25 %</v-btn>
                    <v-btn size="small" @click="xgValue = Math.max(0, xgValue * 0.50)">-50 %</v-btn>
                  </div>
                  <!-- Slider keskelle -->
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <v-slider
                      v-model="xgValue"
                      :min="0"
                      :max="1"
                      :step="0.005"
                      thumb-label="always"
                      color="primary"
                      style="width: 200px;"
                    />
                    <div style="margin-top: 16px; font-size: 1.2em;">
                      xG: {{ xgValue.toFixed(3) }}
                    </div>
                  </div>
                  <!-- Oikean puolen painikkeet -->
                  <div style="display: flex; flex-direction: column; gap: 8px; margin-left: 16px;">
                    <v-btn size="small" @click="xgValue = Math.min(1, xgValue * 1.10)">+10 %</v-btn>
                    <v-btn size="small" @click="xgValue = Math.min(1, xgValue * 1.25)">+25 %</v-btn>
                    <v-btn size="small" @click="xgValue = Math.min(1, xgValue * 1.50)">+50 %</v-btn>
                  </div>
                </div>
              </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="confirmXgDialog" :disabled="xgLoading">OK</v-btn>
              <v-btn text @click="xgDialog = false">Peruuta</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="penaltyDialog" max-width="400">
          <v-card>
            <v-card-title>Valitse jäähyn pituus</v-card-title>
            <v-card-text>
              <v-select
                v-model="penaltyLength"
                :items="penalties"
                item-title="title"
                item-value="value"
                label="Jäähyn pituus (minuuttia)"
                required
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="confirmPenaltyDialog">OK</v-btn>
              <v-btn text @click="penaltyDialog = false">Peruuta</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- Rankkaridialogi -->
        <v-dialog v-model="penaltyshotDialog" max-width="400">
          <v-card>
            <v-card-title>Rangaistuslaukauksen lopputulema</v-card-title>
            <v-card-text>
              <v-select
                v-model="penaltyshotResult"
                :items="penaltyshotResults"
                item-title="title"
                item-value="value"
                label="Lopputulema"
                required
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="confirmPenaltyshotDialog">OK</v-btn>
              <v-btn text @click="penaltyshotDialog = false">Peruuta</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

      <span style="margin-right: 10px;">Erä/kenttätilanne:</span>
      <div style="margin: 5px 0; display: flex; align-items: center;">
        <v-list style="display: flex; flex-direction: row; padding: 0;" class="period-list">
            <v-list-item
              v-for="period in periodOptions"
              :key="period.value"
              :class="{ selected: selectedPeriod === period.value,
                'not-selected': !selectedPeriod || selectedPeriod !== period.value
               }"
              @click="selectedPeriod = period.value"
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
              @click="selectedSituation = situation.value"
              style="width: 90px; justify-content: center; cursor: pointer;"
            >
              <v-card :color="selectedSituation === situation.value ? 'primary' : ''" class="rounded-card-period" style="text-align: center;">
                {{ situation.title }}
              </v-card>
            </v-list-item>
          </v-list>      
        </div>

      <div style="margin-bottom: 8px; text-align: center;">
        <strong>Oma joukkue:</strong>
        Maalit: {{ ownTeamStats.goals }} &nbsp; | &nbsp; xG: {{ ownTeamStats.xg.toFixed(2) }}
      </div>
      <div @click="handleClick" class="image-container">
        <img src="/kuva.png" alt="Field" />
        <div
          v-for="event in events"
          :key="event.id"
          :class="['marker', event.action, 
              event.action === 'oma maali'
                ? (event.player.playerId < 100 ? 'square' : 'circle')
                : (event.player.playerId < 100 ? 'circle' : 'square')
            ]"
          :style="{ top: event.y + '%', left: event.x + '%' }"
          :title="event.player.number + ' ' + event.player.name + ' ' + event.action"
        >
      </div>

      <div style="margin-top: 8px; text-align: center;">
        <strong>Vastustaja:</strong>
        Maalit: {{ opponentStats.goals }} &nbsp; | &nbsp; xG: {{ opponentStats.xg.toFixed(2) }}
      </div>

      <h3>Valitse maalivahti</h3>
      <v-list lines="one" class="player-list">
            <v-list-item 
                v-for="goalie in localGoalies"
                @click="selectGoalie(goalie)"
                density="compact"
                :disabled="!gameId"
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
      <h2>Valitse pelaaja ja tapahtuma</h2>
      <div class="selection-container">
        <v-list lines="one" class="player-list">
            <v-list-item 
                v-for="player in localPlayersWithGoalie"
                @click="selectPlayer(player)"
                density="compact"
                :disabled="!gameId"
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
                :disabled="!gameId"
                density="compact"
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
          <v-list v-if="selectedPlayer && selectedPlayer.playerId === 100 && selectedAction == 'blokki'" class="player-list" lines="one">
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
    <h2>Tilastot/Tapahtumat</h2>

    <v-data-table :items="playerGameStats" 
      :headers="playerStatsHeaders"
      :items-per-page="-1"
      :hide-default-footer="true">
      <template #item.xg="{ item }">
        {{ item.xg.toFixed(2) }}
      </template>
    </v-data-table>

    <h2>Maalivahtien tilastot</h2>
    <v-data-table
      :items="goalieStats"
      :headers="goalieStatsHeaders"
      :hide-default-footer="true"
    >
      <template #item.xgAgainst="{ item }">
        {{ item.xgAgainst.toFixed(2) }}
      </template>

    </v-data-table>

    <v-btn
        color="surface-variant"
        @click="confirmSaveGamePlayers"
        text="Tallenna tilastot"
        variant="flat"
        class="mt-1"
        :disabled="events.length === 0">        
      </v-btn>

      <ul>
        <li v-for="event in reversedEvents" :key="event.eventId">
          {{ event.eventId }} - {{ event.player.name }} - {{ event.action }} @ ({{ event.x.toFixed(2) }}%, {{ event.y.toFixed(2) }}%)
          <span v-if="event.goalie">: {{ event.goalie.name }}</span>
          <span v-if="event.blocker">: {{ event.blocker.name }}</span>
          <button @click="deleteEvent(event.eventId)">X</button>
        </li>
      </ul>
       
  </div>

  </template>
  
  <script>
  import { ref } from 'vue';
  import { useTeamStore } from '../stores/teamStore';
  import { useAuthStore } from '../stores/authStore';
  import config from '../../config'; // Tuo konfiguraatiotiedosto
  
  export default {
    data() {
      const teamStore = useTeamStore();
      const authStore = useAuthStore();
      const newGame = ref({ teamNames: '', shortteamNames: '', weburl: '', teamId: null, seasonId: null });
      const gamedialog = ref(false);
      const goalDialog = ref(false);
      //const goalData = ref({ assist: null, onField: [], type: null });

      this.checkToken();
      //let gameId;
      teamStore.fetchTeams();
      console.log('Kliikki - Joukkueet:', teamStore.teams);
      console.log('Kliikki - Kaudet:', teamStore.teamSeasons);
      console.log('Kliikki - Kausi' + teamStore.selectedTeamSeason);
      //console.log('Kliikki - Joukkue' + teamId);
  
      const saveGame = async () => {
        try {
          console.log('Tallennetaan uusi ottelu:', newGame.value);
          //const authStore = useAuthStore();
          const uusiGame = {
            name: newGame.value.teamNames,
            shortname: newGame.value.shortteamNames,
            weburl: '',
            teamId: this.teamStore.selectedTeam.teamId,
            seasonId: this.teamStore.selectedTeamSeason.seasonId
          };

          console.log('Tallennetaan uusi ottelu:', uusiGame);
          const response = await fetch(`${config.apiUrl}/games`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',
              'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(uusiGame),
          });
          if (!response.ok) {
            throw new Error('Ottelun luominen epäonnistui');
          }
          const data = await response.json();
          this.gameId = data.gameId;

          console.log('Luotu ottelu:', data);

          gamedialog.value = false;
          // Päivitä ottelun tiedot käyttöliittymässä
          this.teamNames = data.name;
          this.shortteamNames = data.shortname;
          this.teamStore.selectedTeam.teamId = data.teamId;
          this.teamStore.selectedTeamSeason.seasonId = data.seasonId;
          newGame.value.teamNames = '';
          newGame.value.shortteamNames = '';
        } catch (error) {
          console.error('Virhe ottelun luomisessa:', error);
        }      
      };

      return {
        teamStore,
        authStore,
        newGame,
        gamedialog,
        saveGame,
        actions: ['maali', 'torjunta', 'blokki', 'ohi', 'RL', 'jäähy', 'oma maali'],
        penalties: [
          { value: 2, title: '2' },
          { value: 4, title: '4' },
          { value: 10, title: '10' },
          { value: 20, title: '20' }
        ],
        penaltyshotResults: [
          { value: 'maali', title: 'Maali' },
          { value: 'torjunta', title: 'Torjunta' },
          { value: 'ohi', title: 'Ohi' }
        ],
        events: [],
        goalevents: [],
        gameId: null,
        selectedPoint: null,
        selectedPlayer: null,
        selectedAction: null,
        selectedBlocker: null,
        selectedGoalie: null,
        teamNames: '',
        shortteamNames: '',
        isGameModalOpen: false, // Modaalin tila
        periodOptions: [
          { value: 1, title: '1' },
          { value: 2, title: '2' },
          { value: 3, title: '3' },
          { value: 4, title: '(JA)' }
        ],
        selectedPeriod: 1,
        situationOptions: [
          { value: 1, title: '5v5' },
          { value: 2, title: 'Av' },
          { value: 3, title: 'Yv' },
          { value: 4, title: 'Tv' }
        ],
        selectedSituation: 1,
        goalDialog: false,
        goalData: {
          gameId: null,
          eventId: null,
          scoringPlayer: null,
          assistingPlayer: null,  
          onField: [],
          type: null,
          ownteam: null,
          evenStrength: null,
          shortHanded: null,
          powerPlay: null,
          owngoal: null,
          tacticalSituation: null,
          period: null,
          penaltyshot: null,
          goalScoringTeam: null
        },
        goalScoringTeamOptions: [
          { value: 1, title: 'Oma joukkue' },
          { value: 0, title: 'Vastustaja' },
        ],
        goalTypeOptions: [
          { value: 'kuljetus', title: 'Laukaus kuljetuksesta/läpiajosta' },
          { value: 'laukauspaikaltaan', title: 'Laukaus paikaltaan' },
          { value: 'suoraansyotosta', title: 'Laukaus suoraan syötöstä' },
          { value: 'rebound', title: 'Rebound' },
          { value: 'vapari', title: 'Vapaalyönti/kuvio' },
          //{ value: 'rangaistuslaukaus', title: 'Rangaistuslaukaus' },
          { value: 'omamaali', title: 'Oma maali' },
          // Lisää muita vaihtoehtoja tarpeen mukaan
        ],
        tacticalSituationOptions: [
          { value: 'organisoitu', title: 'Organisoitu hyökkäys' },
          { value: 'kaanto', title: 'Kääntö' },
          { value: 'kaannonkaanto', title: 'Käännönkääntö' },
        ],
        xgDialog: false,
        xgLoading: false,
        xgValue: 0.05, // oletusarvo
        pendingEvent: null, // tähän tallennetaan event ennen xG:n syöttöä
        pendingGoalEvent: null,
        penaltyDialog: false,
        penaltyLength: null,
        penaltyshotResult: null,
        penaltyshotDialog: false,
        playerStatsHeaders: [
          { title: 'Nro', value: 'playerNumber' },
          { title: 'Nimi', value: 'playerName' },
          { title: 'Maalit', value: 'goal' },
          { title: 'Syötöt', value: 'assist' },
          { title: 'Pisteet', value: 'point' },
          { title: 'YV maalit', value: 'powerplaygoal' },
          { title: 'AV maalit', value: 'shorthandedgoal' },
          { title: 'RL maalit', value: 'penaltyshotgoal' },
          { title: 'RL yritys', value: 'penaltyshotattempt' },
          { title: 'Lauk. maalit', value: 'shot_goal' },
          { title: 'Torj. lauk.', value: 'shot_saved' },
          { title: 'Blokatut lauk.', value: 'shot_blocked' },
          { title: 'Ohi lauk.', value: 'shot_missed' },
          { title: 'xG', value: 'xg' },
          { title: 'Blokatut', value: 'blocked_shot' },
          { title: '+', value: 'plus_goal' },
          { title: '-', value: 'minus_goal' },
          { title: '+/-', value: 'plusminus' },
          { title: '2min', value: 'penalty_2m' },
          { title: '10min', value: 'penalty_10m' },
          { title: '20min', value: 'penalty_20m' },
        ],
        goalieStatsHeaders: [
          { title: 'Nro', value: 'number' },
          { title: 'Nimi', value: 'name' },
          { title: 'Torjunnat', value: 'saves' },
          { title: 'Päästetyt maalit', value: 'goalsAgainst' },
          { title: 'xG vastaan', value: 'xgAgainst' },
          { title: 'Syötöt', value: 'assists' },
          { title: '2min', value: 'penalty_2m' },
          { title: '10min', value: 'penalty_10m' },
          { title: '20min', value: 'penalty_20m' },
        ],
        opponentScorerName: '',
        opponentAssistName: '',
      };
    },

    computed: {
      reversedEvents() {
        return this.events.slice().reverse();
      },
      localPlayers() {
        const teamStore = useTeamStore();
        const players = teamStore.players;
        if (!players.some(player => player.playerId === 100)) {
          players.push({ playerId: 100, name: 'Vastustaja', number: 100 });
        }
        return players.filter(player => player.active === 1 || player.playerId === 100);
      },
      localPlayersWithGoalie() {
        const teamStore = useTeamStore();
        let players = teamStore.players.filter(player => player.active === 1 || player.playerId === 100);

        if (!players.some(player => player.playerId === 100)) {
          players.push({ playerId: 100, name: 'Vastustaja', number: 100 });
        }

        // Lisää valittu maalivahti, jos sellainen on ja ei jo listalla
        if (this.selectedGoalie && this.selectedGoalie.playerId !== 0) {
          if (!players.some(p => p.playerId === this.selectedGoalie.playerId)) {
            players.push(this.selectedGoalie);
          }
        }
        return players;
      },
      ownPlayers() {
        const teamStore = useTeamStore();
        return teamStore.players.filter(player => player.playerId !== 100 && player.active === 1);
      },
      assistCandidates() {
        // Palauta kaikki ownPlayers-pelaajat, paitsi valittu maalintekijä
        let candidates = this.ownPlayers.filter(
          player => !this.goalData.scoringPlayer || player.playerId !== this.goalData.scoringPlayer.playerId
        );
        // Lisää valittu maalivahti, jos sellainen on
        if (this.selectedGoalie && this.selectedGoalie.playerId !== 0) {
          // Varmista ettei maalivahti ole jo listalla
          if (!candidates.some(p => p.playerId === this.selectedGoalie.playerId)) {
            candidates.push(this.selectedGoalie);
          }
        }
        return candidates;
      },
      localGoalies() {
        const teamStore = useTeamStore();
        const goalies = teamStore.goalies;
        if (!goalies.some(goalie => goalie.playerId === 0)) {
          goalies.push({ playerId: 0, name: 'Ei maalivahtia', number: 0, active: 1 });
        }
        //goalies.push({ playerId: 0, name: 'Ei maalivahtia', number: 0 });
        return goalies.filter(goalie => goalie.active === 1 || goalie.playerId === 0);
      },
      ownTeamStats() {
        // Oletetaan, että oma joukkueen arvo on 1 (goalScoringTeam)
        const ownEvents = this.events.filter(e => e.player && e.player.playerId !== 100);
        const ownGoals = ownEvents.filter(e => e.action === 'maali').length + this.events.filter(e => e.player && e.player.playerId === 100 && e.action === 'oma maali').length;
        const ownXg = ownEvents.reduce((sum, e) => sum + (e.xg || 0), 0);
        return { goals: ownGoals, xg: ownXg };
      },
      opponentStats() {
        // Oletetaan, että vastustajan pelaajalla playerId === 100
        const oppEvents = this.events.filter(e => e.player && e.player.playerId === 100);
        const oppGoals = oppEvents.filter(e => e.action === 'maali').length + this.events.filter(e => e.player && e.player.playerId !== 100 && e.action === 'oma maali').length;;
        const oppXg = oppEvents.reduce((sum, e) => sum + (e.xg || 0), 0);
        return { goals: oppGoals, xg: oppXg };
      },
      playerGameStats() {
          // Luo tilastot jokaiselle ownPlayers-pelaajalle
          return this.ownPlayers.map(player => {
            // Pelaajan eventit
            const playerEvents = this.events.filter(e => e.player && e.player.playerId === player.playerId);
            const xg = playerEvents.reduce((sum, e) => sum + (e.xg || 0), 0);
            // Pelaajan maalit goaleventsistä
            const goals = this.goalevents.filter(g => g.scorerId === player.playerId);
            // Pelaajan syötöt goaleventsistä
            const assists = this.goalevents.filter(g => g.assistId === player.playerId);
            // Yli- ja alivoimamaalit
            const powerplaygoals = this.goalevents.filter(g => g.scorerId === player.playerId && g.powerplay === 1).length;
            const shorthandedgoals = this.goalevents.filter(g => g.scorerId === player.playerId && g.shorthanded === 1).length;
            // console.log(powerplaygoals, shorthandedgoals);
            //const penaltyshotgoals = 0;
            const penaltyshotgoals = this.goalevents.filter(g => g.scorerId === player.playerId && g.penaltyshot === 1).length;
            const penaltyshotattempts = this.events.filter(e => e.player && e.player.playerId === player.playerId && e.penaltyshot === 1).length;
            //const penaltyshotattempts = 0;

            // Plussat ja miinukset (plus_goal/minus_goal):  
            // Plussat: kun pelaaja on kentällä oman joukkueen maalissa (evenstrength)
            // Miinukset: kun pelaaja on kentällä vastustajan maalissa (evenstrength)
            let plus_goal = 0, minus_goal = 0;
            /*
            this.goalevents.forEach(g => {
              if (g.evenstrength && Array.isArray(g.ownplayersinfield)) {
                // Jos ownplayersinfield on JSON-string, pura se:
                const field = typeof g.ownplayersinfield === 'string'
                  ? JSON.parse(g.ownplayersinfield)
                  : g.ownplayersinfield;
                if (field.includes(player.playerId)) {
                  if (g.ownteam === 1) plus_goal++;
                  if (g.ownteam === 0) minus_goal++;
                }
              }
            });*/
            this.goalevents.forEach(g => {
              if (g.evenstrength && g.ownplayersinfield && g.penaltyshot === 0) {
                // Puretaan kentälläolijat aina taulukoksi
                let field;
                if (typeof g.ownplayersinfield === 'string') {
                  try {
                    field = JSON.parse(g.ownplayersinfield);
                  } catch {
                    field = [];
                  }
                } else {
                  field = g.ownplayersinfield;
                }
                if (Array.isArray(field) && field.includes(player.playerId)) {
                  if (g.ownteam === 1) plus_goal++;
                  if (g.ownteam === 0) minus_goal++;
                }
              }
              else if (g.shorthanded && g.ownplayersinfield && g.ownteam === 0 && g.penaltyshot === 0) {
                // jos ylivoimalla mutta vastustaja tehnyt maalin, tulee kentälläolijoille miinukset
                // Puretaan kentälläolijat aina taulukoksi
                console.log('vastustajan alivoima');
                let field;
                if (typeof g.ownplayersinfield === 'string') {
                  try {
                    field = JSON.parse(g.ownplayersinfield);
                  } catch {
                    field = [];
                  }
                } else {
                  field = g.ownplayersinfield;
                }
                if (Array.isArray(field) && field.includes(player.playerId)) {
                  if (g.ownteam === 0) minus_goal++;
                }
              }
              else if (g.shorthanded && g.ownplayersinfield && g.ownteam === 1 && g.penaltyshot === 0) {
                // jos alivoimalla tehty maali, kentälläolleille plussat
                // Puretaan kentälläolijat aina taulukoksi
                let field;
                if (typeof g.ownplayersinfield === 'string') {
                  try {
                    field = JSON.parse(g.ownplayersinfield);
                  } catch {
                    field = [];
                  }
                } else {
                  field = g.ownplayersinfield;
                }
                if (Array.isArray(field) && field.includes(player.playerId)) {
                  if (g.ownteam === 1) plus_goal++;
                }
              }

            });

            // Laukaustyypit
            const shot_goal = playerEvents.filter(e => e.action === 'maali').length;
            const shot_saved = playerEvents.filter(e => e.action === 'torjunta').length;
            const shot_blocked = playerEvents.filter(e => e.action === 'blokki').length;
            const shot_missed = playerEvents.filter(e => e.action === 'ohi').length;
            
            // Pelaajan blokkaamat laukaukset (toimii jos blokkaaja tallennetaan event.blocker)
            const blocked_shot = this.events.filter(e => e.blocker && e.blocker.playerId === player.playerId).length;

            // Jäähyt
            //const penalty_2m = playerEvents.filter(e => e.penaltyLength === 2).length;
            const penalty_2m = playerEvents.reduce((sum, e) => {
              if (e.penaltyLength === 2) return sum + 1;
              if (e.penaltyLength === 4) return sum + 2;
              return sum;
            }, 0);
            const penalty_10m = playerEvents.filter(e => e.penaltyLength === 10).length;
            const penalty_20m = playerEvents.filter(e => e.penaltyLength === 20).length;

            // Pisteet
            const goal = goals.length;
            const assist = assists.length;
            const point = goal + assist;
            const plusminus = plus_goal - minus_goal;
            const powerplaygoal = powerplaygoals;
            const shorthandedgoal = shorthandedgoals;
            const penaltyshotgoal = penaltyshotgoals;
            const penaltyshotattempt = penaltyshotattempts;

            console.log(`Tilastot pelaajalle ${player.name}: Maalit=${goal}, Syötöt=${assist}, Pisteet=${point}, YV-maalit=${powerplaygoal}, AV-maalit=${shorthandedgoal}, Lauk. maalit=${shot_goal}, Torj. lauk.=${shot_saved}, Blokatut lauk.=${shot_blocked}, Ohi lauk.=${shot_missed}, xG=${xg.toFixed(2)}, Blokatut=${blocked_shot}, +=${plus_goal}, -=${minus_goal}, +/-=${plusminus}, 2min=${penalty_2m}, 10min=${penalty_10m}, 20min=${penalty_20m}`);

            return {
              gameId: this.gameId,
              playerId: player.playerId,
              playerName: player.name,
              playerNumber: player.number,
              shot_goal,
              shot_saved,
              shot_blocked,
              shot_missed,
              xg,
              blocked_shot,
              goal,
              assist,
              point,
              powerplaygoal,
              shorthandedgoal,
              penaltyshotgoal,
              penaltyshotattempt,
              plus_goal,
              minus_goal,
              plusminus,
              penalty_2m,
              penalty_10m,
              penalty_20m
            };
          });
        },
        goalieStats() {
          return this.localGoalies.map(goalie => {
            // Torjunnat
            const saves = this.events.filter(e =>
              e.goalie && e.goalie.playerId === goalie.playerId && e.action === 'torjunta'
            ).length;
            // Päästetyt maalit
            const goalsAgainst = this.events.filter(e =>
              e.goalie && e.goalie.playerId === goalie.playerId && e.action === 'maali'
            ).length;
            // Syötöt
            const assists = this.goalevents.filter(g =>
              g.assistId === goalie.playerId
            ).length;
            // Jäähyt
            const goalieEvents = this.events.filter(e =>
              e.player && e.player.playerId === goalie.playerId && e.action === 'jäähy'
            );
            const penalty_2m = goalieEvents.reduce((sum, e) => {
              if (e.penaltyLength === 2) return sum + 1;
              if (e.penaltyLength === 4) return sum + 2;
              return sum;
            }, 0);
            const penalty_10m = goalieEvents.filter(e => e.penaltyLength === 10).length;
            const penalty_20m = goalieEvents.filter(e => e.penaltyLength === 20).length;

            // xG maalivahdille kohdistuneista laukauksista (torjunta + maali)
            const goalieXgEvents = this.events.filter(e =>
              e.goalie && e.goalie.playerId === goalie.playerId &&
              (e.action === 'maali' || e.action === 'torjunta' || e.action === 'ohi' || e.action === 'blokki')
            );
            const xgAgainst = goalieXgEvents.reduce((sum, e) => sum + (e.xg || 0), 0);

            return {
              number: goalie.number,
              name: goalie.name,
              saves,
              goalsAgainst,
              assists,
              penalty_2m,
              penalty_10m,
              penalty_20m,
              xgAgainst: xgAgainst
            };
          });
        },
    },
    methods: {
      openGameModal() {
        console.log('Avaa pelimodaali');
        this.isGameModalOpen = true;
      },
      handleClick(event) {
        const rect = event.target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        this.selectedPoint = { x, y };
      },
      selectPlayer(player) {
       this.selectedPlayer = player;
      },
      async selectAction(action) {
          this.selectedAction = action;
          if (this.selectedPlayer.playerId >= 100 && (!this.selectedGoalie || this.selectedAction === 'torjunta' && this.selectedGoalie.playerId === 0))
          {

            alert('Valitse maalivahti');
          }
          else
          {

            if (this.selectedPlayer.playerId < 100 || this.selectedPlayer.playerId >= 100 && this.selectedAction !== 'blokki')
            {
              this.goalData.eventId = await this.addEvent();
              //console.log('Eventid', this.goalData.eventId);
            }

            // Eventin lisäystä ennen avataan maalidialogi ja kysytään maalin tiedot ja tallennetaan maalievent
            if (action === "maali") {
              this.goalData.scoringPlayer = this.selectedPlayer;
              
              if (this.selectedPlayer.playerId < 100 || this.selectedPlayer.playerId > 100) 
              {
                this.goalData.goalScoringTeam = 1;
              }
              else 
              {
                this.goalData.goalScoringTeam = 0;
              }

              if (this.selectedSituation == 1 || this.selectedSituation == 4)
              {
                this.goalData.evenStrength = 1;
                this.goalData.shortHanded = 0;
                this.goalData.powerPlay = 0;
              }
              else if (this.selectedSituation == 2)
              {
                if (this.goalData.goalScoringTeam == 1)
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 1;
                  this.goalData.powerPlay = 0;
                }
                else
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 0;
                  this.goalData.powerPlay = 1;
                }
              }
              else if (this.selectedSituation == 3)
              {
                if (this.goalData.goalScoringTeam == 1)
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 0;
                  this.goalData.powerPlay = 1;
                }
                else
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 1;
                  this.goalData.powerPlay = 0;
                }
              }

              this.goalDialog = true;
            }
            
                        // Eventin lisäystä ennen avataan maalidialogi ja kysytään oman maalin tiedot ja tallennetaan maalievent
            if (action === "oma maali") {
              this.goalData.scoringPlayer = this.selectedPlayer;
              this.goalData.type = 'omamaali';
              
              if (this.selectedPlayer.playerId < 100 || this.selectedPlayer.playerId > 100) 
              {
                this.goalData.goalScoringTeam = 0;
              }
              else 
              {
                this.goalData.goalScoringTeam = 1;
              }

              if (this.selectedSituation == 1 || this.selectedSituation == 4)
              {
                this.goalData.evenStrength = 1;
                this.goalData.shortHanded = 0;
                this.goalData.powerPlay = 0;
              }
              else if (this.selectedSituation == 2)
              {
                if (this.goalData.goalScoringTeam == 1)
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 0;
                  this.goalData.powerPlay = 1;
                }
                else
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 1;
                  this.goalData.powerPlay = 0;
                }
              }
              else if (this.selectedSituation == 3)
              {
                if (this.goalData.goalScoringTeam == 1)
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 1;
                  this.goalData.powerPlay = 0;
                }
                else
                {
                  this.goalData.evenStrength = 0;
                  this.goalData.shortHanded = 0;
                  this.goalData.powerPlay = 1;
                }
              }

              this.goalDialog = true;
            }

            
          }
      },
      selectBlocker(player) {
          this.selectedBlocker = player;
          this.addEvent();
        },
      selectGoalie(goalie) {
          console.log(`Valittu veskari: ${goalie.number}`);
          this.selectedGoalie = goalie;
        },
      getShotDistanceAndAngle(eventX, eventY) {
        // Kuvan mitat
        const imgWidthPx = 342;
        const imgHeightPx = 574;
        const fieldWidthM = 20;
        const fieldHeightM = 40;

        // Maalin keskipiste
        const goalXPercent = 50;
        const goalYPercent = 10.453;

        // Muunna prosentit pikseleiksi
        const shotXPx = (eventX / 100) * imgWidthPx;
        const shotYPx = (eventY / 100) * imgHeightPx;
        const goalXPx = (goalXPercent / 100) * imgWidthPx;
        const goalYPx = (goalYPercent / 100) * imgHeightPx;

        // Muunna pikselit metreiksi
        const pxToM_X = fieldWidthM / imgWidthPx;
        const pxToM_Y = fieldHeightM / imgHeightPx;

        const shotXM = shotXPx * pxToM_X;
        const shotYM = shotYPx * pxToM_Y;
        const goalXM = goalXPx * pxToM_X;
        const goalYM = goalYPx * pxToM_Y;

        // Etäisyys
        const dx = shotXM - goalXM;
        const dy = shotYM - goalYM;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Kulma (asteina, 0 = suoraan kohti maalia)
        // atan2 palauttaa kulman radiaaneina, muutetaan asteiksi
        const angleRad = Math.atan2(dx, dy); // dx ensin, koska kenttä on "pysty"
        const angleDeg = angleRad * (180 / Math.PI);

        return {
          distance: distance, // metreinä
          angle: angleDeg     // asteina
        };
      },
      async addEvent() {
        if (this.selectedPlayer && this.selectedAction === 'jäähy') {
          console.log('Lisätään jäähy tapahtuma');
          const event = {
            eventId: Date.now(),
            x: 0,
            y: 0,
            player: this.selectedPlayer,
            action: this.selectedAction,
            blocker: null,
            period: this.selectedPeriod,
            situation: this.selectedSituation,
            penaltyLength: null, // Tämä täytetään dialogissa
            penaltyshot: 0,
          };

          this.penaltyLength = 2; // oletusarvo
          this.pendingEvent = event;
          if (this.selectedAction === "jäähy") {
            this.xgValue = 0;
            this.penaltyDialog = true;
          }

        }
        else if (this.selectedPlayer && this.selectedAction && this.selectedPoint && this.selectedAction !== 'jäähy') {
          const event = {
            eventId: Date.now(),
            x: this.selectedPoint.x,
            y: this.selectedPoint.y,
            player: this.selectedPlayer,
            action: this.selectedAction,
            blocker: this.selectedBlocker,
            period: this.selectedPeriod,
            situation: this.selectedSituation,
            penaltyLength: null,
            penaltyshot: 0,
          };
          console.log('Lisätään tapahtuma', event);
          let distance, angle;

          if (this.selectedPlayer.playerId === 100) {
            ({ distance, angle } = this.getShotDistanceAndAngle(100-event.x, 100-event.y));
            console.log('Etäisyys maaliin:', distance.toFixed(2), 'm');
            console.log('Kulma maaliin:', angle.toFixed(1), 'astetta');
          }
          else {
            ({ distance, angle } = this.getShotDistanceAndAngle(event.x, event.y));
            console.log('Etäisyys maaliin:', distance.toFixed(2), 'm');
            console.log('Kulma maaliin:', angle.toFixed(1), 'astetta');
          }

          if (this.selectedPlayer.playerId === 100 && (this.selectedAction === 'torjunta' || this.selectedAction === 'maali' || this.selectedAction === 'ohi' || this.selectedAction === 'blokki')) {
            event.goalie = this.selectedGoalie;
          }

          if (this.selectedAction === "oma maali") {
            this.xgValue = 0;
          }
          else if (this.selectedAction === "RL") {
            event.xg = 0.6;
            event.penaltyshot = 1;
          }
          else {
            if (this.selectedAction !== "maali") {
              this.xgDialog = true;
              this.xgLoading = true;
            }
            try {
              const response = await fetch(`${config.apiUrl}/predict-goal`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',
                  'Authorization': `Bearer ${this.authStore.token}`
                },
                body: JSON.stringify({ distance, angle })
              });
              if (!response.ok) throw new Error('xG ennusteen haku epäonnistui');
              const data = await response.json();
              console.log('xG ennuste:', data);
              this.xgValue = data.probability ?? 0.05; // Oletusarvo jos ei tule arvoa
            } catch (e) {
              console.error('Virhe xG ennusteessa:', e);
              this.xgValue = 0.05;
            }
          }

          this.xgLoading = false;
          this.pendingEvent = event;
          console.log('AddEvent', this.pendingEvent);
          if (this.selectedAction === 'RL') {
              this.penaltyshotDialog = true;
          }


        } else {
          alert('Valitse pelaaja ja toimenpide');
        }

        // Älä vielä lisää eventtiä events-listaan!
        return; // Poistu metodista

        //const eventid = await this.saveSingleEvent(event);
        //event.eventId = eventid;
        //this.events.push(event);

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
         /*
         if (this.selectedAction !== 'maali') {
          this.emptyEventData();
         }
         return eventid;
         */
      },
      confirmGoalDialog() {

        const penaltyshot = this.goalData.type === 'rangaistuslaukaus' ? 1 : 0;
        const owngoal = this.goalData.type === 'omamaali' ? 1 : 0;

        // Jos maalintekijä on vastustaja, käytä syötettyä nimeä
        let scorerName = this.goalData.scoringPlayer.name;
        let scorerNumber = this.goalData.scoringPlayer.number;
        if (this.goalData.scoringPlayer.playerId === 100 && this.opponentScorerName) {
          scorerName = this.opponentScorerName;
          scorerNumber = 100;
        }

        // Jos syöttäjä on vastustaja, käytä syötettyä nimeä
        let assistId = this.goalData.assistingPlayer ? this.goalData.assistingPlayer.playerId : null;
        let assistName = this.goalData.assistingPlayer ? this.goalData.assistingPlayer.name : null;
        let assistNumber = this.goalData.assistingPlayer ? this.goalData.assistingPlayer.number : null;
        if (this.opponentAssistName) {
          assistId = 100;          
          assistName = this.opponentAssistName;
          assistNumber = 100;
        }

        const goalEvent = {
            eventId: this.goalData.eventId,
            gameId: this.gameId,
            ownteam: this.goalData.goalScoringTeam,
            scorerId: this.goalData.scoringPlayer.playerId,
            scorerName: scorerName,
            scorerNumber: scorerNumber,
            assistId: assistId,
            assistName: assistName,
            assistNumber: assistNumber,
            evenstrength: this.goalData.evenStrength,
            shorthanded: this.goalData.shortHanded,
            powerplay: this.goalData.powerPlay,
            penaltyshot: penaltyshot,
            period: this.selectedPeriod,
            scoringtype: this.goalData.type,
            tacticalsituation: this.goalData.tacticalSituation,
            ownplayersinfield: JSON.stringify(this.goalData.onField),
            owngoal: this.goalData.type === 'omamaali' ? 1 : 0,
          };
          console.log('Tallennetaan maali tapahtuma:', goalEvent);

          this.pendingGoalEvent = goalEvent;

          // lisää maali tapahtuma
          //this.saveGoalEvent(goalEvent);
          this.goalDialog = false;
          if (this.goalData.type === 'omamaali') {
            this.confirmXgDialog();
          }
          else {
            this.xgDialog = true;
          }
          //this.emptyEventData();

      },
      emptyEventData() {
        this.selectedPoint = null;
        this.selectedPlayer = null;
        this.selectedAction = null;
        this.selectedBlocker = null;
        this.penaltyLength = null;
        this.goalData = {
          scoringPlayer: null,
          assistingPlayer: null,
          evenStrength: 0,
          shortHanded: 0,
          powerPlay: 0,
          penaltyshot: 0,
          tacticalSituation: null,
          ownPlayersInField: 0,
          owngoal: 0
        };
        this.opponentAssistName = null;
        this.opponentScorerName = null;
        this.penaltyshotResult = null;
      },
      deleteEvent(eventId) {
        console.log('Poistetaan event id:', eventId);
        this.deleteGameEvent(eventId);
        this.events = this.events.filter(event => event.eventId !== eventId);
        // filteröidään myös goaleventseistä vaikkei maalia löydykään
        this.goalevents = this.goalevents.filter(event => event.eventId !== eventId);
      },
      async saveEvents() {
        // luodaan ensin ottelu
        const authStore = useAuthStore(); // Hae authStore
        const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8'; // Korvaa tämä omalla API-avaimellasi

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
        period: event.period,
        situation: event.situation,
        gameId: this.gameId
      }));

      console.log('Events to be saved:', eventsToSave);
      // Lähetä kaikki eventit backendille
      try {
          const response = await fetch(`${config.apiUrl}/gameevents`, {
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
    async saveSingleEvent(event) {
      const authStore = useAuthStore();
      const eventToSave = {
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
        period: event.period,
        situation: event.situation,
        xg: event.xg,
        penalty2m: event.penaltyLength === 2 ? 1 : (event.penaltyLength === 4 ? 2 : null),
        penalty10m: event.penaltyLength === 10 ? 1 : null,
        penalty20m: event.penaltyLength === 20 ? 1 : null,
        gameId: this.gameId,
        penaltyshot: event.penaltyshot,
      };
      try {
        console.log('Event to be saved to backend:', eventToSave);
        const response = await fetch(`${config.apiUrl}/gameevent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(eventToSave)
        });
        if (!response.ok) {
          throw new Error('Eventin tallennus epäonnistui');
        }
        const data = await response.json();
        // Oleta että backend palauttaa { eventId: ... }
        console.log('Event saved to backend:', data);
        return data.eventId;
      } catch (error) {
        console.error('Virhe eventin tallennuksessa:', error);
        return null;
      }
    },
    async saveGoalEvent(goalEvent) {
      const authStore = useAuthStore();
      console.log('Goealevent to be saved to backend:', goalEvent);
      try {
        const response = await fetch(`${config.apiUrl}/goalevent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(goalEvent)
        });
        if (!response.ok) {
          throw new Error('Eventin tallennus epäonnistui');
        }
        const data = await response.json();
        // Oleta että backend palauttaa { eventId: ... }
        console.log('Goal saved to backend:', data);
        return data.eventId;
      } catch (error) {
        console.error('Virhe eventin tallennuksessa:', error);
        return null;
      }
    },
    async deleteGameEvent(eventId) {
      const authStore = useAuthStore();
      try {
        const response = await fetch(`${config.apiUrl}/gameevent/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        if (!response.ok) throw new Error('Virhe poistettaessa tapahtumaa');
        // Voit päivittää tapahtumalistan tässä, jos sellainen on
        console.log('Tapahtuma poistettu.');
      } catch (error) {
        console.error('Virhe poistettaessa tapahtumaa:', error);
      }
    },
    async confirmXgDialog() {
      if (this.pendingEvent) {
        this.pendingEvent.xg = Number(this.xgValue.toFixed(3));
        const eventid = await this.saveSingleEvent(this.pendingEvent); // jos haluat tallentaa heti
        //this.saveSingleEvent(this.pendingEvent); // jos haluat tallentaa heti
        this.pendingEvent.eventId = eventid;
        this.events.push(this.pendingEvent);

        if (this.pendingGoalEvent) {
          this.pendingGoalEvent.eventId = this.pendingEvent.eventId;
          
          //console.log('Tallennetaan maali tapahtuma xG jälkeen:', this.pendingGoalEvent);
          
          this.saveGoalEvent(this.pendingGoalEvent);
          
          this.goalevents.push(this.pendingGoalEvent);
          this.pendingGoalEvent = null;
        }
        this.pendingEvent = null;
      }
      this.xgDialog = false;
      this.emptyEventData();
    },
    async confirmPenaltyDialog() {
      if (this.pendingEvent) {

        console.log('Tallennetaan jäähy tapahtuma:', this.pendingEvent, 'Jäähyn pituus:', this.penaltyLength);
        this.pendingEvent.penaltyLength = this.penaltyLength;
        const eventid = await this.saveSingleEvent(this.pendingEvent); // jos haluat tallentaa heti

        this.pendingEvent.eventid = eventid;
        this.events.push(this.pendingEvent);

        this.pendingEvent = null;
        this.penaltyLength = null;
      }
      this.penaltyDialog = false;
      this.emptyEventData();
    },
    async confirmPenaltyshotDialog() {
      if (this.pendingEvent) {

        console.log('Tallennetaan rankkaritapahtuma:', this.pendingEvent, 'Lopputulema:', this.penaltyshotResult);
        this.pendingEvent.action = this.penaltyshotResult;
        const eventid = await this.saveSingleEvent(this.pendingEvent); // jos haluat tallentaa heti

        this.pendingEvent.eventid = eventid;
        this.events.push(this.pendingEvent);

        if (this.penaltyshotResult === "maali") {
          if (this.selectedPlayer.playerId < 100 || this.selectedPlayer.playerId > 100) {
              this.goalData.goalScoringTeam = 1;
            }
          else {
              this.goalData.goalScoringTeam = 0;
          }
          this.goalData.scoringPlayer = this.selectedPlayer;
          this.goalData.type = 'rangaistuslaukaus';

          const goalEvent = {
            eventId: eventid,
            gameId: this.gameId,
            ownteam: this.goalData.goalScoringTeam,
            scorerId: this.goalData.scoringPlayer.playerId,
            scorerName: this.goalData.scoringPlayer.name,
            scorerNumber: this.goalData.scoringPlayer.number,
            assistId: null,
            assistName: null,
            assistNumber: null,
            evenstrength: 1,
            shorthanded: 0,
            powerplay: 0,
            penaltyshot: 1,
            period: this.selectedPeriod,
            scoringtype: this.goalData.type,
            tacticalsituation: null,
            ownplayersinfield: null,
            owngoal: 0,
          };
          this.pendingGoalEvent = goalEvent;
          console.log('Tallennetaan maali tapahtuma rankkarista:', this.pendingGoalEvent);
          this.saveGoalEvent(this.pendingGoalEvent);
          
          this.goalevents.push(goalEvent);
        }

        this.pendingEvent = null;
        this.pendingGoalEvent = null;

        this.penaltyshotDialog = false;
        this.emptyEventData();
      }
    },
    async confirmSaveGamePlayers() {
      if (confirm('Tallennetaanko tilastot? Kaikki ottelun tilastot täytyy olla syötettynä.')) {
        await this.saveGamePlayers();
        await this.saveGameGoalies();
      }
    },
    async saveGamePlayers() {
      const authStore = useAuthStore();
      const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8'; // Vaihda omaan avaimeseesi

      // Muodosta tallennettava lista
      const gamePlayers = this.playerGameStats.map(player => ({
        gameId: player.gameId,
        playerId: player.playerId,
        playerName: player.playerName,
        playerNumber: player.playerNumber,
        shot_goal: player.shot_goal,
        shot_saved: player.shot_saved,
        shot_blocked: player.shot_blocked,
        shot_missed: player.shot_missed,
        xg: Number(player.xg.toFixed(3)),
        blocked_shot: player.blocked_shot,
        goal: player.goal,
        assist: player.assist,
        point: player.point,
        powerplaygoal: player.powerplaygoal,
        shorthandedgoal: player.shorthandedgoal,
        penaltyshotgoal: player.penaltyshotgoal,
        penaltyshotattempt: player.penaltyshotattempt,
        plus_goal: player.plus_goal,
        minus_goal: player.minus_goal,
        plusminus: player.plusminus,
        penalty_2m: player.penalty_2m,
        penalty_10m: player.penalty_10m,
        penalty_20m: player.penalty_20m
      }));
      
      console.log('Saving game players to backend:', gamePlayers);
      try {
        const response = await fetch(`${config.apiUrl}/gameplayer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(gamePlayers)
        });
        if (!response.ok) {
          throw new Error('GamePlayer-tallennus epäonnistui');
        }
        const data = await response.json();
        console.log('GamePlayers saved to backend:', data);
        alert('Pelaajatilastot tallennettu!');
      } catch (error) {
        console.error('Virhe GamePlayer-tallennuksessa:', error);
        alert('Virhe pelaajatilastojen tallennuksessa!');
      }
    },
    async saveGameGoalies() {
      const authStore = useAuthStore();
      const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8'; // Vaihda omaan avaimeseesi

      // Muodosta tallennettava lista
      const gameGoalies = this.goalieStats.map(goalie => ({
        gameId: this.gameId,
        playerId: goalie.playerId || goalie.number, // käytä playerId jos löytyy, muuten numero
        playerName: goalie.name,
        playerNumber: goalie.number,
        saves: goalie.saves,
        goals_against: goalie.goalsAgainst,
        xg_against: Number(goalie.xgAgainst.toFixed(3)),
        assists: goalie.assists,
        penalty_2m: goalie.penalty_2m,
        penalty_10m: goalie.penalty_10m,
        penalty_20m: goalie.penalty_20m
      }));

      try {
        const response = await fetch(`${config.apiUrl}/gamegoalie`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(gameGoalies)
        });
        if (!response.ok) {
          throw new Error('GameGoalie-tallennus epäonnistui');
        }
        const data = await response.json();
        console.log('GameGoalies saved to backend:', data);
        alert('Maalivahtitilastot tallennettu!');
      } catch (error) {
        console.error('Virhe GameGoalie-tallennuksessa:', error);
        alert('Virhe maalivahtitilastojen tallennuksessa!');
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
      },
      checkToken() {
        const authStore = useAuthStore();

        if (authStore.isTokenExpired()) {
          console.log('Token on vanhentunut. Kirjaa käyttäjä ulos.');
          authStore.logout(); // Kirjaa käyttäjä ulos tai uudista token
        } else {
          console.log('Token on voimassa.');
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

.marker.oma\ maali {
  background-color: orange;
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

.player-list, .action-list, .blocker-player-list, .goalie-list, .period-list {
  list-style-type: none;
  padding: 10;
}
.player-list {
  width: 240px; /* Voit säätää tätä arvoa tarpeen mukaan */
}

.action-list {
  width: 130px; /* Voit säätää tätä arvoa tarpeen mukaan */
}

.blocker-player-list {
  width: 200px; /* Voit säätää tätä arvoa tarpeen mukaan */
}
.player-list li, .action-list li, .blocker-player-list li, .goalie-list li, .period-list li {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  margin: 4px 0;
}
.player-list li.selected, .action-list li.selected, .blocker-player-list li.selected, .goalie-list li.selected, .period-list li.selected {
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
    margin-bottom: 2px;

}

.rounded-card-action {
    border-radius: 15px;
    height: 30px;
    width: 95px;
    padding-left: 15%;
    padding-right: 5%;
    padding-top: 2px;
    margin-bottom: 2px;
}

.rounded-card-period {
  border-radius: 25px;
    height: 30px;
    width: 55px;
    padding-left: 10%;
    padding-right: 10%;
    margin-bottom: 2px;

}


</style>
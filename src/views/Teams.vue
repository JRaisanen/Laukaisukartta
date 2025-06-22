<template>
    <div class="container">
        <h2>Valitse joukkue:</h2>
        <v-divider :thickness="10"></v-divider>

        <v-sheet class="responsive-sheet mx-auto">
          <v-slide-group show-arrows>
              <v-slide-group-item 
              v-for="team in teamStore.teams"
              :key="team.teamId"
              v-slot="{ isSelected, toggle }"
              >
              <v-btn 
                  :color="isSelected ? 'primary' : undefined"
                  :class="{ 'selected-btn': teamStore.selectedTeam && teamStore.selectedTeam.teamId === team.teamId,
                          'ma-2': teamStore.selectedTeam && teamStore.selectedTeam.teamId !== team.teamId }"
                  rounded
                  @click="fetchTeamSeasons(team.teamId)"
              >
                  {{ team.name }}
              </v-btn>
              </v-slide-group-item>
          </v-slide-group>
        </v-sheet>

        <div>
          <v-dialog v-model="teamdialog" max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                v-on="on"
                color="surface-variant"
                text="Uusi joukkue"
                variant="flat"
                :disabled="!authStore.isAuthenticated" 
              ></v-btn>
              <v-btn
                color="error"
                text="Poista joukkue"
                variant="flat"
                class="ml-2"
                :disabled="!authStore.isAuthenticated || !teamStore.selectedTeam"
                @click="deleteTeam"
              ></v-btn>            
            </template>

            <v-card>
              <v-card-title>
                <span class="headline">Uusi joukkue</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="valid">
                  <v-text-field
                    v-model="newTeam.name"
                    label="Joukkueen nimi"
                    :rules="[v => !!v || 'Nimi on pakollinen']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="newTeam.weburl"
                    label="Tulospalvelu URL"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text="Tallenna"
                  @click="saveTeam"
                ></v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  text="Peruuta"
                  @click="teamdialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
        </v-dialog>
      </div>


      <div v-if="teamStore.selectedTeam">
        <h2>{{ teamStore.selectedTeam.name }} kaudet</h2>

        <v-sheet class="responsive-sheet mx-auto">
          <v-slide-group show-arrows>
              <v-slide-group-item 
              v-for="teamSeason in teamStore.teamSeasons"
              :key="teamSeason.seasonId"
              v-slot="{ isSelected, toggle }"
              >
              <v-btn 
                  :color="isSelected ? 'primary' : undefined"
                  :class="{ 'selected-btn': teamStore.selectedTeamSeason && teamStore.selectedTeamSeason.seasonId === teamSeason.seasonId,
                          'ma-2': teamStore.selectedTeamSeason && teamStore.selectedTeamSeason.seasonId !== teamSeason.seasonId }"
                  rounded
                  @click="fetchPlayers(teamSeason.teamId, teamSeason.seasonId)"
              >
                  {{ teamSeason.name }}
              </v-btn>
              </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </div>

      <div>
        <v-dialog v-model="teamseasondialog" max-width="500">
          <template v-slot:activator="{ props: activatorPropsit }">
            <v-btn
              v-bind="activatorPropsit"
              v-on="on2"
              color="surface-variant"
              text="Uusi kausi"
              variant="flat"
              :disabled="!authStore.isAuthenticated"
            ></v-btn>
            <v-btn
              color="error"
              text="Poista kausi"
              variant="flat"
              class="ml-2"
              :disabled="!authStore.isAuthenticated || !teamStore.selectedTeamSeason"
              @click="deleteSeason"
            ></v-btn>            
          </template>

          <v-card>
            <v-card-title>
              <span class="headline">Uusi kausi</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="formTeamSeason" v-model="validTeamSeason">
                <v-text-field
                  v-model="newTeamSeason.name"
                  label="Kauden nimi"
                  :rules="[v => !!v || 'Nimi on pakollinen']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newTeamSeason.weburl"
                  label="Tulospalvelu URL"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text="Tallenna"
                @click="saveTeamSeason"
              ></v-btn>
              <v-spacer></v-spacer>
              <v-btn
                text="Peruuta"
                @click="teamseasondialog = false"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <div>
        <v-data-table         
            :headers="headers"
            :hide-default-header="false"
            :items="teamStore.players"
            :no-data-text="no_results_text"
            :items-per-page="-1"
            :hide-default-footer="true"
            density="compact"
            class="responsive-table">
          <template v-slot:item.action="{ item }">
            <div class="action-buttons">
              <v-btn v-if="authStore.isAuthenticated" icon @click="editPlayer(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn v-if="authStore.isAuthenticated" icon @click="deletePlayer(item.playerId)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>            
            </div> 
          </template>
        </v-data-table>

        <div>
          <v-dialog v-model="playerdialog" max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                v-on="on"
                color="surface-variant"
                text="Uusi pelaaja"
                variant="flat"
                :disabled="!authStore.isAuthenticated"
              ></v-btn>
            </template>

            <v-card>
              <v-card-title>
                <span class="headline">{{ isEditingPlayer ? 'Muokkaa pelaajaa' : 'Uusi pelaaja' }}</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="validPlayer">
                  <v-text-field
                    v-model="newPlayer.name"
                    label="Pelaajan nimi"
                    :rules="[v => !!v || 'Nimi on pakollinen']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="newPlayer.number"
                    label="Pelaajan numero"
                    :rules="[v => !!v || 'Numero on pakollinen']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="newPlayer.weburl"
                    label="Tulospalvelu URL"
                  ></v-text-field>
                  <v-checkbox
                    v-model="newPlayer.active"
                    label="Aktiivinen"
                    :true-value="1"
                    :false-value="0"
                ></v-checkbox>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text="Tallenna"
                  @click="savePlayer"
                ></v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  text="Peruuta"
                  @click="playerdialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
        </v-dialog>
      </div>

        <v-divider :thickness="10"></v-divider>

        <v-data-table         
            :headers="goalieHeaders"
            :hide-default-header="false"
            :items="teamStore.goalies"
            :no-data-text="no_results_text_goalies"
            :items-per-page="-1"
            :hide-default-footer="true"
            density="compact"
            class="responsive-table">
          <template v-slot:item.action="{ item }">
            <div class="action-buttons">
              <v-btn  v-if="authStore.isAuthenticated" icon @click="editGoalie(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn  v-if="authStore.isAuthenticated" icon @click="deleteGoalie(item.playerId)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>

        <div>
          <v-dialog v-model="goaliedialog" max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                v-on="on"
                color="surface-variant"
                text="Uusi maalivahti"
                variant="flat"
                :disabled="!authStore.isAuthenticated"
              ></v-btn>
            </template>

            <v-card>
              <v-card-title>
                <span class="headline">{{ isEditingGoalie ? 'Muokkaa maalivahtia' : 'Uusi maalivahti' }}</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="validGoalie">
                  <v-text-field
                    v-model="newGoalie.name"
                    label="Maalivahdin nimi"
                    :rules="[v => !!v || 'Nimi on pakollinen']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="newGoalie.number"
                    label="Maalivahdin numero"
                    :rules="[v => !!v || 'Numero on pakollinen']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="newGoalie.weburl"
                    label="Tulospalvelu URL"
                  ></v-text-field>
                  <v-checkbox
                    v-model="newGoalie.active"
                    label="Aktiivinen"
                    :true-value="1"
                    :false-value="0"
                ></v-checkbox>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  text="Tallenna"
                  @click="saveGoalie"
                ></v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  text="Peruuta"
                  @click="goaliedialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
        </v-dialog>
      </div>

      </div>

    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useTeamStore } from '../stores/teamStore';
  import { useAuthStore } from '../stores/authStore'; // Tuo authStore

  export default {
    name: 'Teams',
    setup() {
      const teamStore = useTeamStore();
      const authStore = useAuthStore(); // Käytä authStorea
      const teamdialog = ref(false);
      const teamseasondialog = ref(false);
      const playerdialog = ref(false);
      const goaliedialog = ref(false);
      const valid = ref(false);
      const validTeamSeason = ref(false);
      const validPlayer = ref(false);
      const validGoalie = ref(false);
      const newTeam = ref({ name: '', weburl: '' });
      const newTeamSeason = ref({ name: '', weburl: '' });
      const newPlayer = ref({ name: '', number: '', weburl: '', active: 1 });
      const newGoalie = ref({ name: '', number: '', weburl: '', active: 1 });
      const isEditingPlayer = ref(false);
      const isEditingGoalie = ref(false);

      teamStore.fetchTeams();
  
      const fetchPlayers = async (teamId, seasonId) => {
        await teamStore.fetchPlayers(teamId, seasonId);
        //console.log('Valittu joukkue:', teamId);
        console.log('Pelaajat:', teamStore.players);
        console.log('Maalivahdit:', teamStore.goalies);
        };

      const fetchTeamSeasons = async (teamId) => {
        await teamStore.fetchTeamSeasons(teamId);
        console.log('Valittu joukkue nyt:', teamId);
        // Hae pelaajat valitulle joukkueelle ja kaudelle (voi olla tyhjä)
        if (teamStore.selectedTeam && teamStore.selectedTeamSeason) {
          await fetchPlayers(teamStore.selectedTeam.teamId, teamStore.selectedTeamSeason.seasonId);
        }

        //console.log('Pelaajat:', teamStore.players);
        //console.log('Maalivahdit:', teamStore.goalies);
      };

      const saveTeam = async () => {
        if (valid.value) {
          await teamStore.addTeam(newTeam.value);
          teamdialog.value = false;
          newTeam.value.name = '';
          newTeam.value.weburl = '';
          // Hae uuden joukkueen kaudet (yleensä yksi uusi kausi luodaan samalla)
          await teamStore.fetchTeamSeasons(teamStore.selectedTeam.teamId);
          // Hae pelaajat valitulle joukkueelle ja kaudelle (voi olla tyhjä)
          if (teamStore.selectedTeam && teamStore.selectedTeamSeason) {
            await fetchPlayers(teamStore.selectedTeam.teamId, teamStore.selectedTeamSeason.seasonId);
          }
        }
      };

      const saveTeamSeason = async () => {
        if (validTeamSeason.value) {
          const teamSeasonData = {
            ...newTeamSeason.value,
            teamId: teamStore.selectedTeam.teamId
          };
          await teamStore.addTeamSeason(teamSeasonData);
          teamseasondialog.value = false;
          newTeamSeason.value.name = '';
          newTeamSeason.value.weburl = '';
          // Hae päivitetyt kaudet
          await teamStore.fetchTeamSeasons(teamStore.selectedTeam.teamId);
          // Hae pelaajat valitulle joukkueelle ja uudelle kaudelle (voi olla tyhjä)
          if (teamStore.selectedTeam && teamStore.selectedTeamSeason) {
            await fetchPlayers(teamStore.selectedTeam.teamId, teamStore.selectedTeamSeason.seasonId);
          }
        }
      };

      const deleteSeason = async () => {
        if (!teamStore.selectedTeamSeason) return;
        if (!confirm('Haluatko varmasti poistaa valitun kauden?')) return;
        try {
          await teamStore.deleteTeamSeason(teamStore.selectedTeamSeason.seasonId);

          alert('Kausi poistettu!');
        } catch (e) {
          alert('Kauden poisto epäonnistui.');
          console.error(e);
        }
      };

      const deleteTeam = async () => {
        if (!teamStore.selectedTeam) return;
        if (!confirm('Haluatko varmasti poistaa valitun joukkueen?')) return;
        try {
          await teamStore.deleteTeam(teamStore.selectedTeam.teamId);

          alert('Joukkue poistettu!');
        } catch (e) {
          alert('Joukkueen poisto epäonnistui.');
          console.error(e);
        }
      };

      const savePlayer = async () => {
        console.log('Pelaajan tallennusta kutsuttu' + validPlayer.value);
        if (validPlayer.value) {
          const playerData = {
            ...newPlayer.value,
            teamId: teamStore.selectedTeam.teamId,
            seasonId: teamStore.selectedTeamSeason.seasonId,
            isgoalie: 0
          };
          if (isEditingPlayer.value) {
            console.log('Pelaajan päivitystä kutsuttu');
            await teamStore.updatePlayer(playerData);
          } else {
            console.log('Pelaajan lisäystä kutsuttu');
            await teamStore.addPlayer(playerData);
          }
          //await teamStore.addPlayer(playerData);
          playerdialog.value = false;
          newPlayer.value.name = '';
          newPlayer.value.number = '';
          newPlayer.value.weburl = '';
          newPlayer.value.active = 1;
          isEditingPlayer.value = false;
        }
      };

      const saveGoalie = async () => {
        console.log('Maalivahdin tallennusta kutsuttu' + validGoalie.value);
        if (validGoalie.value) {
          const playerData = {
            ...newGoalie.value,
            teamId: teamStore.selectedTeam.teamId,
            seasonId: teamStore.selectedTeamSeason.seasonId,
            isgoalie: 1
          };
          console.log('Pelaajan tallennusta kutsuttu #2');
          if (isEditingGoalie.value) {
            await teamStore.updatePlayer(playerData);
          } else {
            await teamStore.addPlayer(playerData);
          }
          //await teamStore.addPlayer(playerData);
          goaliedialog.value = false;
          newGoalie.value.name = '';
          newGoalie.value.number = '';
          newGoalie.value.weburl = '';
          newGoalie.value.active = 1;
          isEditingGoalie.value = false;
        }
      };
      
      const editPlayer = (player) => {
        newPlayer.value = { ...player };
        isEditingPlayer.value = true;
        playerdialog.value = true;
      };

      const editGoalie = (goalie) => {
        newGoalie.value = { ...goalie };
        isEditingGoalie.value = true;
        goaliedialog.value = true;
      };

      const deletePlayer = async (playerId) => {
        await teamStore.deletePlayer(playerId);
        await fetchPlayers(teamStore.selectedTeam.teamId, teamStore.selectedTeamSeason.seasonId);
      };

      const deleteGoalie = async (playerId) => {
        await teamStore.deletePlayer(playerId);
        await fetchPlayers(teamStore.selectedTeam.teamId, teamStore.selectedTeamSeason.seasonId);
      };


      return {
        teamStore,
        authStore,
        fetchTeamSeasons,
        fetchPlayers,
        teamdialog,
        teamseasondialog,
        playerdialog,
        goaliedialog,
        valid,
        validTeamSeason,
        validPlayer,
        validGoalie,
        newTeam,
        newTeamSeason,
        newPlayer,
        newGoalie,
        saveTeam,
        deleteTeam,
        saveTeamSeason,
        deleteSeason,
        savePlayer,
        saveGoalie,
        editPlayer,
        editGoalie,
        deletePlayer,
        deleteGoalie,
        headers: [
          { title: 'Numero', value: 'number', sortable: true},
          { title: 'Pelaaja', value: 'name', sortable: false },
          //{ title: 'Weburl', value: 'weburl', sortable: true },
          { title: 'Toiminnot', value: 'action', sortable: false }
        ],
        goalieHeaders: [
          { title: 'Numero', value: 'number', sortable: true},
          { title: 'Pelaaja', value: 'name', sortable: false },
          //{ title: 'Weburl', value: 'weburl', sortable: true },
          { title: 'Toiminnot', value: 'action', sortable: false }
        ],
        no_results_text: "Ei pelaajia",
        no_results_text_goalies: "Ei maalivahteja",
      };
    },
  };
  </script>
  
  <style scoped>
  /* Tyylit tähän */
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    cursor: pointer;
    padding: 5px;
    margin: 5px 0;
    background-color: #f0f0f0;
  }
  
  li:hover {
    background-color: #e0e0e0;
  }

  .selected-btn {
    background-color: #1976d2;
    color: white;
    margin-top: 9px;
  }
  .action-buttons {
    display: flex;
    gap: 8px;
  }

  </style>
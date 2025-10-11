import { defineStore } from 'pinia';
import config from '../../config'; // Tuo konfiguraatiotiedosto
import { useAuthStore } from './authStore'; // Tuo authStore

const API_KEY = 'ffksdl-asdfd-sdfllsdfdk-954dsfdj-23jhs8'; // Korvaa tämä omalla API-avaimellasi

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: [] as { teamId: number; name: string }[],
    teamSeasons: [] as { seasonId: number; teamId: number; name: string; weburl: string }[],
    player: [] as { playerId: number, seasonId: number; teamId: number; name: string; number: number; weburl: string }[],
    players: [] as any[],
    goalies: [] as any[],
    selectedTeam: null as { teamId: number, name: string } | null | undefined,
    selectedTeamSeason: null as { seasonId: number; teamId: number, name: string } | null | undefined,
    currentGameId: null as string | null,
  }),
  actions: {
    async fetchTeams() {
      try {
        console.log(config.apiUrl);
        const response = await fetch(`${config.apiUrl}/teams`, {
          headers: {
            'x-api-key': config.apiKey
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.teams = data;
        console.log('Fetched teams:', data); // Lisätty selkeämpi loggaus

        if (this.teams.length == 1) {
            this.selectedTeam = this.teams[0];
            await this.fetchTeamSeasons(this.teams[0].teamId);
        }
        else {
            // Tarkista, onko tallennettu joukkue valittu
            const savedTeamId = localStorage.getItem('selectedTeamId');

            if (savedTeamId) {
                this.selectedTeam = this.teams.find(team => team.teamId.toString() === savedTeamId);
                if (this.selectedTeam) {
                        console.log('Löyty' + this.selectedTeam);
                    await this.fetchTeamSeasons(this.selectedTeam.teamId);
                }
            }
            console.log('Fetched teams:', data); // Lisätty selkeämpi loggaus
        }

      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    },
    async fetchTeamSeasons(teamId: number) {
      try {
        const response = await fetch(`${config.apiUrl}/teamseasons/${teamId}`, {
          headers: {
            'x-api-key': config.apiKey
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.teamSeasons = data;
        console.log('debug fetchTeamSeasons');
        console.log('Fetched teamSeasons:', data); // Lisätty selkeämpi loggaus

        this.selectedTeam = this.teams.find(team => team.teamId === teamId);

        if (this.teamSeasons.length == 1) {
            this.selectedTeamSeason = this.teamSeasons[0];
            await this.fetchPlayers(teamId, this.teamSeasons[0].seasonId);
        }
        else {
            // Tarkista, onko tallennettu joukkue valittu
            const savedTeamSeasonId = localStorage.getItem('selectedTeamSeasonId');

            if (savedTeamSeasonId) {
                this.selectedTeamSeason = this.teamSeasons.find(teamSeason => teamSeason.seasonId.toString() === savedTeamSeasonId);
                if (this.selectedTeamSeason) {
                        console.log('Löytyx' + this.selectedTeamSeason);
                    await this.fetchPlayers(teamId, this.selectedTeamSeason.seasonId);
                }
            }
            //console.log('Fetched teams seasons:', this.selectedTeamSeason.name); // Lisätty selkeämpi loggaus
        }

      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    },
    async fetchPlayers(teamId: number, seasonId: number) {
        try {
          this.selectedTeam = this.teams.find(team => team.teamId === teamId);
          this.selectedTeamSeason = this.teamSeasons.find(teamSeason => teamSeason.seasonId === seasonId);

          const response = await fetch(`${config.apiUrl}/players/${seasonId}`, {
            headers: {
              'x-api-key': config.apiKey
            }
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          this.players = data;
          console.log('TeamStore.fetchPlayers: Fetched players:', data); // Lisätty selkeämpi loggaus
          
          const responseG = await fetch(`${config.apiUrl}/goalies/${seasonId}`, {
            headers: {
              'x-api-key': config.apiKey
            }
          });
          if (!responseG.ok) {
            throw new Error('Network response was not ok');
          }
          console.log(responseG);
          const dataG = await responseG.json();
          this.goalies = dataG;
          console.log('TeamStore.fetchPlayers: Fetched goalies:', dataG); // Lisätty selkeämpi loggaus


          localStorage.setItem('selectedTeamId', teamId.toString()); // Tallenna valittu joukkue
          localStorage.setItem('selectedTeamSeasonId', seasonId.toString()); // Tallenna valittu kausi

          console.log('Saved' + teamId);

        } catch (error) {
          console.error('Error fetching players:', error);
        }
    },
    async addTeam(newTeam: { name: string, weburl?: string }) {
      const authStore = useAuthStore(); // Hae authStore
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        const response = await fetch(`${config.apiUrl}/teams/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          },
          body: JSON.stringify(newTeam)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.teams.push(data);
        console.log('Added new team:', data);
      } catch (error) {
        console.error('Error adding team:', error);
      }
    },
    async addTeamSeason(newTeamSeason: { teamId: number, name: string, weburl?: string }) {
      const authStore = useAuthStore(); // Hae authStore
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        console.log(JSON.stringify(newTeamSeason));
        const response = await fetch(`${config.apiUrl}/teamseasons/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          },
          body: JSON.stringify(newTeamSeason)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.teamSeasons.push(data);
        console.log('Added new teamseason:', data);
      } catch (error) {
        console.error('Error adding teamseason:', error);
      }
    },
    async addPlayer(newPlayer: { teamId: number, seasonId: number, name: string, number: number, weburl?: string, isgoalie: number, active: number }) {
      const authStore = useAuthStore(); // Hae authStore
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        console.log(JSON.stringify(newPlayer));
        const response = await fetch(`${config.apiUrl}/player/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          },
          body: JSON.stringify(newPlayer)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (newPlayer.isgoalie == 0) {
          this.players.push(data);
        }
        else {
          this.goalies.push(data);
        }

        console.log('Added new player:', data);
      } catch (error) {
        console.error('Error adding player:', error);
      }
    },
    async addGoalie(newPlayer: { teamId: number, seasonId: number, name: string, number: number, weburl?: string, active: number }) {
      const authStore = useAuthStore(); // Hae authStore
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        console.log(JSON.stringify(newPlayer));
        const response = await fetch(`${config.apiUrl}/goalie/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          },
          body: JSON.stringify(newPlayer)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.goalies.push(data);
        console.log('Added new player:', data);
      } catch (error) {
        console.error('Error adding player:', error);
      }
    },
    async deletePlayer(playerId: number) {
      const authStore = useAuthStore(); // Hae authStore
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        console.log('Deleting player:', playerId);
        const response = await fetch(`${config.apiUrl}/player/${playerId}`, {
          method: 'DELETE',
          headers: {
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.players = this.players.filter(player => player.playerId !== playerId);
        this.goalies = this.goalies.filter(goalie => goalie.playerId !== playerId);
        console.log('Deleted player with id:', playerId);
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    },
    async updatePlayer(updatedPlayer: { playerId: number, teamId: number, seasonId: number, name: string, number: number, weburl?: string, isgoalie: number, active: number }) {
      const authStore = useAuthStore(); // Hae authStore
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        console.log(JSON.stringify(updatedPlayer));
        const response = await fetch(`${config.apiUrl}/player/${updatedPlayer.playerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${authStore.token}` // Lisää token otsikoihin
          },
          body: JSON.stringify(updatedPlayer)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (updatedPlayer.isgoalie == 0) {
          const index = this.players.findIndex(player => player.playerId === updatedPlayer.playerId);
          if (index !== -1) {
            this.players[index] = data;
          }
        } else {
          const index = this.goalies.findIndex(goalie => goalie.playerId === updatedPlayer.playerId);
          if (index !== -1) {
            this.goalies[index] = data;
          }
        }
        console.log('Updated player:', data);
      } catch (error) {
        console.error('Error updating player:', error);
      }
    },
    async deleteTeamSeason(seasonId: number) {
      const authStore = useAuthStore();
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        // 1. Poista kausi
        const seasonRes = await fetch(`${config.apiUrl}/teamseasons/${seasonId}`, {
          method: 'DELETE',
          headers: {
            'x-api-key': config.apiKey,
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (!seasonRes.ok) throw new Error('Kauden poisto epäonnistui');

        // Päivitä tilat
        this.teamSeasons = this.teamSeasons.filter(season => season.seasonId !== seasonId);
        if (this.selectedTeamSeason?.seasonId === seasonId) {
          this.selectedTeamSeason = null;
          this.players = [];
          this.goalies = [];
        }
        console.log('Kausi ja siihen liittyvät ottelut sekä tapahtumat poistettu.');
      } catch (error) {
        console.error('Error deleting team season:', error);
      }
    },
    async deleteTeam(teamId: number) {
      const authStore = useAuthStore();
      if (authStore.isTokenExpired()) {
        console.error('Token has expired');
        return;
      }
      try {
        const response = await fetch(`${config.apiUrl}/teams/${teamId}`, {
          method: 'DELETE',
          headers: {
            'x-api-key': config.apiKey,
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (!response.ok) throw new Error('Joukkueen poisto epäonnistui');

        // Päivitä tilat
        this.teams = this.teams.filter(team => team.teamId !== teamId);
        if (this.selectedTeam?.teamId === teamId) {
          this.selectedTeam = null;
          this.selectedTeamSeason = null;
          this.teamSeasons = [];
          this.players = [];
          this.goalies = [];
        }
        console.log('Joukkue ja kaikki siihen liittyvät tiedot poistettu.');
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    },
    selectTeam(team: { teamId: number; name: string }) {
      this.selectedTeam = team;
      localStorage.setItem('selectedTeamId', team.teamId.toString()); // Tallenna valittu joukkue
    },
    
    setCurrentGameId(gameId: string | null) {
      this.currentGameId = gameId;
    },
  }
});
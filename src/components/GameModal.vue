<template>
    <v-dialog
      :value="isOpen"
      @input="updateIsOpen"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Lisää uusi ottelu</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="game.name"
              label="Ottelun nimi"
              placeholder="Esim. SaiPa - EräViikingit"
              required
            />
            <v-text-field
              v-model="game.shortname"
              label="Lyhyt nimi"
              placeholder="Esim. SaSu-ErVi"
              required
            />
            <v-select
              v-model="game.teamId"
              :items="teams"
              item-text="name"
              item-value="teamId"
              label="Valitse joukkue"
              required
            />
            <v-select
              v-model="game.seasonId"
              :items="seasons"
              item-text="name"
              item-value="seasonId"
              label="Valitse kausi"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveGame">Tallenna</v-btn>
          <v-btn text @click="close">Peruuta</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import { useTeamStore } from '../stores/teamStore';
  
  export default {
    props: {
      isOpen: Boolean,
    },
    data() {
      const teamStore = useTeamStore();
      console.log('Ikkuna avattu');
      return {
        game: {
          name: '',
          shortname: '',
          teamId: null,
          seasonId: null,
        },
        teams: teamStore.teams,
        seasons: teamStore.teamSeasons,
      };
    },
    methods: {
      updateIsOpen(value) {
        console.log('Ikkuna avattu');
        this.$emit('update:isOpen', value);
      },
      close() {
        this.updateIsOpen(false);
      },
      saveGame() {
        if (this.$refs.form.validate()) {
          this.$emit('save', this.game);
          this.close();
        }
      },
    },
  };
  </script>
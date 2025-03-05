<!-- src/components/ActionBar.vue 
       <RouterLink to="/kliikki">Uusi ottelu</RouterLink>
-->
<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click.stop="toggleDrawer"></v-app-bar-nav-icon>
    <v-toolbar-title>SaiPa/Sudet kausi 24/25</v-toolbar-title>
    <v-btn :to="{ name: 'GameView' }" exact>
      Laukaisukartta
    </v-btn>
    <v-btn :to="{ name: 'StatsView' }" exact>
      Tilastot
    </v-btn>
    <v-spacer></v-spacer>
    <v-menu offset-y>
      <v-list>
        <v-list-item :to="{ name: 'TeamSwitch' }">
          <v-list-item-title>Joukkueen vaihto</v-list-item-title>
        </v-list-item>
        <v-list-item :to="{ name: 'TeamManagement' }">
          <v-list-item-title>Joukkueen ylläpito</v-list-item-title>
        </v-list-item>
        <v-list-item :to="{ name: 'Settings' }">
          <v-list-item-title>Asetukset</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { VAppBar, VAppBarNavIcon, VToolbarTitle, VSpacer, VBtn, VMenu, VList, VListItem, VListItemTitle, VIcon } from 'vuetify/components'

const props = defineProps({
  drawer: Boolean
})

const emit = defineEmits(['update:drawer'])

const toggleDrawer = () => {
  emit('update:drawer', !props.drawer)
}
</script>

<style scoped>
.v-btn {
  color: white;
}

.v-btn.router-link-exact-active {
  font-weight: bold;
  color: #ffeb3b; /* Korostusväri */
}
</style>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import { VAppBar, VAppBarNavIcon, VToolbarTitle, VSpacer, VBtn, VMenu, VList, VListItem, VListItemTitle, VIcon } from 'vuetify/components'
import { useTeamStore } from './stores/teamStore'
import { useAuthStore } from './stores/authStore'; // Tuo authStore

const drawer = ref(false)
const teamStore = useTeamStore()
const authStore = useAuthStore(); // Käytä authStorea
const router = useRouter(); // Käytä useRouteria

const logout = () => {
  authStore.logout();
  // Ohjaa käyttäjä kirjautumissivulle
  router.push('/login');
};

</script>
<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-btn icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title>
      {{ teamStore.selectedTeam?.name || 'Valitse joukkue' }} - 
      {{ teamStore.selectedTeamSeason?.name || 'Valitse kausi' }}
    </v-toolbar-title>
      <v-btn :disabled="!teamStore.selectedTeam" @click="$router.push('/matches')">Ottelut</v-btn>
      <v-btn :disabled="!teamStore.selectedTeam" @click="$router.push('/gameview')">Laukaisukartta</v-btn>
      <v-btn :disabled="!teamStore.selectedTeam" @click="$router.push('/statsgameview')">Tilastot</v-btn>
      <v-btn :disabled="!teamStore.selectedTeam" @click="$router.push('/statsview')">Tilastot (old)</v-btn>
      <!--<v-btn text @click="$router.push('/kliikki')">Uusi ottelu</v-btn>-->
    </v-app-bar>
      <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item to="/teams" title="Joukkueet" prepend-icon="mdi-tools" @click="drawer = false"></v-list-item>
        <v-list-item 
          :disabled="!teamStore.selectedTeam || !authStore.isAuthenticated" 
          to="/gamesview" 
          title="Otteluiden ylläpito" 
          prepend-icon="mdi-database"
          @click="drawer = false">
        </v-list-item>
        <v-list-item :disabled="!teamStore.selectedTeam || !authStore.isAuthenticated" to="/kliikki" title="Uusi ottelu" prepend-icon="mdi-settings" @click="drawer = false"></v-list-item>
        <v-list-item v-if="authStore.isAuthenticated" @click="logout" title="Kirjaudu ulos" prepend-icon="mdi-logout"></v-list-item>
        <v-list-item v-else to="/login" title="Kirjaudu" prepend-icon="mdi-login" @click="drawer = false"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="main-content">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
<!-- 
<template>
  <v-app>
    <ActionBar :drawer.sync="drawer" />
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item>
          <v-list-item-title>Joukkueen ylläpito</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Asetukset</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-app>
</template>
-->
<!--
<template>
  <v-app>
    <ActionBar />
    <v-divider :thickness="7"></v-divider>
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-app>
</template>
<template>
  <div id="app">
    <ActionBar />
    <main> 
      <RouterView />
    </main>
  </div>
</template>
-->
<!--
<template>
  <div class="container">
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink to="/kliikki">Uusi ottelu</RouterLink>
          <RouterLink to="/gameview">Laukaisukartta</RouterLink>
          <RouterLink to="/statsview">Tilastot</RouterLink>
        </nav>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
-->

<style>

.main-content {
  padding-top: 75px; /* Varmista, että sisältö ei mene toimintovalikon alle */
}
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /*background-color: rgba(255, 255, 255, 0.8);  Valkoinen tausta, jossa 80% läpinäkyvyys */
}

header {
  line-height: 1.5;
  /*background-color: #f8f9fa;*/
  padding: 5px 0;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

main {
  flex: auto;
  padding: 5px;
}


@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .v-toolbar-title {
    font-size: 1.0em; /* Pienennä työkalupalkin otsikon tekstiä kapeammilla näytöillä */
  }

  .v-btn {
    font-size: 0.8em; /* Pienennä painikkeiden tekstiä kapeammilla näytöillä */
    padding: 4px 8px; /* Pienennä painikkeiden pehmustetta kapeammilla näytöillä */
  }

  .v-icon {
    font-size: 1.2em; /* Pienennä kuvakkeiden kokoa kapeammilla näytöillä */
  }

  nav {
    text-align: left;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 0;
  }

}

</style>
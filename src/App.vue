<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ActionBar from './components/ActionBar.vue'
</script>

<template>
  <div id="app">
    <ActionBar />
    <main> 
      <RouterView />
    </main>
  </div>
</template>

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

<style scoped>

#app {
  padding-top: 50px; /* Varmista, että sisältö ei mene toimintovalikon alle */
  width: 100%;
  margin-left: 0px;
}

main {
  padding: 0;
  align-items: center;

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
  padding: 1rem 0;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  white-space: nowrap;
  overflow-x: auto;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

main {
  flex: 1;
  padding: 1rem;
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
</style>
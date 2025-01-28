<!-- src/components/ActionBar.vue -->
<!--
<template>
    <div class="action-bar">
      <RouterLink to="/gameview">Laukaisukartta</RouterLink>
      <RouterLink to="/statsview">Tilastot</RouterLink>
      <RouterLink to="/kliikki">Kliikki</RouterLink>
    </div>
  </template>
-->
<template>
    <div class="action-bar">
       
      <RouterLink to="/gameview">Laukaisukartta</RouterLink>
      <RouterLink to="/statsview">Tilastot</RouterLink>
    </div>
  </template>

<script setup lang="ts">
  import { RouterLink } from 'vue-router'
  </script>
  
  <style scoped>
  .action-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #f8f9fa;
    display: flex;
    justify-content: space-around;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .action-bar a {
    color: #000;
    text-decoration: none;
    font-size: 14px;
  }
  
  .action-bar a.router-link-exact-active {
    font-weight: bold;
    color: #007bff;
  }
  </style>

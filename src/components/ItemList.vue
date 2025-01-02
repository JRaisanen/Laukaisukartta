<template>
    <div>
      <h1>Pelaajalista</h1>
      <ul>
        <li v-for="(player, index) in players" :key="index" @click="handleClick(player.number)">
          <span class="name">{{ player.name }}</span>
          <span class="number">{{ player.number }}</span>
        </li>
      </ul>
      <p v-if="selectedNumber">Valittu numero: {{ selectedNumber }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        players: [
          { name: 'Pelaaja 1', number: 10 },
          { name: 'Pelaaja 2', number: 20 },
          { name: 'Pelaaja 3', number: 30 },
          { name: 'Pelaaja 4', number: 40 }
        ],
        selectedNumber: null
      };
    },
    methods: {
      handleClick(number) {
        this.selectedNumber = number;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Lisää tyylit tarvittaessa */
  ul {
    list-style-type: none;
    padding: 0;
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
  
  .name {
    font-weight: bold;
  }
  
  .number {
    color: #555;
  }
  </style>
<template>
    <div>
      <h1>Player List</h1>
      <ul>
        <li v-for="(player, index) in players" :key="index">
          {{ player }}
        </li>
      </ul>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import cheerio from 'cheerio';
  
  export default {
    data() {
      return {
        players: [],
        error: null
      };
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      async fetchData() {
        try {
          const response = await axios.get('https://tulospalvelu.salibandy.fi/match/844240/lineups');
          const html = response.data;
          const $ = cheerio.load(html);
          const playerElements = $('.playerlist.col li');
          const players = [];
          playerElements.each((index, element) => {
            players.push($(element).text());
          });
          this.players = players;
        } catch (error) {
          this.error = 'Failed to fetch data';
          console.error(error);
        }
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
  }
  </style>
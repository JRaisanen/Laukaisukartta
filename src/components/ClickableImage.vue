<template>
    <div class="image-container" @click="getCoordinates">
      <img
        src="/kuva.jpg"
        alt="Clickable"
        style="cursor: pointer; max-width: 100%;"
      />
      <div
        v-for="(coord, index) in coordinates"
        :key="index"
        class="dot"
        :style="{ top: `${coord.y}px`, left: `${coord.x}px` }"
      ></div>
      <h2>Klikatut koordinaatit</h2>
        <ul>
        <li v-for="(coord, index) in coordinates" :key="index">
            X: {{ coord.x }}, Y: {{ coord.y }}
        </li>
        </ul>

    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        coordinates: []
      };
    },
    methods: {
      getCoordinates(event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.coordinates.push({ x, y });
      }
    }
  };
  </script>
  
  <style scoped>
  .image-container {
    position: relative;
    display: inline-block;
  }
  
  .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: black;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  </style>
  
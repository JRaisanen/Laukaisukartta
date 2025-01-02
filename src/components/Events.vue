<template>
    <div>
      <h1>Tallennetut tapahtumat</h1>
      <input type="file" @change="loadEvents" />
      <div v-if="events.length > 0" class="image-container">
        <img src="/kuva.jpg" alt="Field" />
        <div
          v-for="event in events"
          :key="event.id"
          :class="['marker', event.action]"
          :style="{ top: event.y + 'px', left: event.x + 'px' }"
        ></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        events: [],
      };
    },
    methods: {
      loadEvents(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              this.events = JSON.parse(e.target.result);
            } catch (error) {
              console.error('Error parsing JSON:', error);
              alert('Virhe ladattaessa tiedostoa. Varmista, että tiedosto on oikeassa muodossa.');
            }
          };
          reader.readAsText(file);
        }
      },
    },
  };
  </script>
  
  <style>
  .image-container {
    position: relative;
    display: inline-block;
    width: 100%; /* Skaalaa leveys täyttämään kontti */
    max-width: 800px; /* Maksimileveys */
    height: auto; /* Korkeus mukautuu leveyden mukaan */
  }
  .image-container img {
    width: 100%;
    height: auto;
    object-fit: cover; /* Skaalaa kuva täyttämään kontti */
  }
  .marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .marker.maali {
    background-color: green;
  }
  .marker.torjunta {
    background-color: blue;
  }
  .marker.blokki {
    background-color: yellow;
  }
  .marker.ohi {
    background-color: red;
  }
  </style>
<template>
  <div class="container">
    <div class="top-section">
      <div class="image-container" @click="getCoordinates">
        <img
          src="/kuva.jpg"
          alt="Clickable"
          style="cursor: pointer; max-width: 100%;"
        />
        <div
          v-for="(point, index) in points"
          :key="index"
          class="dot"
          :style="{ top: `${point.y}px`, left: `${point.x}px` }"
        ></div>
        <div
          v-for="(point, index) in points"
          :key="index"
          class="number"
          :style="{ top: `${point.y}px`, left: `${point.x + 15}px` }"
        >
          {{ point.number }}
        </div>
      </div>
      <div class="player-list">
        <h1>Pelaajalista</h1>
        <ul>
          <li v-for="(player, index) in players" :key="index" @click="selectPlayer(player, $event)">
            <span class="name">{{ player.name }}</span>
          </li>
        </ul>
      </div>
    </div>
      <div class="coordinates-list">
        <h1>Koordinaatit ja valitut pelaajat</h1>
        <ul>
          <li v-for="(point, index) in points" :key="index">
            X: {{ point.x }}, Y: {{ point.y }}, Numero: {{ point.number }}
          </li>
        </ul>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      players: [
        { name: 'Ronja Hämäläinen', number: 6 },
        { name: 'Mathilda Fernandez', number: 12 },
        { name: 'Miija Turunen', number: 13 },
        { name: 'Sini Luostarinen', number: 18 },
        { name: 'Amelia Ukkonen', number: 19 },
        { name: 'Emilia Suurnäkki', number: 21 },
        { name: 'Jessica Aarrevuo', number: 24 },
        { name: 'Ella Räisänen', number: 27 },
        { name: 'Netta Viinanen', number: 28 }
      ],
      selectedPlayer: null,
      points: []
    };
  },
  methods: {
    getCoordinates(event) {
      if (this.selectedPlayer) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.points.push({ x, y, number: this.selectedPlayer.number });
        this.selectedPlayer = null; // Nollaa valitun pelaajan klikkauksen jälkeen
      }
    },
    selectPlayer(player, event) {
      event.stopPropagation(); // Estää kuvan klikkaustapahtuman laukeamisen
      this.selectedPlayer = player;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.top-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px; /* Lisää väli ylä- ja alaosan väliin */
}

.image-container {
  position: relative;
  display: inline-block;
  margin-right: 20px;
}

.player-list {
  max-width: 200px; /* Voit säätää leveyttä tarpeen mukaan */
}

.coordinates-list {
  max-width: 300px; /* Voit säätää leveyttä tarpeen mukaan */
}

.dot {
  position: absolute;
  width: 2%;
  height: 5px;
  background-color: black;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.number {
  position: absolute;
  background-color: transparent; 
  padding: 2px 1px;
  border: none;
  border-radius: 1px;
  transform: translate(-50%, -50%);
}

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
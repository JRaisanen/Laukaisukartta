<template>
  <div>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  labels: Array,
  values: Array,
  title: String,
  colors: {
    type: Array,
    default: () => [
      '#1976d2', // Sininen
      '#43a047', // Vihreä
      '#fbc02d', // Keltainen
      '#e53935', // Punainen
      '#8e24aa', // Violetti
      '#00bcd4', // Syaani
      '#ff9800', // Oranssi
      '#795548', // Ruskea
      '#607d8b'  // Siniharmaa    
    ]
  }
});

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.values,
    backgroundColor: props.colors,
    borderWidth: 1
  }]
}));

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: !!props.title, text: props.title }
  }
};
</script>
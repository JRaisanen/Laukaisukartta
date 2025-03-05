import './assets/main.css'
import 'vuetify/styles' // Vuetify tyylit

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Lisää Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'; // Material Design Icons
import { aliases, mdi } from 'vuetify/iconsets/mdi' // Material Design Icons

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log(prefersDarkScheme);

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: prefersDarkScheme ? 'dark' : 'light',
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

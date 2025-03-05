<template>
    <div class="login-container">
      <v-card class="login-card">
        <v-card-title>
          <span class="headline">Kirjaudu sisään</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="username"
              label="Käyttäjätunnus"
              :rules="[v => !!v || 'Käyttäjätunnus on pakollinen']"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              label="Salasana"
              :type="'password'"
              :rules="[v => !!v || 'Salasana on pakollinen']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text="Kirjaudu"
            @click="login"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/authStore'; // Tuo authStore
  import config from '../../config.js'; // Tuo konfiguraatiotiedosto
  
  export default {
    name: 'Login',
    setup() {
      const router = useRouter();
      const authStore = useAuthStore(); // Käytä authStorea
      const valid = ref(false);
      const username = ref('');
      const password = ref('');
  
      const login = async () => {
        if (valid.value) {
          try {
            const response = await fetch(`${config.apiUrl}/user/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey
              },
              body: JSON.stringify({ username: username.value, password: password.value })
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // Tallenna token authStoreen
            authStore.login(data.token);
            // Ohjaa käyttäjä etusivulle
            router.push('/');
          } catch (error) {
            console.error('Error logging in:', error);
            alert('Kirjautuminen epäonnistui. Tarkista käyttäjätunnus ja salasana.');
          }
        }
      };
  
      return {
        valid,
        username,
        password,
        login
      };
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .login-card {
    width: 400px;
    padding: 20px;
  }
  </style>
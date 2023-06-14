import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios';

axios.defaults.baseURL = process.env.VUE_APP_BASE_URI;
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';


createApp(App).use(router).mount('#app')

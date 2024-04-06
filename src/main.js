import { createApp } from 'vue'
import router from './router/router'
import './style.css'
import App from './App.vue'
import { colors } from "./plugins/config.js"

const app = createApp(App);

app.config.globalProperties.$colors = colors;

app.use(router).mount('#app');
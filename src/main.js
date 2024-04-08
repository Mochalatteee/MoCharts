import { createApp } from 'vue'
import router from './router/router'
import './style.css'
import App from './App.vue'
import { colors } from "./plugins/config.js"
import 'animate.css/animate.min.css' //引入动画

const app = createApp(App);

app.config.globalProperties.$colors = colors;

app.use(router).mount('#app');
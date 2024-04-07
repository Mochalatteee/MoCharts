import { createRouter, createWebHistory } from 'vue-router';
import barChart from '../components/barChart.vue';
import home from '../layouts/home.vue';
import pieChart from "../components/pieChart.vue"

const routes = [{
    path: '/bar-chart',
    name: 'BarChart',
    component: barChart
 },{
    path: '/',
    name: 'Home',
    component: home
 },{
   path: '/pie-chart',
   name: 'PieChart',
   component: pieChart
}

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

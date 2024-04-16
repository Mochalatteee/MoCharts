import { createRouter, createWebHistory } from 'vue-router';
import barChart from '../components/barChart.vue';
import home from '../layouts/home.vue';
import pieChart from "../components/pieChart.vue"
import gallery from '../layouts/gallery.vue';
import docs from '../layouts/docs.vue';
import about from '../layouts/about.vue'

const homeRoutes = [{
   path: '/bar-chart',
    name: 'BarChart',
    component: barChart
 },{
   path: '/pie-chart',
   name: 'PieChart',
   component: pieChart
},{
   path: '/gallery',
   name: 'gallery',
   component: gallery,
   meta: {
      index: 2
    }
},{
   path: '/docs',
   name: 'docs',
   component: docs,
   meta: {
      index: 1
    }
},{
   path: '/about',
   name: 'about',
   component: about,
   meta: {
      index: 3
    }
}]

const routes = [{
    path: '/bar-chart',
    name: 'BarChart',
    component: barChart
 },{
    path: '/',
    name: 'Home',
    component: home,
    children: homeRoutes // 添加子路由配置
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

import { createRouter, createWebHashHistory } from 'vue-router';
import Hr from '../pages/hr/index.vue';


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Hr
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;

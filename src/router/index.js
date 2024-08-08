import { createRouter, createWebHashHistory } from 'vue-router';
import Index from '../pages/Index.vue';
import Img from '../pages/imgs/Index.vue';
import Video from '../pages/videos/Index.vue';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Index
  },
  {
    path: '/img',
    component: Img
  },
  {
    path: '/video',
    component: Video
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;

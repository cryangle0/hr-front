import './assets/main.css';
import api from './api';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.config.globalProperties.$api = api; // 将 api 注册为全局
app.mount('#app');

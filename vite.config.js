import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },

  },
  server: {
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: 'https://zoukaixin.cn', // 目标服务器地址
        changeOrigin: true, // 是否改变源地址
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 保留 /api 前缀
      },
    } : {},
  },
});

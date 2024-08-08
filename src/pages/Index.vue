<template>
  <div>
    <Header @open-login="showLoginModal" />
    <LoginModal ref="loginModal" />
    <div class="content">
      <div class="main-banner">
        <h1>游玩缤纷多彩的AI世界</h1>
        <p>想象力创造奇迹</p>
      </div>
      <div class="features">
        <div class="feature-item" @click="navigateTo('/img')">
          <img src="@/assets/images/aiimg.png" alt="图文创作" />
          <div class="feature-overlay">
            <h2>美图创作</h2>
            <p>文字生成图片</p>
          </div>
        </div>
        <div class="feature-item" @click="navigateTo('/video')">
          <img src="@/assets/images/aivideo.png" alt="玩转视频" />
          <div class="feature-overlay">
            <h2>魔法表情</h2>
            <p>视频表情跟随</p>
          </div>
        </div>
        <div class="feature-item">
          <img src="@/assets/images/aiwrite.png" alt="文字写作" />
          <div class="feature-overlay">
            <h2>幻文</h2>
            <p>文字充满力量</p>
          </div>
        </div>
        <div class="feature-item">
          <img src="@/assets/images/aisound.png" alt="声音力量" />
          <div class="feature-overlay">
            <h2>幻音</h2>
            <p>声音蕴藏故事</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import LoginModal from '@/components/LoginModal.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const loginModal = ref(null);

const navigateTo = (path) => {
  router.push(path);
};

const showLoginModal = () => {
  loginModal.value.visible = true;
};
</script>


<style scoped>
.content {
  padding-top: 60px; /* 确保内容不会被固定的头部遮挡 */
  overflow-x: hidden; /* 禁止内容水平溢出 */
  background-color: transparent; /* 背景完全透明 */
  color: white;
  text-align: center;
}

.main-banner {
  margin: 20px 0;
  padding: 40px 20px;
  background: url('@/assets/images/banner-bg.png') no-repeat center center; /* 添加背景图 */
  background-size: cover;
  position: relative;
  overflow: hidden;
}

.main-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 添加半透明黑色遮罩 */
  z-index: 1;
}

.main-banner h1,
.main-banner p {
  position: relative;
  z-index: 2;
  animation: fadeInUp 1s ease-in-out; /* 添加文字动画 */
}

.main-banner h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #ff8a00, #e52e71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* 文字渐变效果 */
}

.main-banner p {
  font-size: 1.5rem;
  color: #ffffff;
}

.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 20px;
  gap: 10px; /* 减小卡片之间的间距 */
}

.feature-item {
  flex: 1 1 calc(20% - 10px); /* 调整每个 feature-item 的宽度 */
  max-width: calc(20% - 10px); /* 调整最大宽度 */
  margin: 5px; /* 减小间距 */
  border-radius: 15px; /* 添加边框圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease; /* 添加过渡效果 */
  cursor: pointer;
}

.feature-item:hover {
  transform: translateY(-10px); /* 鼠标悬停时上移 */
}

.feature-item img {
  width: 100%;
  height: auto;
  display: block;
}

.feature-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  color: white;
  padding: 20px; /* 增加内边距 */
  text-align: left;
  transition: background 0.3s ease; /* 添加过渡效果 */
  box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.5); /* 发光效果 */
}

.feature-item:hover .feature-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7)); /* 鼠标悬停时背景加深 */
}

.feature-overlay h2 {
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: #a020f0; /* 紫色 */
  text-shadow: 0px 0px 10px rgba(160, 32, 240, 0.7); /* 文字发光效果 */
}

.feature-overlay p {
  font-size: 1.2rem;
  margin: 0;
  color: #00ffff; /* 青色文字 */
  text-shadow: 0px 0px 5px rgba(0, 255, 255, 0.7); /* 文字发光效果 */
}

/* 添加文字动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<template>
  <div class="container">
    <Header />
    <div class="main-content">
      <div class="panel left-panel">
        <div class="section gradient-background">
          <div class="section-title">创意描述</div>
          <textarea class="description-input" v-model="description" placeholder="请填写创意描述..."></textarea>
          <div class="suggestions">
            推荐尝试：
            <span class="highlighted" @click="fillDescription('海豚，蓝色大海，清澈透明，8K')">海豚</span>
            <span class="highlighted" @click="fillDescription('小鹿，森林，光影斑驳，真实感，4K')">小鹿</span>
            <span class="highlighted" @click="fillDescription('书桌，木质，简约风格，温馨，2K')">书桌</span>
            <span class="highlighted" @click="fillDescription('江南水乡，古镇，宁静，水墨画风，6K')">江南水乡</span>
            <span class="highlighted" @click="fillDescription('新娘，婚纱，浪漫，唯美，4K')">新娘</span>
          </div>
        </div>
        <div class="section gradient-background">
          <div class="section-title">参数设置</div>
          <div class="parameter-setting">
            <label for="slider">生成数量：<span class="slider-value">{{ sliderValue }}张</span></label>
            <input id="slider" type="range" min="1" max="4" v-model="sliderValue" class="slider" />
          </div>
          <div class="parameter-setting">
            <label for="width">宽度：<span class="slider-value">{{ widthValue }}px</span></label>
            <input id="width" type="range" min="512" max="2048" v-model="widthValue" class="slider" />
          </div>
          <div class="parameter-setting">
            <label for="height">高度：<span class="slider-value">{{ heightValue }}px</span></label>
            <input id="height" type="range" min="512" max="2048" v-model="heightValue" class="slider" />
          </div>
        </div>
        <button class="generate-button" @click="submitCreation">立即生成</button>
      </div>
      <div class="panel image-display">
        <div v-if="progress !== null" class="progress">
          <CircularProgress :size="150" :progress="progress" :stroke-width="10" color="#4CAF50" />
        </div>
        <div v-else-if="generatedImages.length > 0" class="generated-images">
          <div v-for="(image, index) in generatedImages" :key="index" class="image-wrapper">
            <img :src="image" alt="生成的图片" />
          </div>
        </div>
        <Empty v-else description="快来创作吧~" />
      </div>
      <div class="panel right-panel" @scroll="handleScroll">
        <div class="section-title">历史记录</div>
        <div class="history-images">
          <div v-for="(item, index) in historyData" :key="item.id" class="history-img-container" @click="showImageModal(item.resource)">
            <img :src="item.resource" alt="历史图片" class="history-img" />
            <div class="tooltip">{{ item.prompt }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="isModalVisible" class="modal-overlay" @click="closeImageModal">
      <div class="modal-content">
        <img :src="selectedImage" alt="预览图片" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import { ref, onMounted, getCurrentInstance, onUnmounted } from 'vue';
import { Empty, message } from 'ant-design-vue';
import { generateRandomString } from '@/assets/javascripts/utils'
import { connectWebSocket, closeWebSocket } from '@/assets/javascripts/imgws';
import CircularProgress from '@/components/CircularProgress.vue';

const description = ref('清凉夏季少女, 微卷短发, 运动服, 林间阳光浓密, 强逆光影, 超级真实, 16K');
const sliderValue = ref(2);
const widthValue = ref(1024);  // 默认宽度
const heightValue = ref(1024);  // 默认高度
const historyData = ref([]);
const isModalVisible = ref(false);
const selectedImage = ref('');
const progress = ref(null);
const generatedImages = ref([]);
const currentPage = ref(1);
const isLastPage = ref(false);

const clientId = generateRandomString(32);

const fillDescription = (text) => {
  description.value = text;
};

const { proxy } = getCurrentInstance();

const fetchHistory = async () => {
  try {
    const response = await proxy.$api.getHistory('kolors', { page: currentPage.value, limit: 10 });
    if (response.data.success) {
      const items = response.data.data.items.map(item => {
        const taskInfo = JSON.parse(item.taskInfo);
        return {
          ...item,
          prompt: JSON.parse(taskInfo.arguments).prompt
        };
      });
      historyData.value.push(...items);
      isLastPage.value = response.data.data.isLast;
    }
  } catch (error) {
    console.error('Error fetching history:', error);
  }
};

const handleScroll = (event) => {
  const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
  if (bottom && !isLastPage.value) {
    currentPage.value += 1;
    fetchHistory();
  }
};

const submitCreation = async () => {
  if (!description.value.trim()) {
    message.error('创意描述不能为空');
    return;
  }

  const data = {
    clientId,
    type: 'kolors',
    prompt: description.value,
    imageNum: sliderValue.value,
    width: widthValue.value,
    height: heightValue.value,
  };

  try {
    const response = await proxy.$api.submitTxt2Image(data);
    if (response.data.success) {
      message.success('开始生成');
      progress.value = 0; // 设置进度条初始值
    } else if (response.data.code===401)  {
      message.error('请先登录哦主人~');
    }else {
      message.error('生成失败，请重试');
    }
  } catch (error) {
    console.error('Error submitting creation:', error);
    message.error('生成失败，请重试');
  }
};

const handlePromptMessage = (data) => {
  const { status, currentSteps, totalSteps, images, message } = data.data;
  if (message) {
    console.log('Message:', message);
  }

  switch (status) {
    case 'progress':
      progress.value = Math.round((currentSteps / totalSteps) * 100);
      break;
    case 'executed':
      progress.value = null;
      generatedImages.value = images;

      // 将生成的图片添加到历史数据的顶部
      const newHistoryItems = images.map((image) => ({
        id: generateRandomString(32),
        resource: image,
        prompt: description.value,
      }));
      historyData.value.unshift(...newHistoryItems);

      break;
    default:
      break;
  }
};


const showImageModal = (image) => {
  selectedImage.value = image;
  isModalVisible.value = true;
};

const closeImageModal = () => {
  isModalVisible.value = false;
  selectedImage.value = '';
};

onMounted(() => {
  connectWebSocket(clientId, handlePromptMessage);
  fetchHistory();
});

onUnmounted(() => {
  closeWebSocket();
});
</script>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  height: 95vh;
  color: white;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex: 1;
  padding-top: 80px;
  background-color: transparent;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  margin: 20px;
  overflow-y: auto;
}

.left-panel {
  width: 25%;
  position: relative;
}

.image-display {
  flex: 1;
  background-color: black;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.right-panel {
  width: 25%;
  overflow-y: auto; /* Ensure the panel is scrollable */
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 10px;
}

.gradient-background {
  background: linear-gradient(135deg, #3b3b3b, #1e1e1e);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.description-input {
  width: 100%;
  height: 100px;
  background-color: rgba(33, 33, 33, 0.8);
  color: white;
  border: none;
  padding: 10px;
  resize: none;
  box-sizing: border-box;
  border-radius: 5px;
  margin-bottom: 10px;
}

.suggestions {
  font-size: 0.9rem;
  color: #cccccc;
  margin-bottom: 20px;
}

.highlighted {
  color: #00ff00;
  font-weight: bold;
  cursor: pointer;
  margin-right: 5px;
}

.parameter-setting {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
}

.parameter-setting label {
  font-size: 1rem;
  margin-bottom: 10px;
}

.slider-value {
  color: #00ff00;
  font-weight: bold;
}

.slider {
  width: 100%;
}

.generate-button {
  width: calc(100% - 40px);
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.3s;
  position: absolute;
  bottom: 20px;
}

.generate-button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.history-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.history-img-container {
  position: relative;
  cursor: pointer;
}

.history-img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.tooltip {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  border-radius: 5px;
  display: none;
  width: 90%;
  text-align: center;
  white-space: normal;
  word-wrap: break-word;
}

.history-img-container:hover .tooltip {
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 50%;
  max-height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}

.progress {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  margin-bottom: 20px;
}

.progress-text {
  position: absolute;
  font-size: 2rem;
  color: white;
}

.generated-images {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.image-wrapper {
  flex: 1 1 calc(25% - 20px);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}
</style>

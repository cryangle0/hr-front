<template>
  <div class="container">
    <Header />
    <div class="main-content">
      <div class="panel left-panel">
        <div class="section gradient-background upload-section">
          <div class="section-title">图片上传</div>
          <div class="upload-box-container">
            <div class="upload-box" @dragover.prevent @drop.prevent="handleDrop" @click="triggerFileInput">
              <template v-if="uploadedImage">
                <img :src="uploadedImage" alt="已上传图片" class="uploaded-image" />
                <div class="delete-icon" @click.stop="deleteImage">✖</div>
              </template>
              <template v-else>
                <p>支持 JPG / PNG 格式文件，文件大小不超过 10MB，尺寸不小于 300px</p>
                <div class="upload-instructions">
                  <div class="upload-icon">⬆</div>
                  <div class="upload-text">点击 / 拖拽 / 粘贴</div>
                </div>
              </template>
            </div>
          </div>
          <input type="file" accept="image/*" ref="fileInput" @change="handleImageUpload" class="file-input" />
        </div>
        <div class="section gradient-background video-section">
          <div class="section-title">参考视频</div>
          <div class="video-list">
            <div
              v-for="(video, index) in templateVideos"
              :key="index"
              class="video-item"
              :class="{ selected: selectedVideoName === getVideoName(video) }"
              @click="selectVideo(video)"
            >
              <video controls :src="video" class="template-video" />
              <div v-if="selectedVideoName === getVideoName(video)" class="checkmark">✔</div>
            </div>
          </div>
        </div>
        <div class="create-button-container">
          <button class="create-button" @click="submitCreation">立即创作</button>
        </div>
      </div>
      <div class="panel image-display">
        <div v-if="progress !== null" class="progress">
          <CircularProgress :size="150" :progress="progress" :stroke-width="10" color="#4CAF50" />
        </div>
        <div v-else-if="generatedVideos.length > 0" class="generated-videos">
          <div v-for="(video, index) in generatedVideos" :key="index" class="video-wrapper">
            <video controls :src="video" alt="生成的视频" />
          </div>
        </div>
        <Empty v-else description="快来创作吧~" />
      </div>
      <div class="panel right-panel" @scroll="handleScroll">
        <div class="section-title">历史记录</div>
        <div class="history-videos">
          <div
            v-for="item in historyData"
            :key="item.id"
            class="history-video-container"
            @click="showVideoModal(item.resource)"
          >
            <video controls :src="item.resource" alt="历史视频" class="history-video" />
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <div v-if="isModalVisible" class="modal-overlay" @click="closeVideoModal">
      <div class="modal-content">
        <video controls :src="selectedVideo" alt="预览视频" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import {ref, onMounted, getCurrentInstance, onUnmounted} from 'vue';
import {Empty, message} from 'ant-design-vue';
import {connectWebSocket, closeWebSocket} from '@/assets/javascripts/imgws';
import CircularProgress from '@/components/CircularProgress.vue';
import {generateRandomString} from '@/assets/javascripts/utils'

const historyData = ref([]);
const isModalVisible = ref(false);
const selectedVideo = ref('');
const progress = ref(null);
const generatedVideos = ref([]);
const uploadedImage = ref(null);
const fileInput = ref(null);
const currentPage = ref(1);
const templateVideos = ref([
  'https://zoukaixin.cn/lindon/d6.mp4',
  'https://zoukaixin.cn/lindon/7.mp4'
]);

const isLastPage = ref(false);

const getVideoName = (video) => {
  return video.split('/').pop();
};

const selectedVideoName = ref(getVideoName(templateVideos.value[0]));

const clientId = generateRandomString(32);

const {proxy} = getCurrentInstance();

const fetchHistory = async () => {
  try {
    const response = await proxy.$api.getHistory('gifs', {page: currentPage.value, limit: 3});
    if (response.data.success) {
      const newItems = response.data.data
          .filter(item => item.resource !== null) // 过滤掉 resource 为 null 的数据项
          .map(item => ({
            ...item,
          }));
      historyData.value.push(...newItems);
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
  if (!uploadedImage.value) {
    message.error('请先上传图片');
    return;
  }

  progress.value = 0; // 显示进度条

  try {
    const file = fileInput.value.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await proxy.$api.uploadImage(formData);
    const uploadedImageUrl = uploadResponse.data.data;

    const payload = {
      clientId: clientId,
      type: 'gifs',
      inputImage: uploadedImageUrl,
      videoName: selectedVideoName.value,
    };

    const response = await proxy.$api.submitEchoMimia(payload);
    if (response.data.success) {
      message.success('开始创作');
    } else if (response.data.code===401)  {
      message.error('请先登录哦主人~');
    } else {
      message.error('生成失败，请重试');
      progress.value = null; // 生成失败时隐藏进度条
    }
  } catch (error) {
    console.error('Error submitting creation:', error);
    message.error('生成失败，请重试');
    progress.value = null; // 生成失败时隐藏进度条
  }
};

const addGeneratedVideoToHistory = (videoUrl) => {
  const newHistoryItem = {
    id: Date.now(),
    resource: videoUrl,
    prompt: `Generated on ${new Date().toLocaleString()}`,
  };
  historyData.value.unshift(newHistoryItem);
};

const handlePromptMessage = (data) => {
  const {status, currentSteps, totalSteps, images, message} = data.data;
  if (message) {
    console.log('Message:', message);
  }

  switch (status) {
    case 'progress':
      progress.value = Math.round((currentSteps / totalSteps) * 100);
      break;
    case 'executed':
      progress.value = null;
      generatedVideos.value = images;
      images.forEach(image => addGeneratedVideoToHistory(image)); // 在生成的视频渲染完成后将其加入历史记录
      break;
    default:
      break;
  }
};

const showVideoModal = (video) => {
  selectedVideo.value = video;
  isModalVisible.value = true;
};

const closeVideoModal = () => {
  isModalVisible.value = false;
  selectedVideo.value = '';
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    handleImageUpload({target: {files: [file]}});
  }
};

const deleteImage = () => {
  uploadedImage.value = null;
  fileInput.value.value = null;
};

const selectVideo = (video) => {
  selectedVideoName.value = getVideoName(video);
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
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
}

.section {
  padding: 20px;
  border-radius: 10px;
}

.upload-section {
  cursor: pointer;
  height: 250px;
  padding-top: 10px;
}

.upload-box-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.upload-box {
  width: calc(100% - 40px);
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(33, 33, 33, 0.8);
  color: white;
  border: 2px dashed #4CAF50;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  position: relative;
  box-sizing: border-box;
  margin: 0 auto; /* Ensure it is centered within its container */
}

.uploaded-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}

.delete-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #ff4c4c;
  cursor: pointer;
}

.upload-instructions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.upload-icon {
  font-size: 1.5rem;
  margin-right: 10px;
  color: #00ff00;
}

.upload-text {
  font-size: 1rem;
  color: #00ff00;
}

.upload-history {
  margin-top: 10px;
  color: #cccccc;
}

.history-link {
  color: #00ffff;
  cursor: pointer;
}

.file-input {
  display: none;
}

.video-section {
  max-height: 300px;
  overflow-y: auto;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

//.video-item.selected {
//  border: 2px solid #4caf50;
//}

.template-video {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.checkmark {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: red;
  background-color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gradient-background {
  background: linear-gradient(135deg, #3b3b3b, #1e1e1e);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.create-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
}

.create-button {
  width: 100%;
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.3s;
}

.create-button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.history-videos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-video-container {
  position: relative;
  cursor: pointer;
}

.history-video {
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

.history-video-container:hover .tooltip {
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

.modal-content video {
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

.generated-videos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.video-wrapper {
  flex: 1 1 calc(25% - 20px);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
}

.video-wrapper video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}
</style>

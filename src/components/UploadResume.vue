<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <el-card style="flex: 1; display: flex; flex-direction: column; position: relative;">
      <div class="header">
        <h2>简历信息</h2>
      </div>
      <div class="upload-section">
        <el-upload
          :http-request="handleUpload"
          list-type="text"
          :accept="acceptedFileTypes"
          :show-file-list="false"
        >
          <el-button type="primary">上传简历</el-button>
        </el-upload>
      </div>
      <hr class="divider" />
      <el-table :data="resumes" style="width: 100%; flex: 1; overflow-y: auto;">
        <el-table-column label="简历名称" align="center">
          <template #header>
            <div class="centered-header">简历名称</div>
          </template>
          <template #default="{ row }">
            <div class="resume-cell">
              <img :src="getIcon(row.name)" alt="简历图标" class="icon" />
              <span>{{ getFileName(row.name) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #header>
            <div class="centered-header">操作</div>
          </template>
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="查看" placement="top">
                <el-button @click="viewResume(row)" circle>
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="分析" placement="top">
                <el-button @click="analyzeResume(row)" circle>
                  <el-icon><DataLine /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button @click="deleteResume(row)" circle type="danger">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  <Loader v-if="isLoading"/>
</template>

<script setup>
import {ref, getCurrentInstance, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import {View, DataLine, Delete} from '@element-plus/icons-vue';
import Loader from '@/components/Loader.vue';  // 引入Loader组件
import pdfIcon from '@/assets/images/pdf.png';
import wordIcon from '@/assets/images/word.png';

const {proxy} = getCurrentInstance();
const resumes = ref([]);
const acceptedFileTypes = '.pdf,.doc,.docx';
const isLoading = ref(false);

const handleUpload = async ({file, onSuccess}) => {
  isLoading.value = true;  // 显示加载动画

  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await proxy.$api.uploadFile(formData);

    resumes.value.unshift({
      name: file.name,
      file_url: response.data.file_url,
    });

    onSuccess(null, file);
    ElMessage({
      message: '上传成功',
      type: 'success',
      duration: 2000,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    ElMessage({
      message: '上传失败',
      type: 'error',
      duration: 2000,
    });
  } finally {
    isLoading.value = false;  // 隐藏加载动画
  }
};

const fetchResumes = async () => {
  try {
    isLoading.value = true;  // 显示加载动画
    const response = await proxy.$api.listResumes();
    resumes.value = response.data;
  } catch (error) {
    console.error('Failed to fetch resumes:', error);
  } finally {
    isLoading.value = false;  // 隐藏加载动画
  }
};

const deleteResume = async (row) => {
  isLoading.value = true;  // 显示加载动画

  try {
    await proxy.$api.deleteResume(row.id);
    resumes.value = resumes.value.filter(resume => resume.id !== row.id);
    ElMessage({
      message: '删除成功',
      type: 'success',
      duration: 2000,
    });
  } catch (error) {
    console.error('Failed to delete resume:', error);
    ElMessage({
      message: '删除失败',
      type: 'error',
      duration: 2000,
    });
  } finally {
    isLoading.value = false;  // 隐藏加载动画
  }
};

const getIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  if (extension === 'pdf') {
    return pdfIcon;
  } else if (extension === 'doc' || extension === 'docx') {
    return wordIcon;
  }
  return '';
};

const getFileName = (fileName) => {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  return nameWithoutExtension.length > 10 ? nameWithoutExtension.slice(0, 10) + '...' : nameWithoutExtension;
};

const viewResume = (row) => {
  console.log('View resume:', row.name);
  // 在这里添加查看简历的逻辑
};

const analyzeResume = async (row) => {
  isLoading.value = true;  // 显示加载动画

  try {
    const response = await proxy.$api.analyzeResume(row.id);
    const analysisResult = response.data;

    proxy.$emit('analyze', analysisResult);
  } catch (error) {
    console.error('Analyze failed:', error);
    ElMessage({
      message: '分析失败',
      type: 'error',
      duration: 2000,
    });
  } finally {
    isLoading.value = false;  // 隐藏加载动画
  }
};

onMounted(fetchResumes);
</script>

<style scoped lang="less">
.el-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.header {
  text-align: center;
  margin-bottom: 10px;
}

.upload-section {
  position: absolute;
  top: 20px;
  right: 20px;
}

.divider {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0; /* 调整上下间距 */
}

.el-table {
  flex: 1;
  overflow-y: auto;
}

.el-table th.gutter {
  width: 0 !important;
}

.resume-cell {
  display: flex;
  align-items: center;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  vertical-align: middle;
}

.el-button {
  display: flex;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
}

.el-button .el-icon {
  font-size: 18px; /* 调整图标大小，使其更容易对齐 */
}

.el-button:hover {
  background-color: #f2f2f2;
}

.centered-header {
  text-align: center;
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-buttons .el-button {
  margin: 0 5px;
}
</style>

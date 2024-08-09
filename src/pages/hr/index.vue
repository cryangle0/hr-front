<template>
  <el-container>
    <div class="header">
      <img src="@/assets/images/hr.png" alt="HR伴侣" class="icon">
      <span class="title">HR伴侣</span>
    </div>
    <el-main style="height: calc(100% - 60px); padding: 0;"> <!-- 减去header的高度 -->
      <el-row :gutter="20" style="height: 100%;">
        <el-col :span="6" style="height: 100%;">
          <!-- 上传简历和历史记录区域 -->
          <UploadResume @analyze="handleAnalyze"/>
        </el-col>
        <el-col :span="12" style="height: 100%;">
          <!-- 简历分析 -->
          <ResumeAnalysis :analysisResult="analysisResult" />
        </el-col>
        <el-col :span="6" style="height: 100%;">
          <!-- 岗位要求 -->
          <JobRequirements />
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import UploadResume from '@/components/UploadResume.vue';
import ResumeAnalysis from '@/components/ResumeAnalysis.vue';
import JobRequirements from '@/components/JobRequirements.vue';

const analysisResult = ref(null);

const handleAnalyze = (result) => {
  console.log('Analysis result received:', result);
  analysisResult.value = result;
};
</script>

<style scoped lang="less">
.el-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: black;
}

.icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.title {
  font-size: 24px;
}

.el-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* 防止滚动 */
}

.el-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

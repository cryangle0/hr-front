import axios from 'axios';

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 使用环境变量

  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建单独的 Axios 实例，用于上传文件（不同的 Content-Type）
const formDataClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 上传文件
function uploadFile(data) {
  return formDataClient.post('/upload/', data);
}

// 获取简历列表
function listResumes() {
  return apiClient.get('/list-resumes/');
}

// 删除简历
function deleteResume(id) {
  return apiClient.delete('/delete-resume/', { data: { id } });
}

function getJobRequirements() {
  return apiClient.get('/job-requirements/');
}

function createJobRequirement(data) {
  return apiClient.post('/job-requirements/', data);
}

function updateJobRequirement(id, data) {
  return apiClient.put(`/job-requirement/${id}/`, data);
}

function deleteJobRequirement(id) {
  return apiClient.delete(`/job-requirement/${id}/`);
}

function analyzeResume(resume_id) {
  return apiClient.get('/analyze-resume/', { params: { resume_id } });
}

export default {
  listResumes,
  deleteResume,
  uploadFile,
  getJobRequirements,
  createJobRequirement,
  updateJobRequirement,
  deleteJobRequirement,
  analyzeResume
};

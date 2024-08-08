import axios from 'axios';

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 使用环境变量
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：在每次请求前设置 token，除了用户登录、注册、修改资料和邮箱验证接口
apiClient.interceptors.request.use(
  config => {
    if (
      config.url !== '/auth/user/login' &&
      config.url !== '/auth/user/register' &&
      config.url !== '/auth/user/sendEmail'
    ) {
      const token = localStorage.getItem('accessToken'); // 从 localStorage 中获取 token
      if (token) {
        config.headers.Authorization = token; // 不使用 Bearer 前缀
      } else {
        console.warn('No token found'); // 增加日志
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 创建单独的 Axios 实例，用于上传文件（不同的 Content-Type）
const formDataClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 请求拦截器：在每次请求前设置 token
formDataClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken'); // 从 localStorage 中获取 token
    if (token) {
      config.headers.Authorization = token; // 不使用 Bearer 前缀
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 获取历史记录
function getHistory(type, { page = 1, limit = 10 }) {
  return apiClient.get('/creation/work', {
    params: { type, page, limit },
  });
}

// 提交文本到图片
function submitTxt2Image(data) {
  return apiClient.post('/creation/submit/txt2Image', data);
}

// 上传图片
function uploadImage(data) {
  return formDataClient.post('/file/upload', data);
}

// 提交 Echo Mimia
function submitEchoMimia(data) {
  return apiClient.post('/creation/submit/echoMimia', data);
}

// 用户登录
function userLogin(data) {
  return apiClient.post('/auth/user/login', data);
}

// 获取用户信息
function getUserInfo() {
  return apiClient.get('/auth/user/userInfo');
}

// 用户注册
function userRigester(data) {
  return apiClient.post('/auth/user/register', data);
}

// 修改资料
function userEdit(data) {
  return apiClient.put('/auth/user/userInfo', data);
}

// 邮箱验证
function sendEmail(data) {
  return apiClient.post('/auth/user/sendEmail', data);
}

export default {
  getHistory,
  submitTxt2Image,
  uploadImage,
  submitEchoMimia,
  userLogin,
  userRigester,
  userEdit,
  sendEmail,
  getUserInfo
};

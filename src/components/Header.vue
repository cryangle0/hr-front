<template>
  <header class="header">
    <div class="logo" @click="navigateToIndex">
      <img src="@/assets/iconimgs/logo.png" alt="logo" />
      <span>灵动</span>
    </div>
    <div class="user-profile" @click="handleUserProfileClick">
      <template v-if="isLoggedIn">
        <template v-if="user.avatar">
          <img :src="user.avatar" alt="user icon" />
        </template>
        <template v-else>
          <div class="login-text">{{ truncatedUsername }}</div>
        </template>
      </template>
      <template v-else>
        <div class="login-text">登录</div>
      </template>
      <div v-if="showDropdown" class="dropdown">
        <div class="dropdown-item" @click="navigateToProfile">个人中心</div>
        <div class="dropdown-item" @click="navigateToWallet">我的作品</div>
        <div class="divider"></div> <!-- Divider line -->
        <div class="dropdown-item" @click="logout">退出</div>
      </div>
    </div>
    <LoginModal :visible="showLoginModal" @close="showLoginModal = false" @login-success="handleLoginSuccess" />
  </header>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import LoginModal from './LoginModal.vue';

const { proxy } = getCurrentInstance();

const router = useRouter();
const user = ref({
  avatar: null,
  username: '登录'
});

const showDropdown = ref(false);
const showLoginModal = ref(false);
const isLoggedIn = ref(false);

const handleUserProfileClick = async () => {
  if (isLoggedIn.value) {
    toggleDropdown();
  } else {
    showLoginModal.value = true;
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const fetchUserInfo = async () => {
  try {
    const response = await proxy.$api.getUserInfo();
    if (response.data.code === 200) {
      user.value = response.data.data;
      isLoggedIn.value = true;
    } else {
      message.error(response.data.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

const checkLoginStatus = () => {
  const token = localStorage.getItem('accessToken');
  console.log('用户token测试:', token);
  if (token) {
    fetchUserInfo();
  } else {
    isLoggedIn.value = false;
  }
};

const navigateToIndex = () => {
  router.push('/home');
};

const navigateToProfile = () => {
  // router.push('/profile');
};

const navigateToWallet = () => {
  // router.push('/');
};

const logout = () => {
  localStorage.removeItem('accessToken');
  user.value = {
    avatar: null,
    username: '登录'
  };
  isLoggedIn.value = false;
  message.success('退出成功');
  showDropdown.value = false;
};

const handleLoginSuccess = (userInfo) => {
  showLoginModal.value = false;
  user.value = {
    avatar: userInfo.avatar,
    username: userInfo.username
  };
  isLoggedIn.value = true;
};

const truncatedUsername = computed(() => {
  if (user.value.username.length > 3) {
    return user.value.username.slice(0, 3) + '...';
  }
  return user.value.username;
});

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.dropdown');
  const userProfile = document.querySelector('.user-profile');
  if (dropdown && !dropdown.contains(event.target) && !userProfile.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  checkLoginStatus();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="less">
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(33, 33, 33, 0.5);
  padding: 10px 20px;
  z-index: 1000;
  box-sizing: border-box;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;

  img {
    height: 60px;
    margin-right: 20px;
  }

  span {
    color: white;
    font-size: 36px;
  }
}

.user-profile {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;

  img {
    height: 60px;
    width: 60px;
    border-radius: 50%;
  }

  .login-text {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    background-color: #ed6c1f;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    transition: transform 0.3s, background-color 0.3s;
  }

  .login-text:hover {
    background-color: #ff851b;
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 0 15px rgba(255, 133, 27, 0.6);
  }
}

.dropdown {
  position: absolute;
  top: 70px;
  right: 0;
  background-color: #fd852f;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 200px;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s, color 0.3s, border-radius 0.3s;
  border-radius: 10px;
}

.dropdown-item:hover {
  background-color: #ff0805;
  color: white;
}

.divider {
  height: 1px;
  background-color: #ccc;
  margin: 5px 0;
}
</style>

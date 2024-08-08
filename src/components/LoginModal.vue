<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <div class="login-container" v-if="!isRegistering">
        <h2>用户登录</h2>
        <form @submit.prevent="login">
          <input type="text" id="username" v-model="username" name="username" placeholder="用户名" required>
          <input type="password" id="password" v-model="password" name="password" placeholder="密码" required>
          <div class="remember-forgot">
            <a href="#">忘记密码？</a>
          </div>
          <button type="submit">登录</button>
        </form>
        <p>没有账号? <a href="#" @click="showRegister">注册账号</a></p>
      </div>
      <div class="register-container" v-else>
        <span class="back" @click="showLogin">&larr; 返回登录</span>
        <h2>注册账号</h2>
        <form @submit.prevent="register">
          <input type="text" v-model="username" name="username" placeholder="用户名" required>
          <input type="text" v-model="regEmail" name="email" placeholder="邮箱" required>
          <div class="verify-code-container">
            <input type="text" v-model="verifyCode" name="verifyCode" placeholder="请输入验证码" required>
            <button type="button" class="send-code-button" :disabled="isButtonDisabled" @click="sendVerificationCode">
              {{ isButtonDisabled ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
          <input type="password" v-model="regPassword" name="password" placeholder="密码" required>
          <input type="password" v-model="confirmPassword" name="confirmPassword" placeholder="确认密码" required>
          <button type="submit">注册</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue';
import { message } from 'ant-design-vue';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'login-success'],
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');
    const isRegistering = ref(false);
    const regEmail = ref('');
    const verifyCode = ref('');
    const regPassword = ref('');
    const confirmPassword = ref('');

    const isButtonDisabled = ref(false);
    const countdown = ref(60);

    const { proxy } = getCurrentInstance();

    const closeModal = () => {
      emit('close');
    };

    const showRegister = () => {
      isRegistering.value = true;
    };

    const showLogin = () => {
      isRegistering.value = false;
    };

    const login = async () => {
      if (!username.value) {
        message.error('请输入用户名');
        return;
      }
      if (!password.value) {
        message.error('请输入密码');
        return;
      }

      try {
        const response = await proxy.$api.userLogin({
          username: username.value,
          password: password.value,
          loginWay: 1,
        });
        if (response.data.code === 500) {
          message.error(response.data.message || '登录失败，请检查您的用户名和密码');
        } else {
          message.success('登录成功');
          localStorage.setItem('accessToken', response.data.data.accessToken); // 保存 token 到 localStorage

          // 保存用户信息
          emit('login-success', {
            avatar: response.data.data.loginUser.avatar,
            username: response.data.data.loginUser.username
          });

          closeModal();
        }
      } catch (error) {
        console.error('登录失败:', error);
        message.error('登录失败，请检查您的用户名和密码');
      }
    };

    const startCountdown = () => {
      isButtonDisabled.value = true;
      countdown.value = 60;
      const interval = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
          clearInterval(interval);
          isButtonDisabled.value = false;
        }
      }, 1000);
    };

    const sendVerificationCode = async () => {
      if (!regEmail.value) {
        message.error('请输入邮箱');
        return;
      }

      try {
        const response = await proxy.$api.sendEmail({
          email: regEmail.value,
          type: 1
        });
        if (response.data.code === 500) {
          message.error(response.data.message || '验证码发送失败');
        } else {
          message.success('验证码发送成功');
          startCountdown();
        }
      } catch (error) {
        console.error('验证码发送失败:', error);
        message.error('验证码发送失败');
      }
    };

    const register = async () => {
      if (!username.value || !regEmail.value || !verifyCode.value || !regPassword.value || !confirmPassword.value) {
        message.error('请填写所有字段');
        return;
      }
      if (regPassword.value !== confirmPassword.value) {
        message.error('两次输入的密码不一致');
        return;
      }

      try {
        const response = await proxy.$api.userRigester({
          username: username.value,
          email: regEmail.value,
          verifyCode: verifyCode.value,
          password: regPassword.value,
          confirmPassword: confirmPassword.value,
        });
        if (response.data.code === 500) {
          message.error(response.data.message || '注册失败');
        } else {
          message.success('注册成功');
          showLogin();
        }
      } catch (error) {
        console.error('注册失败:', error);
        message.error('注册失败');
      }
    };

    return {
      username,
      password,
      isRegistering,
      regEmail,
      verifyCode,
      regPassword,
      confirmPassword,
      isButtonDisabled,
      countdown,
      closeModal,
      showRegister,
      showLogin,
      login,
      register,
      sendVerificationCode,
    };
  }
};
</script>

<style scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.8);
}

.modal-content {
  background-color: #333;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 90%;
  max-width: 400px; /* 增加最大宽度 */
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  position: relative;
}

.close {
  color: #ccc;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.login-container,
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-container h2,
.register-container h2 {
  margin-bottom: 20px;
  color: #fff;
}

.login-container form,
.register-container form {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center; /* 使输入框居中 */
}

.login-container input,
.register-container input {
  margin-bottom: 20px;
  padding: 10px;
  width: 80%; /* 调整宽度以居中 */
  border: 1px solid #ccc;
  border-radius: 25px;
  background-color: #444;
  color: #fff;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.verify-code-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 80%;
}

.verify-code-container input {
  flex: 2;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 25px 0 0 25px;
  background-color: #444;
  color: #fff;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  height: 40px; /* 确保高度一致 */
  margin: 0; /* 移除外边距 */
}

.send-code-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 0 25px 25px 0;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
  height: 40px; /* 确保高度一致 */
  margin: 0; /* 移除外边距 */
}

.send-code-button:hover {
  background-color: #0056b3;
}

.send-code-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.remember-forgot {
  display: flex;
  justify-content: flex-end;
  width: 80%; /* 调整宽度以居中 */
  margin-bottom: 20px;
  color: #ccc;
}

button[type="submit"] {
  padding: 10px;
  width: 60%; /* 缩短注册按钮的长度 */
  border: none;
  border-radius: 25px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

p {
  margin-top: 20px;
  color: #ccc;
}

a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

a:hover {
  color: #ff1493;
  text-shadow: 2px 2px 5px rgba(255, 20, 147, 0.6);
}

.back {
  cursor: pointer;
  color: #007bff;
  margin-bottom: 20px;
  align-self: flex-start;
  transition: color 0.3s ease;
}

.back:hover {
  color: #ff1493;
}
</style>

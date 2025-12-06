<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">会议室预约系统登录</h2>
      <div class="input-group">
        <label for="username">账号：</label>
        <input 
          type="text" 
          id="username" 
          v-model="loginForm.username" 
          placeholder="请输入账号"
          class="input-field"
        />
      </div>
      <div class="input-group">
        <label for="password">密码：</label>
        <input 
          type="password" 
          id="password" 
          v-model="loginForm.password" 
          placeholder="请输入密码"
          class="input-field"
        />
      </div>
      <button @click="handleLogin" class="login-button">登录</button>
      <button @click="handleRegister" class="register-button">注册</button>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user.js'
import { setToken } from '@/utils/cookie.js'
import router from '@/router';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      // 使用输入框中的数据作为请求参数
      const loginParams = {
        username: this.loginForm.username,
        password: this.loginForm.password
      }
      
      login(loginParams).then(response => {
        console.log('登录响应:', response)
        if (response.code === 0) {
          // 登录成功，设置token
          setToken(response.data.token)
          // 这里可以添加跳转到首页或其他操作
          router.push('/');
          console.log('登录成功')
        } else {
          console.error('登录失败:', response.msg)
        }
      }).catch(error => {
        console.error('登录请求出错:', error)
      })
    },
    handleRegister() {
      // 注册功能可以在这里实现
      console.log('注册按钮被点击')
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-title {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
}

.input-group label {
  width: 60px;
  text-align: left;
  margin-right: 10px;
  color: #666;
}

.input-field {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-field:focus {
  outline: none;
  border-color: #409eff;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.login-button:hover {
  background-color: #337ecc;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.register-button:hover {
  background-color: #5daf34;
}
</style>

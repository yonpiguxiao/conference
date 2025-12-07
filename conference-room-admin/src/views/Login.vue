<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">会议室预约管理系统登录</h2>
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
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
import { setToken, getToken } from '@/utils/cookie'
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      // 检查用户名和密码是否为空
      if (!this.loginForm.username || !this.loginForm.password) {
        ElMessage.error('请输入用户名和密码')
        return
      }
      
      try {
        // 调用登录接口
        const response = await login({
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        
        // 检查返回结果
        if (response.code === 0) {
          // 存储token
          setToken(response.data.token)
          
          // 检查token是否存在
          const token = getToken()
          if (!token) {
            ElMessage.error('Token不存在，请重新登录')
            return
          }
          
          // 登录成功跳转
          this.$router.push('/home/conference')
          ElMessage.success('登录成功')
        } else {
          ElMessage.error(response.msg || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录请求失败: ' + error.message)
      }
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
</style>

<template>
  <div class="checkin-pop-overlay" v-if="visible" @click="close">
    <div class="checkin-pop" @click.stop>
      <div class="checkin-pop-header">
        <h3>签到二维码</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="checkin-pop-content">
        <div v-if="loading" class="loading">生成二维码中...</div>
        <div v-else-if="qrCodeUrl" class="qr-code-container">
          <img :src="qrCodeUrl" alt="签到二维码" class="qr-code" />
          <p class="qr-tip">请使用手机扫描二维码进行签到</p>
          <div class="token-info">
            <p>二维码有效期：{{ expiresAt }}</p>
            <p>剩余使用次数：{{ usesRemaining }}</p>
          </div>
          <button class="checkin-btn" @click="handleQrCheckin">模拟扫码签到</button>
        </div>
        <div v-else class="error">二维码生成失败</div>
      </div>
    </div>
  </div>
</template>

<script>
import { createCheckinToken, qrCheckin } from '@/api/appointment.js'
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'

export default {
  name: 'CheckinPop',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    appointmentId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      qrCodeUrl: '',
      expiresAt: '',
      usesRemaining: 0,
      token: ''
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.generateQRCode()
      } else {
        // 重置状态
        this.qrCodeUrl = ''
        this.expiresAt = ''
        this.usesRemaining = 0
        this.token = ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    
    async generateQRCode() {
      if (!this.appointmentId) return
      
      this.loading = true
      try {
        // 调用生成签到二维码接口
        const params = {
          expires_in_seconds: null,
          uses: 100
        }
        
        const res = await createCheckinToken(this.appointmentId, params)
        if (res.code === 0) {
          const { token, expires_at, uses_remaining } = res.data
          this.token = token
          this.expiresAt = expires_at
          this.usesRemaining = uses_remaining
          
          // 生成二维码
          this.qrCodeUrl = await QRCode.toDataURL(token)
        } else {
          console.error('生成签到二维码失败:', res.msg)
        }
      } catch (error) {
        console.error('生成签到二维码异常:', error)
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 处理二维码签到
     */
    async handleQrCheckin() {
      if (!this.token) return
      
      try {
        const res = await qrCheckin({ token: this.token })
        if (res.code === 0) {
          ElMessage.success('签到成功')
          // 关闭弹窗
          this.close()
          // 通知父组件签到成功
          this.$emit('success')
        } else {
          ElMessage.error('签到失败: ' + res.msg)
        }
      } catch (error) {
        console.error('二维码签到异常:', error)
        ElMessage.error('签到异常')
      }
    }
  }
}
</script>

<style scoped>
.checkin-pop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.checkin-pop {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.checkin-pop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.checkin-pop-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.checkin-pop-content {
  padding: 20px;
  text-align: center;
}

.loading {
  font-size: 16px;
  color: #666;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code {
  max-width: 200px;
  height: auto;
  margin-bottom: 15px;
}

.qr-tip {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}

.token-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  width: 100%;
}

.token-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #666;
}

.error {
  color: #ff4d4f;
  font-size: 16px;
}

.checkin-btn {
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;
}

.checkin-btn:hover {
  background-color: #73d13d;
}
</style>

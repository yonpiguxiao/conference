<template>
  <div class="personal-appointment">
    <div class="header">
      <h1>个人预约列表</h1>
    </div>
    <div class="appointment-list" v-loading="loading">
      <div v-for="appointment in appointments" :key="appointment.id" class="appointment-item" >
        <div class="room-info">
          {{ appointment.roomName }}
          <span class="status-tag" :class="getStatusClass(appointment.status)">{{ getStatusText(appointment.status) }}</span>
        </div>
        <div class="time-info">
          <span>{{ appointment.startTime }} 至 {{ appointment.endTime }}</span>
          <div class="actions">
            <button class="detail-btn" @click="showDetail(appointment.id)">详情</button>
            <button v-if="canCancel(appointment.status)" class="cancel-btn" @click="cancelAppointment(appointment.id)"
            >
              取消预约
            </button>
          </div>
        </div>
      </div>
      <!-- 当没有预约时显示 -->
      <div v-if="appointments.length === 0 && !loading" class="no-appointments">
        暂无预约记录
      </div>
    </div>
    
    <!-- 预约详情弹窗 -->
    <AppointmentInfoPop 
      :visible="detailVisible" 
      :appointment-id="currentAppointmentId"
      @update:visible="detailVisible = $event"
      @success="handleDetailSuccess"
    />
    
    <!-- 取消预约弹窗 -->
    <CancelAppointmentPop
      :visible="cancelVisible"
      :appointment-id="currentAppointmentId"
      @update:visible="cancelVisible = $event"
      @success="handleCancelSuccess"
    />
  </div>
</template>

<script>
import { getCurrentUser } from '@/api/user.js'
import { getAppointmentList } from '@/api/appointment.js'
import { formatDateTime } from '@/utils/date.js'
import AppointmentInfoPop from '@/views/pop/AppointmentInfoPop.vue'
import CancelAppointmentPop from '@/views/pop/CancelAppointmentPop.vue'

export default {
  name: 'PersonalAppointment',
  components: {
    AppointmentInfoPop,
    CancelAppointmentPop
  },
  data() {
    return {
      appointments: [],
      loading: false,
      userId: null,
      detailVisible: false,
      cancelVisible: false,
      currentAppointmentId: null
    }
  },
  async mounted() {
    await this.fetchUserInfo()
  },
  methods: {
    /** 
     * 获取用户信息
     */
    async fetchUserInfo() {
      try {
        const res = await getCurrentUser()
        if (res.code === 0) {
          this.userId = res.data.id
          // 获取用户预约列表
          await this.fetchAppointments()
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    /** 
     * 获取预约列表
     */
    async fetchAppointments() {
      if (!this.userId) return
      
      this.loading = true
      try {
        const params = {
          userId: this.userId,
          page: 1,
          pageSize: 20
        }
        
        const res = await getAppointmentList(params)
        
        if (res.code === 0) {
          this.appointments = res.data.list.map(item => ({
            ...item,
            startTime: formatDateTime(item.startsAt),
            endTime: formatDateTime(item.endsAt)
          }))
          console.log('预约列表:', this.appointments)
        }
      } catch (error) {
        console.error('获取预约列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    /** 
     * 判断是否可以取消预约
     * @param {string} status - 预约状态
     * @returns {boolean}
     */
    canCancel(status) {
      return status === 'pending' || status === 'approved'
    },
    /** 
     * 获取状态标签的样式类
     * @param {string} status - 预约状态
     * @returns {string} - 样式类名
     */
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'status-pending';
        case 'approved':
          return 'status-approved';
        case 'rejected':
          return 'status-rejected';
        case 'canceled':
          return 'status-canceled';
        case 'checked_in':
          return 'status-checked-in';
        case 'completed':
          return 'status-completed';
        default:
          return '';
      }
    },
    /** 
     * 获取状态文本
     * @param {string} status - 预约状态
     * @returns {string} - 状态文本
     */
    getStatusText(status) {
      const statusMap = {
        pending: '审批中',
        approved: '审批通过',
        rejected: '审批失败',
        canceled: '已取消',
        checked_in: '已签到',
        completed: '已完成'
      }
      return statusMap[status] || status
    },
    /** 
     * 显示预约详情
     * @param {number} id - 预约ID
     */
    showDetail(id) {
      this.currentAppointmentId = id
      this.detailVisible = true
    },
    
    /** 
     * 处理详情弹窗成功事件
     */
    handleDetailSuccess() {
      // 重新获取预约列表
      this.fetchAppointments()
    },
    
    /** 
     * 取消预约
     * @param {number} id - 预约ID
     */
    cancelAppointment(id) {
      this.currentAppointmentId = id
      this.cancelVisible = true
    },
    
    /** 
     * 处理取消预约成功事件
     */
    handleCancelSuccess() {
      // 重新获取预约列表
      this.fetchAppointments()
    }
  }
}
</script>

<style scoped>
.personal-appointment {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header h1 {
  margin-top: 40px;
  color: #333;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.room-info {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #666;
}

.cancel-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #ff7875;
}

.detail-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

.detail-btn:hover {
  background-color: #40a9ff;
}

.no-appointments {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 30px 0;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
  margin-left: 10px;
  vertical-align: middle;
}

.status-approved {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-canceled {
  background-color: #f9f9f9;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}

.status-checked-in {
  background-color: #e6fffb;
  color: #08979c;
  border: 1px solid #87e8de;
}

.status-completed {
  background-color: #f0f5ff;
  color: #2f54eb;
  border: 1px solid #adc6ff;
}
</style>

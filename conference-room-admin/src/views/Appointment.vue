<template>
  <div class="appointment-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>预约管理</h2>
    </div>
    
    <!-- 预约列表 -->
    <div class="appointment-list">
      <div 
        v-for="appointment in appointmentList" 
        :key="appointment.id" 
        class="appointment-item"
        :class="{ 'pending': appointment.status === 'pending' }"
      >
        <!-- 预约室名称 -->
        <div class="room-name">{{ appointment.roomName }}</div>
        
        <!-- 预约信息 -->
        <div class="appointment-info">
          <div class="info-row">
            <span class="label">预约人：</span>
            <span class="value">{{ appointment.userName }}</span>
          </div>
          <div class="info-row">
            <span class="label">预约时间：</span>
            <span class="value">{{ appointment.time }}</span>
          </div>
          <div class="info-row">
            <span class="label">预约状态：</span>
            <span class="value" :class="getStatusClass(appointment.status)">{{ getStatusText(appointment.status) }}</span>
          </div>
        </div>
        
        <!-- 审批按钮（仅对未审批的预约显示） -->
        <div v-if="appointment.status === 'pending'" class="approval-button">
          <el-button type="primary" size="small" @click="openApprovalDialog(appointment)">审批</el-button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 审批预约弹窗 -->
  <ApproveAppointmentPop v-model:visible="approvalDialogVisible" @confirm="handleApprovalConfirm" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ApproveAppointmentPop from './ApproveAppointmentPop.vue'
import { getAppointmentList, approve } from '@/api/appointment'
import { formatDateTime } from '@/utils/date'
import { ElMessage } from 'element-plus'

// 控制审批弹窗显示
const approvalDialogVisible = ref(false)

// 当前正在审批的预约
const currentAppointment = ref(null)

// 预约列表数据
const appointmentList = ref([])

// 根据状态获取对应的CSS类名
const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'status-used'
    case 'checked_in':
      return 'status-used'
    case 'approved':
      return 'status-unused'
    case 'pending':
      return 'status-pending'
    case 'rejected':
      return 'status-cancelled'
    case 'canceled':
      return 'status-cancelled'
    default:
      return ''
  }
}

// 获取状态显示文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '审批中'
    case 'approved':
      return '审批通过'
    case 'rejected':
      return '审批失败'
    case 'canceled':
      return '已取消'
    case 'checked_in':
      return '已签到'
    case 'completed':
      return '已完成'
    default:
      return status
  }
}

// 打开审批弹窗
const openApprovalDialog = (appointment) => {
  currentAppointment.value = appointment
  approvalDialogVisible.value = true
}

// 处理审批确认
const handleApprovalConfirm = async (approvalData) => {
  console.log('审批结果:', approvalData)
  console.log('被审批的预约:', currentAppointment.value)
  
  try {
    // 调用API提交审批结果
    const payload = {
      action: approvalData.approvalResult === 'agree' ? 'approve' : 'reject',
      ...(approvalData.approvalResult === 'reject' && { reason: approvalData.rejectReason })
    }
    
    await approve(currentAppointment.value.id, payload)
    
    // 更新预约列表中的状态
    if (currentAppointment.value) {
      if (approvalData.approvalResult === 'agree') {
        currentAppointment.value.status = 'approved'
      } else if (approvalData.approvalResult === 'reject') {
        currentAppointment.value.status = 'rejected'
      }
    }
    
    // 显示成功消息
    ElMessage.success('审批成功')
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败: ' + (error.message || '未知错误'))
  }
}

// 获取预约列表数据
const fetchAppointmentList = async () => {
  try {
    const response = await getAppointmentList({
      page: 1,
      pageSize: 20
    })
    
    // 处理返回的数据
    if (response.code === 0) {
      appointmentList.value = response.data.list.map(item => ({
        ...item,
        time: `${formatDateTime(item.startsAt)} 至 ${formatDateTime(item.endsAt)}`
      }))
    } else {
      ElMessage.error('获取预约列表失败: ' + response.msg)
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败: ' + (error.message || '未知错误'))
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAppointmentList()
})
</script>

<style scoped lang="scss">
.appointment-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #333;
  }
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
  
  &.pending {
    border-left: 4px solid #409eff;
  }
}

.room-name {
  flex: 0 0 150px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.appointment-info {
  flex: 1;
  
  .info-row {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      display: inline-block;
      width: 80px;
      color: #666;
    }
    
    .value {
      color: #333;
      
      &.status-unused {
        color: #e6a23c;
      }
      
      &.status-used {
        color: #67c23a;
      }
      
      &.status-pending {
        color: #409eff;
      }
      
      &.status-cancelled {
        color: #909399;
      }
    }
  }
}

.approval-button {
  flex: 0 0 auto;
}
</style>

<template>
  <div class="appointment-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>预约管理</h2>
    </div>
    
    <!-- 搜索表单 -->
    <el-form :model="searchForm" label-width="100px" class="search-form">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="房间名">
            <el-input v-model="searchForm.roomName" placeholder="请输入房间名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="searchForm.startsFrom"
              type="datetime"
              placeholder="请选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="searchForm.endsTo"
              type="datetime"
              placeholder="请选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
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
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="small" @click="openDetailDialog(appointment)">详情</el-button>
          <el-button v-if="appointment.status === 'pending'" type="success" size="small" @click="openApprovalDialog(appointment)">审批</el-button>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
  
  <!-- 审批预约弹窗 -->
  <ApproveAppointmentPop v-model:visible="approvalDialogVisible" @confirm="handleApprovalConfirm" />
  
  <!-- 详情弹窗 -->
  <AppointmentInfoPop 
    v-model="detailDialogVisible" 
    :appointment-id="currentAppointmentId" 
  />
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import ApproveAppointmentPop from './ApproveAppointmentPop.vue'
import AppointmentInfoPop from './pop/AppointmentInfoPop.vue'
import { getAppointmentList, approve } from '@/api/appointment'
import { formatDateTime } from '@/utils/date'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  roomName: '',
  startsFrom: '',
  endsTo: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 控制审批弹窗显示
const approvalDialogVisible = ref(false)

// 控制详情弹窗显示
const detailDialogVisible = ref(false)

// 当前正在查看的预约ID
const currentAppointmentId = ref(null)

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

// 打开详情弹窗
const openDetailDialog = (appointment) => {
  currentAppointmentId.value = appointment.id
  detailDialogVisible.value = true
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
      action: approvalData.approvalResult,
      comment: approvalData.approvalResult === 'approved' ? null : approvalData.rejectReason
    }
    
    await approve(currentAppointment.value.id, payload)
    
    // 更新预约列表中的状态
    if (currentAppointment.value) {
      currentAppointment.value.status = approvalData.approvalResult
    }
    
    // 显示成功消息
    ElMessage.success('审批操作成功')
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败: ' + (error.message || '未知错误'))
  }
}

// 获取预约列表数据
const fetchAppointmentList = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    // 清理空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await getAppointmentList(params)
    
    // 处理返回的数据
    if (response.code === 0) {
      appointmentList.value = response.data.list.map(item => ({
        ...item,
        time: `${formatDateTime(item.startsAt)} 至 ${formatDateTime(item.endsAt)}`
      }))
      pagination.total = response.data.total
    } else {
      ElMessage.error('获取预约列表失败: ' + response.msg)
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败: ' + (error.message || '未知错误'))
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAppointmentList()
}

// 处理重置
const handleReset = () => {
  searchForm.roomName = ''
  searchForm.startsFrom = ''
  searchForm.endsTo = ''
  pagination.page = 1
  fetchAppointmentList()
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.page = page
  fetchAppointmentList()
}

// 处理页面大小变化
const handleSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  fetchAppointmentList()
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

.search-form {
  padding: 20px;
  border-radius: 4px;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
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

.action-buttons {
  flex: 0 0 auto;
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>

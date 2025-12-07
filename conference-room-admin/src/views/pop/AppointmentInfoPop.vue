<template>
  <el-dialog
    v-model="visible"
    title="预约详情"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="appointmentData" class="appointment-detail">
      <!-- 会议室信息 -->
      <el-descriptions title="会议室信息" :column="1" border>
        <el-descriptions-item label="会议室名称">{{ appointmentData.room.name }}</el-descriptions-item>
        <el-descriptions-item label="房间号">{{ appointmentData.room.roomNumber }}</el-descriptions-item>
        <el-descriptions-item label="使用人数">{{ appointmentData.reservation.attendeesCount }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 预约信息 -->
      <el-descriptions title="预约信息" :column="1" border class="mt-20">
        <el-descriptions-item label="标题">{{ appointmentData.reservation.title }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ appointmentData.reservation.description }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatDateTime(appointmentData.reservation.startsAt) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDateTime(appointmentData.reservation.endsAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { getAppointmentDetail } from '@/api/appointment'
import { formatDateTime } from '@/utils/date'
import { ElMessage } from 'element-plus'

// 定义 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: Number,
    default: null
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue'])

// 控制弹窗显示
const visible = ref(false)

// 预约详情数据
const appointmentData = ref(null)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal && props.appointmentId) {
      fetchAppointmentDetail()
    }
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    // 关闭弹窗时清空数据
    appointmentData.value = null
  }
})

// 获取预约详情
const fetchAppointmentDetail = async () => {
  try {
    const response = await getAppointmentDetail(props.appointmentId)
    if (response.code === 0) {
      appointmentData.value = response.data
    } else {
      ElMessage.error('获取预约详情失败: ' + response.msg)
    }
  } catch (error) {
    console.error('获取预约详情失败:', error)
    ElMessage.error('获取预约详情失败: ' + (error.message || '未知错误'))
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.mt-20 {
  margin-top: 20px;
}

.appointment-detail {
  max-height: 60vh;
  overflow-y: auto;
}
</style>

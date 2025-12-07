<template>
  <el-dialog
    :model-value="visible"
    title="预约详情"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="房间名">
        <el-input v-model="formData.roomName" readonly />
      </el-form-item>
      
      <el-form-item label="房间号">
        <el-input v-model="formData.roomNumber" readonly />
      </el-form-item>
      
      <el-form-item label="开始时间" prop="startsAt">
        <el-date-picker
          v-model="formData.startsAt"
          type="datetime"
          placeholder="请选择开始时间"
          style="width: 100%"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>
      
      <el-form-item label="结束时间" prop="endsAt">
        <el-date-picker
          v-model="formData.endsAt"
          type="datetime"
          placeholder="请选择结束时间"
          style="width: 100%"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>
      
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" />
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      
      <el-form-item label="人数" prop="attendeesCount">
        <el-input-number
          v-model="formData.attendeesCount"
          :min="1"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppointmentDetail, updateAppointment } from '@/api/appointment'
import { formatISODateTime } from '@/utils/date'

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: String,
    default: ''
  }
})

// 定义emits
const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive({
  roomName: '',
  roomNumber: '',
  startsAt: '',
  endsAt: '',
  title: '',
  description: '',
  attendeesCount: 1,
  status: '' // 添加状态字段
})

// 表单验证规则
const rules = {
  startsAt: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endsAt: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  attendeesCount: [
    { required: true, message: '请输入人数', trigger: 'blur' }
  ]
}

// 获取预约详情
const fetchAppointmentDetail = async (id) => {
  try {
    const res = await getAppointmentDetail(id)
    const detail = res.data.reservation
    const room = res.data.room
    
    // 填充表单数据
    formData.roomName = room.name
    formData.roomNumber = room.roomNumber
    formData.startsAt = detail.startsAt
    formData.endsAt = detail.endsAt
    formData.title = detail.title
    formData.description = detail.description
    formData.attendeesCount = detail.attendeesCount
    formData.status = detail.status // 存储预约状态
  } catch (err) {
    console.error('获取预约详情失败:', err)
    ElMessage.error('获取预约详情失败')
  }
}

// 监听appointmentId变化
watch(
  () => props.appointmentId,
  (newVal) => {
    if (newVal) {
      fetchAppointmentDetail(newVal)
    }
  },
  { immediate: true }
)

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 检查预约状态，只有当status === 'pending'时才允许更新预约
    if (formData.status !== 'pending') {
      ElMessage.warning('该状态下不可修改预约')
      return
    }
    
    // 格式化时间字段
    const formattedStartsAt = formatISODateTime(formData.startsAt)
    const formattedEndsAt = formatISODateTime(formData.endsAt)
    
    // 调用更新接口
    await updateAppointment(props.appointmentId, {
      title: formData.title,
      description: formData.description,
      attendeesCount: formData.attendeesCount,
      startsAt: formattedStartsAt,
      endsAt: formattedEndsAt
    })
    
    ElMessage.success('更新成功')
    emit('success')
    handleClose()
  } catch (err) {
    console.error('更新预约失败:', err)
    ElMessage.error('更新预约失败')
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

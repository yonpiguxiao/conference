<template>
  <el-dialog
    :model-value="visible"
    title="取消预约"
    width="400px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="取消原因" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          placeholder="请输入取消原因"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, defineExpose, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { cancelAppointment } from '@/api/appointment.js'

export default {
  name: 'CancelAppointmentPop',
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
  emits: ['update:visible', 'success'],
  setup(props, { emit }) {
    const formRef = ref()
    const loading = ref(false)
    
    const form = reactive({
      reason: ''
    })
    
    const rules = {
      reason: [
        { required: true, message: '请输入取消原因', trigger: 'blur' }
      ]
    }
    
    const handleClose = () => {
      emit('update:visible', false)
      // 重置表单
      form.reason = ''
    }
    
    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        
        loading.value = true
        
        const res = await cancelAppointment(props.appointmentId, {
          reason: form.reason
        })
        
        if (res.code === 0) {
          ElMessage.success('取消预约成功')
          handleClose()
          emit('success', res.data)
        } else {
          ElMessage.error(res.msg || '取消预约失败')
        }
      } catch (error) {
        console.error('取消预约失败:', error)
        ElMessage.error('取消预约失败')
      } finally {
        loading.value = false
      }
    }
    
    defineExpose({
      handleClose
    })
    
    return {
      formRef,
      loading,
      form,
      rules,
      handleClose,
      handleSubmit
    }
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

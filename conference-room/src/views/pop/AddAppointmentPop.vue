<template>
  <el-dialog title="预约会议室" v-model="visible" width="500px" :before-close="handleClose">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入会议标题" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入会议描述" />
      </el-form-item>
      <el-form-item label="参与人数" prop="attendeesCount">
        <el-input-number v-model="form.attendeesCount" :min="1" placeholder="请输入参与人数" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startsAt">
        <el-date-picker
          v-model="form.startsAt"
          type="datetime"
          placeholder="请选择开始时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endsAt">
        <el-date-picker
          v-model="form.endsAt"
          type="datetime"
          placeholder="请选择结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, defineExpose } from 'vue'
import { createAppointment } from '@/api/appointment.js'
import { getCurrentUser } from '@/api/user.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'AddAppointmentPop',
  setup() {
    // 控制弹窗显示隐藏
    const visible = ref(false)
    
    // 表单数据
    const form = reactive({
      title: '',
      description: '',
      attendeesCount: 1,
      startsAt: '',
      endsAt: '',
      roomId: null
    })
    
    // 表单验证规则
    const rules = {
      title: [
        { required: true, message: '请输入会议标题', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入会议描述', trigger: 'blur' }
      ],
      attendeesCount: [
        { required: true, message: '请输入参与人数', trigger: 'blur' }
      ],
      startsAt: [
        { required: true, message: '请选择开始时间', trigger: 'change' }
      ],
      endsAt: [
        { required: true, message: '请选择结束时间', trigger: 'change' }
      ]
    }
    
    // 表单引用
    const formRef = ref(null)
    
    // 显示弹窗
    const show = (roomId) => {
      // 将roomId存储到form中
      form.roomId = roomId
      visible.value = true
    }
    
    // 关闭弹窗前的处理
    const handleClose = (done) => {
      formRef.value.resetFields()
      done()
    }
    
    // 取消按钮
    const cancel = () => {
      formRef.value.resetFields()
      visible.value = false
    }
    
    // 确定按钮
    const confirm = async () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 获取当前用户信息
            const userResponse = await getCurrentUser()
            const userId = userResponse.data.id
            
            // 构造预约数据
            const appointmentData = {
              userId: userId,
              roomId: form.roomId,
              title: form.title,
              description: form.description,
              attendeesCount: form.attendeesCount,
              startsAt: form.startsAt ? form.startsAt.replace(' ', 'T') : '',
              endsAt: form.endsAt ? form.endsAt.replace(' ', 'T') : ''
            }
            
            // 调用创建预约接口
            const response = await createAppointment(appointmentData)
            console.log('预约响应:', response)
            // 根据返回结果展示提示
            if (response.code === 0) {
              ElMessage.success('预约成功')
              // 提交成功后关闭弹窗
              visible.value = false
              // 重置表单
              formRef.value.resetFields()
            } else {
              ElMessage.error('预约失败')
            }
          } catch (error) {
            console.error('预约失败:', error)
            ElMessage.error('预约失败，预约时间冲突或服务器错误')
          }
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    }
    
    // 暴露给父组件的方法
    defineExpose({
      show
    })
    
    return {
      visible,
      form,
      rules,
      formRef,
      show,
      handleClose,
      cancel,
      confirm
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

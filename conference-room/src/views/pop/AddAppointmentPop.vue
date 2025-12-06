<template>
  <el-dialog
    title="预约会议室"
    v-model="visible"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
    >
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
      endsAt: ''
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
    const show = () => {
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
    const confirm = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          const appointmentInfo = {
            ...form
          };
          console.log('预约信息:', appointmentInfo)
          // 这里可以添加提交预约的逻辑
          // 提交成功后关闭弹窗
          visible.value = false
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    }
    
    // 暴露给父组件的方法
    defineExpose({ show })
    
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

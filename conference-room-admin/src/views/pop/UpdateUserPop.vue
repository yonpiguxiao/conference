<template>
  <el-dialog
    :title="isEdit ? '编辑用户' : '新增用户'"
    v-model="dialogVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="userForm"
      :model="userForm"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email" />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input v-model="userForm.password" type="password" show-password />
      </el-form-item>
      
      <el-form-item label="角色" prop="role">
        <el-select v-model="userForm.role" placeholder="请选择角色">
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getUser, createUser, updateUser } from '@/api/user'

export default {
  name: 'UpdateUserPop',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.modelValue,
      isEdit: !!this.userId,
      userForm: {
        username: '',
        email: '',
        password: '',
        role: 'user'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    modelValue(newVal) {
      this.dialogVisible = newVal
      if (newVal && this.isEdit) {
        this.fetchUserInfo()
      }
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('update:modelValue', false)
      }
    },
    userId(newVal) {
      this.isEdit = !!newVal
    }
  },
  methods: {
    // 获取用户详情
    async fetchUserInfo() {
      if (!this.userId) return
      
      try {
        const res = await getUser(this.userId)
        console.log(res)
        if (res.code === 0) {
          // 注意：出于安全考虑，后端通常不会返回密码，所以这里不设置密码字段
          this.userForm = {
            username: res.data.username,
            email: res.data.email || '',
            password: '', // 不显示原密码
            role: res.data.role
          }
        } else {
          this.$message.error(res.msg || '获取用户信息失败')
        }
      } catch (error) {
        this.$message.error('获取用户信息失败')
      }
    },
    
    // 关闭弹窗
    handleClose() {
      this.$emit('update:modelValue', false)
      this.resetForm()
    },
    
    // 重置表单
    resetForm() {
      this.$refs.userForm.resetFields()
      this.userForm = {
        username: '',
        email: '',
        password: '',
        role: 'user'
      }
    },
    
    // 提交表单
    handleSubmit() {
      this.$refs.userForm.validate(async valid => {
        if (!valid) return
        
        try {
          let res
          if (this.isEdit) {
            // 编辑用户
            res = await updateUser(this.userId, this.userForm)
          } else {
            // 新增用户
            res = await createUser(this.userForm)
          }
          
          if (res.code === 0) {
            this.$message.success(`${this.isEdit ? '编辑' : '新增'}用户成功`)
            this.handleClose()
            // 通知父组件刷新数据
            this.$emit('success')
          } else {
            this.$message.error(res.msg || `${this.isEdit ? '编辑' : '新增'}用户失败`)
          }
        } catch (error) {
          this.$message.error(`${this.isEdit ? '编辑' : '新增'}用户失败`)
        }
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>

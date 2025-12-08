<template>
  <div class="user-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>用户管理列表</h2>
    </div>
    
    <!-- 搜索表单 -->
    <el-form :model="listQuery" label-width="100px" class="search-form">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="用户名">
            <el-input 
              v-model="listQuery.username" 
              placeholder="请输入用户名" 
              @keyup.enter.native="handleFilter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-button type="primary" @click="handleFilter">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleCreate">新增</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <!-- 用户列表 -->
    <el-table
      :data="list"
      border
      style="width: 100%"
      v-loading="listLoading"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="username"
        label="用户名"
        width="150"
      />
      <el-table-column
        prop="email"
        label="邮箱"
        width="200"
      />
      <el-table-column
        prop="role"
        label="角色"
        width="100"
      />
      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="200"
      >
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updatedAt"
        label="更新时间"
        width="200"
      >
        <template #default="scope">
          {{ formatDate(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleUpdate(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.page"
        v-model:page-size="listQuery.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogStatus==='create'?'新增用户':'编辑用户'" v-model="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" type="password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="temp.role" class="filter-item" placeholder="请选择">
            <el-option v-for="item in roles" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listUsers as fetchList, createUser, updateUser, deleteUser } from '@/api/user'

export default {
  name: 'CUser',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        pageSize: 10,
        limit: 10,
        username: undefined
      },
      temp: {
        id: undefined,
        username: '',
        password: '',
        email: '',
        role: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        username: [{ required: true, message: '用户名不能为空', trigger: 'change' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'change' }],
        email: [{ required: true, message: '邮箱不能为空', trigger: 'change' }],
        role: [{ required: true, message: '角色不能为空', trigger: 'change' }]
      },
      roles: ['admin', 'user']
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      // 构造API需要的参数
      const params = {
        page: this.listQuery.page,
        pageSize: this.listQuery.limit,
        username: this.listQuery.username
      };
      
      fetchList(params).then(response => {
        if (response.code === 0) {
          this.list = response.data.list || [];
          this.total = response.data.total || 0;
        } else {
          this.list = [];
          this.total = 0;
          this.$message({
            message: response.msg || '获取用户列表失败',
            type: 'error'
          });
        }
      }).catch(error => {
        this.list = [];
        this.total = 0;
        this.$message({
          message: '获取用户列表失败: ' + (error.message || error),
          type: 'error'
        });
      });
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleReset() {
      this.listQuery.username = undefined
      this.handleFilter()
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该用户?', '提示', {
        confirmButtonText: '确认',
          cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.id).then(() => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getList()
        })
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '创建成功',
              type: 'success'
            })
            this.getList()
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
            this.getList()
          })
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        password: '',
        email: '',
        role: ''
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-');
    }
  }
}
</script>

<style scoped>
.user-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.conference-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  padding: 32px 16px;
}
</style>

<template>
  <div class="conference-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>会议室管理列表</h2>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模糊搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入会议室名称或房号"
          />
        </el-form-item>
        <el-form-item label="最小容量">
          <el-input-number
            v-model="searchForm.minCapacity"
            :min="0"
            placeholder="最小容量"
          />
        </el-form-item>
        <el-form-item label="位置">
          <el-input
            v-model="searchForm.location"
            placeholder="请输入位置信息"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="roomNumber" label="房号" />
        <el-table-column prop="capacity" label="可承受人数" />
        <el-table-column prop="purpose" label="用途" />
        <el-table-column label="照片">
          <template #default="scope">
            <el-image
              :src="scope.row.url || examImage"
              class="room-image"
              :preview-src-list="[scope.row.url || examImage]"
              :initial-index="0"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="可预约"
              inactive-text="不可预约"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRoomPage, setRoomStatus } from '@/api/room.js'
import { ElMessage } from 'element-plus'
import examImage from '@/assets/images/exam.png'

const router = useRouter()

// 搜索表单数据
const searchForm = ref({
  keyword: '',
  minCapacity: null,
  location: ''
})

// 表格数据
const tableData = ref([])

// 分页数据
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 搜索功能
const handleSearch = async () => {
  await fetchRoomData()
}

// 重置功能
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    minCapacity: null,
    location: ''
  }
  fetchRoomData()
}

// 新增功能
const handleAdd = () => {
  router.push({ name: 'update-conference', query: { mode: 'add' } })
}

// 编辑功能
const handleEdit = (row) => {
  router.push({ name: 'update-conference', query: { mode: 'edit', id: row.id }, state: { conferenceData: row } })
}

// 删除功能
const handleDelete = (row) => {
  console.log('删除会议室:', row)
  // 这里应该调用API删除数据
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    // 准备请求参数
    const statusData = {
      newStatus: row.status === 1 ? 'bookable' : 'unbookable',
      note: null
    };
    
    // 调用API更新状态
    const response = await setRoomStatus(row.id, statusData);
    
    if (response.code === 0) {
      // 更新成功，显示提示弹窗
      ElMessage.success('会议室状态更新成功');
    } else {
      // 更新失败，回滚状态并显示错误信息
      row.status = row.status === 1 ? 0 : 1;
      ElMessage.error(response.msg || '状态更新失败');
    }
  } catch (error) {
    // 请求异常，回滚状态并显示错误信息
    row.status = row.status === 1 ? 0 : 1;
    console.error('状态更新失败:', error);
    ElMessage.error('状态更新失败: ' + error.message);
  }
}

// 分页功能
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  fetchRoomData()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  fetchRoomData()
}

// 获取会议室数据
const fetchRoomData = async () => {
  try {
    const response = await getRoomPage(
      pagination.value.currentPage,
      pagination.value.pageSize,
      searchForm.value.keyword || null,
      null, // status参数暂时不使用
      searchForm.value.minCapacity || null,
      searchForm.value.location || null
    )
    
    if (response.code === 0) {
      // 转换数据格式以适配表格显示
      tableData.value = response.data.list.map(item => ({
        id: item.id,
        name: item.name,
        roomNumber: item.roomNumber,
        capacity: item.capacity,
        purpose: item.purpose,
        status: item.status === 'bookable' ? 1 : 0, // bookable: 1 (可预约), unbookable: 0 (不可预约)
        url: item.url
      }))
      
      pagination.value.total = response.data.total
    } else {
      ElMessage.error(response.msg || '获取会议室数据失败')
    }
  } catch (error) {
    console.error('获取会议室数据失败:', error)
    ElMessage.error('获取会议室数据失败: ' + error.message)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRoomData()
})
</script>

<style scoped lang="scss">
.conference-container {
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

.search-container {
  padding: 20px;
  border-radius: 4px;
}

.search-form {
  .el-form-item {
    margin-right: 20px;
  }
}

.table-container {
  margin-bottom: 20px;
}

.room-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>

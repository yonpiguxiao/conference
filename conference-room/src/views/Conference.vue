<template>
  <div class="conference-container">
    <!-- 标题 -->
    <div class="header">
      <h1>会议室预约列表</h1>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="模糊搜索">
          <el-input v-model="searchForm.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="最小容量">
          <el-input-number v-model="searchForm.minCapacity" :min="0" placeholder="请输入最小容量" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="searchForm.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 会议室列表 -->
    <div class="room-list">
      <el-row :gutter="20">
        <el-col :span="4" v-for="room in rooms" :key="room.id" class="room-item-col">
          <el-card class="room-item">
            <div class="room-image">
              <img :src="room.url" alt="会议室图片" />
            </div>
            <div class="room-info">
              <h3>会议室 {{ room.roomNumber }}</h3>
              <p>{{ room.location }}</p>
            </div>
            <div class="room-actions">
              <el-button size="small" @click="viewDetails(room)">查看详情</el-button>
              <el-button type="primary" size="small" @click="reserveRoom(room)">预约</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[4, 8, 12, 16]"
        :small="false"
        :disabled="false"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalRooms"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 会议室详情弹窗 -->
    <ConferenceInfoPop ref="conferenceInfoPop" />
    
    <!-- 预约弹窗 -->
    <AddAppointmentPop ref="addAppointmentPop" />
  </div>
</template>

<script>
import { ref, onMounted, nextTick, getCurrentInstance } from 'vue'
import roomImage from '@/assets/images/exam.png'
import ConferenceInfoPop from '@/views/pop/ConferenceInfoPop.vue'
import AddAppointmentPop from '@/views/pop/AddAppointmentPop.vue'
import { getRoomPage } from '@/api/room.js'

export default {
  name: 'Conference',
  components: {
    ConferenceInfoPop,
    AddAppointmentPop
  },
  setup() {
    // 获取当前实例
    const instance = getCurrentInstance()
    
    // 获取子组件引用
    const conferenceInfoPop = ref(null)
    const addAppointmentPop = ref(null)
    
    // 搜索表单数据
    const searchForm = ref({
      keyword: '',
      minCapacity: null,
      location: ''
    })

    // 分页数据
    const currentPage = ref(1)
    const pageSize = ref(8)
    const totalRooms = ref(24)

    // 会议室数据
    const rooms = ref([])

    // 方法
    const onSearch = () => {
      console.log('搜索:', searchForm.value)
      // 调用API进行搜索
      getRoomPage(
        currentPage.value,
        pageSize.value,
        searchForm.value.keyword || null,
        null, // status参数暂不使用
        searchForm.value.minCapacity || null,
        searchForm.value.location || null
      ).then(response => {
        console.log('搜索结果:', response)
        // 更新会议室数据
        rooms.value = response.data.list
        totalRooms.value = response.data.total
      }).catch(error => {
        console.error('搜索失败:', error)
      })
    }

    const onReset = () => {
      searchForm.value.keyword = ''
      searchForm.value.minCapacity = null
      searchForm.value.location = ''
      console.log('重置搜索条件')
      // 重置后重新加载数据
      onSearch()
    }

    const viewDetails = (room) => {
      console.log('查看会议室详情:', room)
      // 显示弹窗
      // 确保引用存在且有show方法
      if (conferenceInfoPop.value && typeof conferenceInfoPop.value.show === 'function') {
        conferenceInfoPop.value.show(room)
      } else {
        console.error('无法调用show方法:', conferenceInfoPop.value)
      }
    }

    const reserveRoom = (room) => {
      console.log('预约会议室:', room)
      // 显示预约弹窗
      nextTick(() => {
        if (addAppointmentPop.value && typeof addAppointmentPop.value.show === 'function') {
          addAppointmentPop.value.show()
        } else if (instance.refs.addAppointmentPop && typeof instance.refs.addAppointmentPop.show === 'function') {
          instance.refs.addAppointmentPop.show()
        } else {
          console.error('无法调用预约弹窗的show方法:', addAppointmentPop.value)
        }
      })
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      console.log(`每页 ${val} 条`)
      // 重新加载数据
      onSearch()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      console.log(`当前页: ${val}`)
      // 重新加载数据
      onSearch()
    }

    // 检查组件是否正确挂载
    onMounted(() => {
      console.log('ConferenceInfoPop 组件引用:', conferenceInfoPop.value)
      // 组件挂载时加载初始数据
      onSearch()
    })

    return {
      conferenceInfoPop,
      searchForm,
      currentPage,
      pageSize,
      totalRooms,
      rooms,
      roomImage,
      onSearch,
      onReset,
      viewDetails,
      reserveRoom,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.conference-container {
  padding: 20px;
}

.header h1 {
  margin-top: 40px;
  color: #333;
}

.search-area {
  padding: 20px;
  border-radius: 4px;
}

.room-list {
  margin-bottom: 20px;
}

.room-item-col {
  margin-bottom: 20px;
}

.room-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.room-image {
  text-align: center;
  margin-bottom: 15px;
}

.room-image img {
  max-width: 100%;
  height: 150px;
  object-fit: cover;
}

.room-info {
  flex-grow: 1;
  margin-bottom: 15px;
  text-align: center;
}

.room-info h3 {
  margin: 0;
  color: #333;
}

.room-actions {
  display: flex;
  justify-content: space-between;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>

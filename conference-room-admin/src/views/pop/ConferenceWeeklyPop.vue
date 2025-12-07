<template>
  <el-dialog
    :model-value="visible"
    title="会议室周视图"
    width="80%"
    @close="handleClose"
  >
    <div class="weekly-view">
      <!-- 周选择器 -->
      <div class="week-selector">
        <el-date-picker
          v-model="selectedWeek"
          type="week"
          format="第 ww 周 (yyyy-MM-dd)"
          value-format="YYYY-MM-DD"
          placeholder="选择周"
          @change="handleWeekChange"
        />
      </div>
      
      <!-- 周视图表 -->
      <div class="weekly-table-container">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="time"
            label="时间段"
            width="120"
            fixed
          />
          
          <el-table-column
            v-for="(day, index) in weekDays"
            :key="index"
            :prop="'day' + index"
            :label="formatDayLabel(day)"
            width="120"
          >
            <template #default="{ row }">
              <div 
                class="status-cell"
                :class="row.status[index]"
              >
                {{ getStatusText(row.status[index]) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getWeeklyRoomStatus } from '@/api/room'
import { ElMessage } from 'element-plus'

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: Number,
    required: true
  },
  roomName: {
    type: String,
    required: true
  }
})

// 定义emit事件
const emit = defineEmits(['update:visible'])

// 响应式数据
const selectedWeek = ref('')
const weeklyData = ref(null)
const loading = ref(false)

// 计算属性
const weekDays = computed(() => {
  if (!weeklyData.value) return []
  // 根据start_date和days生成日期数组
  const dates = []
  const startDate = new Date(weeklyData.value.start_date)
  for (let i = 0; i < weeklyData.value.days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }
  return dates
})

const tableData = computed(() => {
  if (!weeklyData.value) return []
  
  // 创建时间段数据（每半小时一个时段）
  const timeSlots = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const endTime = minute === 30 
        ? `${(hour + 1).toString().padStart(2, '0')}:00`
        : `${hour.toString().padStart(2, '0')}:30`
      
      timeSlots.push({
        time: `${startTime}-${endTime}`,
        startHour: hour,
        startMinute: minute,
        status: Array(7).fill('free') // 初始化为免费状态
      })
    }
  }
  
  // 根据预约数据更新状态
  weeklyData.value.rooms[0].days.forEach((day, dayIndex) => {
    // 如果当天有预约，则精确处理每个预约时间段
    if (day.reservations && day.reservations.length > 0) {
      day.reservations.forEach(reservation => {
        // 解析预约开始和结束时间
        const startDateTime = new Date(reservation.starts_at);
        const endDateTime = new Date(reservation.ends_at);
        
        // 获取预约日期
        const reservationStartDate = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate());
        const reservationEndDate = new Date(endDateTime.getFullYear(), endDateTime.getMonth(), endDateTime.getDate());
        
        // 获取当前处理的日期
        const currentDayDate = new Date(day.date);
        
        // 处理时区问题，确保时间正确
        const startHour = startDateTime.getHours();
        const startMinute = startDateTime.getMinutes();
        const endHour = endDateTime.getHours();
        const endMinute = endDateTime.getMinutes();
        
        // 更新对应时间段的状态
        timeSlots.forEach(slot => {
          // 判断时间段是否与预约时间重叠
          const slotStartHour = slot.startHour;
          const slotStartMinute = slot.startMinute;
          const slotEndHour = slotStartMinute === 30 ? slotStartHour + 1 : slotStartHour;
          const slotEndMinute = slotStartMinute === 30 ? 0 : 30;
          
          // 构造当前时间段的完整日期时间
          const slotStartDate = new Date(currentDayDate);
          slotStartDate.setHours(slotStartHour, slotStartMinute, 0, 0);
          const slotEndDate = new Date(currentDayDate);
          slotEndDate.setHours(slotEndHour, slotEndMinute, 0, 0);
          
          // 判断预约时间是否覆盖当前时间段
          // 条件：预约开始时间早于时间段结束时间 且 预约结束时间晚于时间段开始时间
          if (startDateTime < slotEndDate && endDateTime > slotStartDate) {
            slot.status[dayIndex] = 'booked';
            console.log(`标记为已预约: ${slot.time} 在 ${day.date}`);
          }
        });
      });
    }
  })
  
  // 初始化未被预约的时间段为空闲状态
  timeSlots.forEach(slot => {
    slot.status = slot.status.map(status => status === 'booked' ? 'booked' : 'free');
  });
  
  return timeSlots
})

// 方法
const handleClose = () => {
  emit('update:visible', false)
}

const formatDayLabel = (date) => {
  if (!date) return ''
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  return `${weekday}\n${date.getMonth() + 1}-${date.getDate()}`
}

const getStatusText = (status) => {
  switch (status) {
    case 'booked':
      return '已预约'
    case 'free':
      return '空闲'
    default:
      return '空闲'
  }
}

const handleWeekChange = (val) => {
  if (val) {
    fetchWeeklyData(val)
  }
}

const fetchWeeklyData = async (startDate) => {
  try {
    loading.value = true
    const res = await getWeeklyRoomStatus(startDate, 7, [props.roomId])
    
    if (res.code === 0) {
      weeklyData.value = res.data
    } else {
      ElMessage.error(res.msg || '获取周视图数据失败')
    }
  } catch (error) {
    ElMessage.error('获取周视图数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 初始化本周日期
onMounted(() => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) // 调整到周一
  const monday = new Date(today.setDate(diff))
  selectedWeek.value = monday.toISOString().split('T')[0]
  fetchWeeklyData(selectedWeek.value)
})

// 监听roomId变化
watch(() => props.roomId, (newVal) => {
  if (newVal && selectedWeek.value) {
    fetchWeeklyData(selectedWeek.value)
  }
})
</script>

<style scoped>
.weekly-view {
  padding: 20px;
}

.week-selector {
  margin-bottom: 20px;
  text-align: center;
}

.weekly-table-container {
  max-height: 500px;
  overflow-y: auto;
}

.status-cell {
  padding: 5px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
}

.status-cell.booked {
  background-color: #f56c6c;
  color: white;
}

.status-cell.free {
  background-color: #67c23a;
  color: white;
}
</style>

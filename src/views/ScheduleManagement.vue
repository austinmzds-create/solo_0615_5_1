<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, SwitchButton, Delete, Edit } from '@element-plus/icons-vue'
import {
  getInitialSchedules,
  saveSchedules,
  type Schedule,
  WEEKDAYS,
  TIME_SLOTS
} from '../mock/schedules'
import { getInitialCourses, type Course } from '../mock/courses'
import { mockUsers } from '../mock/accounts'
import { checkClassroomConflict } from '../utils/scheduleConflict'

const router = useRouter()

const schedules = ref<Schedule[]>([])
const courses = ref<Course[]>([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<string | null>(null)

const scheduleForm = ref({
  courseId: '',
  className: '',
  weekday: '' as string,
  timeSlot: '' as string,
  classroom: ''
})

const formRules: FormRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  className: [{ required: true, message: '请填写班级', trigger: 'blur' }],
  weekday: [{ required: true, message: '请选择星期', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请选择时段', trigger: 'change' }],
  classroom: [{ required: true, message: '请填写教室', trigger: 'blur' }]
}

const classOptions = ['高三(1)班', '高三(2)班', '高三(3)班']

const currentUser = computed(() => {
  const username = localStorage.getItem('smart_campus_current_user')
  if (!username) return null
  return mockUsers.find((u) => u.username === username) || null
})

const filteredSchedules = computed(() => {
  if (!searchKeyword.value.trim()) {
    return schedules.value
  }
  const keyword = searchKeyword.value.trim().toLowerCase()
  return schedules.value.filter(
    (s) =>
      s.courseName.toLowerCase().includes(keyword) ||
      s.className.toLowerCase().includes(keyword) ||
      s.teacher.toLowerCase().includes(keyword) ||
      s.classroom.toLowerCase().includes(keyword)
  )
})

const courseOptions = computed(() => {
  return courses.value.map((c) => ({
    value: c.id,
    label: c.name,
    disabled: c.status === 'inactive',
    teacher: c.teacher,
    status: c.status
  }))
})

onMounted(() => {
  if (!currentUser.value || currentUser.value.role !== 'teacher') {
    router.replace('/login')
    return
  }
  schedules.value = getInitialSchedules()
  courses.value = getInitialCourses()
})

const handleSearch = () => {
  // filtering is reactive via computed
}

const handleReset = () => {
  searchKeyword.value = ''
}

const openAddDialog = () => {
  editingId.value = null
  scheduleForm.value = {
    courseId: '',
    className: '',
    weekday: '',
    timeSlot: '',
    classroom: ''
  }
  dialogVisible.value = true
}

const openEditDialog = (row: Schedule) => {
  editingId.value = row.id
  scheduleForm.value = {
    courseId: row.courseId,
    className: row.className,
    weekday: row.weekday,
    timeSlot: row.timeSlot,
    classroom: row.classroom
  }
  dialogVisible.value = true
}

const handleAddConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return

    const selectedCourse = courses.value.find((c) => c.id === scheduleForm.value.courseId)
    if (!selectedCourse) {
      ElMessage.error('请选择有效的课程')
      return
    }
    if (selectedCourse.status === 'inactive') {
      ElMessage.error('停用课程不能用于新建课表')
      return
    }

    const conflictResult = checkClassroomConflict(
      schedules.value,
      scheduleForm.value.weekday,
      scheduleForm.value.timeSlot,
      scheduleForm.value.classroom,
      editingId.value
    )
    if (conflictResult.hasConflict) {
      ElMessage.error(conflictResult.message)
      return
    }

    if (editingId.value) {
      const index = schedules.value.findIndex((s) => s.id === editingId.value)
      if (index > -1) {
        schedules.value[index] = {
          ...schedules.value[index],
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          className: scheduleForm.value.className,
          teacher: selectedCourse.teacher,
          weekday: scheduleForm.value.weekday as Schedule['weekday'],
          timeSlot: scheduleForm.value.timeSlot as Schedule['timeSlot'],
          classroom: scheduleForm.value.classroom
        }
        saveSchedules(schedules.value)
        ElMessage.success('课表编辑成功')
      }
    } else {
      const newSchedule: Schedule = {
        id: `S${String(schedules.value.length + 1).padStart(3, '0')}`,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        className: scheduleForm.value.className,
        teacher: selectedCourse.teacher,
        weekday: scheduleForm.value.weekday as Schedule['weekday'],
        timeSlot: scheduleForm.value.timeSlot as Schedule['timeSlot'],
        classroom: scheduleForm.value.classroom,
        createdAt: new Date().toLocaleString('zh-CN')
      }

      schedules.value.unshift(newSchedule)
      saveSchedules(schedules.value)
      ElMessage.success('课表添加成功')
    }
    dialogVisible.value = false
  })
}

const handleDelete = async (row: Schedule) => {
  try {
    await ElMessageBox.confirm(`确认删除课表「${row.courseName} - ${row.weekday}${row.timeSlot}」？`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = schedules.value.findIndex((s) => s.id === row.id)
    if (index > -1) {
      schedules.value.splice(index, 1)
      saveSchedules(schedules.value)
      ElMessage.success('课表已删除')
    }
  } catch {
    // cancelled
  }
}

const handleLogout = () => {
  localStorage.removeItem('smart_campus_current_user')
  router.replace('/login')
}

const goToCourses = () => {
  router.push('/courses')
}
</script>

<template>
  <div class="schedule-page">
    <el-container>
      <el-header class="page-header">
        <div class="header-left">
          <h1 class="page-title">课表管理</h1>
          <span class="teacher-name">{{ currentUser?.name }}</span>
        </div>
        <div class="header-right">
          <el-button @click="goToCourses">课程管理</el-button>
          <el-button type="primary" :icon="Plus" @click="openAddDialog">
            新增课表
          </el-button>
          <el-button :icon="SwitchButton" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="page-main">
        <el-card class="filter-card" shadow="never">
          <el-form inline>
            <el-form-item label="搜索">
              <el-input
                v-model="searchKeyword"
                placeholder="课程/班级/教师/教室"
                clearable
                style="width: 280px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">
                查询
              </el-button>
              <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
          <el-table :data="filteredSchedules" stripe border style="width: 100%">
            <el-table-column prop="id" label="课表编号" width="100" />
            <el-table-column prop="courseName" label="课程名称" width="140" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="weekday" label="星期" width="80" align="center" />
            <el-table-column prop="timeSlot" label="时段" width="100" align="center" />
            <el-table-column prop="classroom" label="教室" width="140" />
            <el-table-column label="操作" width="140" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Edit" @click="openEditDialog(row)">
                  编辑
                </el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑课表' : '新增课表'"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="scheduleForm" :rules="formRules" label-width="100px">
        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="scheduleForm.courseId"
            placeholder="请选择课程"
            style="width: 100%"
          >
            <el-option
              v-for="course in courseOptions"
              :key="course.value"
              :label="course.label"
              :value="course.value"
              :disabled="course.disabled"
            >
              <span style="float: left">{{ course.label }}</span>
              <span
                v-if="course.disabled"
                style="float: right; color: #909399; font-size: 12px"
              >
                已停用
              </span>
              <span
                v-else
                style="float: right; color: #67c23a; font-size: 12px"
              >
                启用中
              </span>
            </el-option>
          </el-select>
          <div style="font-size: 12px; color: #909399; margin-top: 4px">
            提示：停用课程不能选择
          </div>
        </el-form-item>

        <el-form-item label="班级" prop="className">
          <el-select
            v-model="scheduleForm.className"
            placeholder="请选择班级"
            style="width: 100%"
          >
            <el-option
              v-for="cls in classOptions"
              :key="cls"
              :label="cls"
              :value="cls"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="星期" prop="weekday">
          <el-select
            v-model="scheduleForm.weekday"
            placeholder="请选择星期"
            style="width: 100%"
          >
            <el-option
              v-for="day in WEEKDAYS"
              :key="day"
              :label="day"
              :value="day"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时段" prop="timeSlot">
          <el-select
            v-model="scheduleForm.timeSlot"
            placeholder="请选择时段"
            style="width: 100%"
          >
            <el-option
              v-for="slot in TIME_SLOTS"
              :key="slot"
              :label="slot"
              :value="slot"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="教室" prop="classroom">
          <el-input
            v-model="scheduleForm.classroom"
            placeholder="请填写教室"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddConfirm">{{ editingId ? '确认编辑' : '确认添加' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.schedule-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.teacher-name {
  font-size: 14px;
  color: #909399;
}

.page-main {
  padding: 20px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-card :deep(.el-card__body) {
  padding-bottom: 2px;
}

.table-card :deep(.el-card__body) {
  padding-top: 0;
}

.el-table {
  margin-top: 12px;
}
</style>

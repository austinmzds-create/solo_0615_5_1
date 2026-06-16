<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, SwitchButton, Plus } from '@element-plus/icons-vue'
import {
  getInitialCourses,
  saveCourses,
  type Course,
  type CourseStatus
} from '../mock/courses'
import { mockUsers } from '../mock/accounts'

const router = useRouter()

const courses = ref<Course[]>([])
const activeTab = ref<CourseStatus | 'all'>('all')
const searchKeyword = ref('')

const currentUser = computed(() => {
  const username = localStorage.getItem('smart_campus_current_user')
  if (!username) return null
  return mockUsers.find((u) => u.username === username) || null
})

const tabCounts = computed(() => {
  const all = courses.value.length
  const active = courses.value.filter((c) => c.status === 'active').length
  const inactive = courses.value.filter((c) => c.status === 'inactive').length
  return { all, active, inactive }
})

const filteredCourses = computed(() => {
  let result = courses.value

  if (activeTab.value !== 'all') {
    result = result.filter((c) => c.status === activeTab.value)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.teacher.toLowerCase().includes(keyword) ||
        c.id.toLowerCase().includes(keyword)
    )
  }

  return result
})

onMounted(() => {
  if (!currentUser.value || currentUser.value.role !== 'teacher') {
    router.replace('/login')
    return
  }
  courses.value = getInitialCourses()
})

const statusTagType = (status: CourseStatus) => {
  const map: Record<CourseStatus, '' | 'success' | 'danger' | 'info' | 'warning'> = {
    active: 'success',
    inactive: 'info'
  }
  return map[status]
}

const statusLabel = (status: CourseStatus) => {
  const map: Record<CourseStatus, string> = {
    active: '启用',
    inactive: '停用'
  }
  return map[status]
}

const handleSearch = () => {
  // filtering is reactive via computed
}

const handleReset = () => {
  searchKeyword.value = ''
}

const handleToggleStatus = async (row: Course) => {
  const action = row.status === 'active' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}课程「${row.name}」？`, '状态确认', {
      confirmButtonText: `确认${action}`,
      cancelButtonText: '取消',
      type: row.status === 'active' ? 'warning' : 'success'
    })
    const target = courses.value.find((c) => c.id === row.id)
    if (target) {
      target.status = target.status === 'active' ? 'inactive' : 'active'
      saveCourses(courses.value)
      ElMessage.success(`课程已${action}`)
    }
  } catch {
    // cancelled
  }
}

const handleLogout = () => {
  localStorage.removeItem('smart_campus_current_user')
  router.replace('/login')
}

const goToSchedule = () => {
  router.push('/schedule')
}
</script>

<template>
  <div class="course-page">
    <el-container>
      <el-header class="page-header">
        <div class="header-left">
          <h1 class="page-title">课程管理</h1>
          <span class="teacher-name">{{ currentUser?.name }}</span>
        </div>
        <div class="header-right">
          <el-button @click="goToSchedule">课表管理</el-button>
          <el-button :icon="SwitchButton" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="page-main">
        <el-card class="filter-card" shadow="never">
          <el-form inline>
            <el-form-item label="搜索">
              <el-input
                v-model="searchKeyword"
                placeholder="课程名称/教师/编号"
                clearable
                style="width: 240px"
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
          <el-tabs v-model="activeTab">
            <el-tab-pane label="全部" name="all">
              <template #label>
                全部 <el-badge :value="tabCounts.all" class="tab-badge" type="info" />
              </template>
            </el-tab-pane>
            <el-tab-pane label="启用" name="active">
              <template #label>
                启用 <el-badge :value="tabCounts.active" class="tab-badge" type="success" />
              </template>
            </el-tab-pane>
            <el-tab-pane label="停用" name="inactive">
              <template #label>
                停用 <el-badge :value="tabCounts.inactive" class="tab-badge" type="warning" />
              </template>
            </el-tab-pane>
          </el-tabs>

          <el-table :data="filteredCourses" stripe border style="width: 100%">
            <el-table-column prop="id" label="课程编号" width="100" />
            <el-table-column prop="name" label="课程名称" width="160" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="credit" label="学分" width="80" align="center" />
            <el-table-column prop="hours" label="学时" width="80" align="center" />
            <el-table-column prop="description" label="课程描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  :type="row.status === 'active' ? 'danger' : 'success'"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 'active' ? '停用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.course-page {
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

.tab-badge {
  margin-left: 4px;
}

.tab-badge :deep(.el-badge__content) {
  font-size: 11px;
}

.el-table {
  margin-top: 12px;
}
</style>

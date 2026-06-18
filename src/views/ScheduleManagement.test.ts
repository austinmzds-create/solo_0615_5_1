import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import ScheduleManagement from './ScheduleManagement.vue'
import type { Schedule } from '../mock/schedules'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn()
  })
}))

const mountSchedule = () => {
  return mount(ScheduleManagement, {
    global: {
      plugins: [ElementPlus]
    }
  })
}

describe('ScheduleManagement.vue - 教师筛选回归测试', () => {
  beforeEach(() => {
    localStorage.setItem('smart_campus_current_user', 'teacher')
    localStorage.removeItem('smart_campus_schedules')
    localStorage.removeItem('smart_campus_schedule_teacher_filter')
    vi.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  describe('选择教师后只显示该教师课表', () => {
    it('选择张明后应只显示张明的课表', async () => {
      const wrapper = mountSchedule()
      await wrapper.vm.$nextTick()

      const allCount = (wrapper.vm as any).filteredSchedules.length
      expect(allCount).toBeGreaterThan(1)

      ;(wrapper.vm as any).selectedTeacher = '张明'
      await wrapper.vm.$nextTick()

      const filtered = (wrapper.vm as any).filteredSchedules as Schedule[]
      expect(filtered.length).toBeGreaterThan(0)
      for (const s of filtered) {
        expect(s.teacher).toBe('张明')
      }
    })

    it('选择李华后应只显示李华的课表', async () => {
      const wrapper = mountSchedule()
      await wrapper.vm.$nextTick()

      ;(wrapper.vm as any).selectedTeacher = '李华'
      await wrapper.vm.$nextTick()

      const filtered = (wrapper.vm as any).filteredSchedules as Schedule[]
      expect(filtered.length).toBeGreaterThan(0)
      for (const s of filtered) {
        expect(s.teacher).toBe('李华')
      }
    })

    it('清空教师筛选后应显示全部课表', async () => {
      const wrapper = mountSchedule()
      await wrapper.vm.$nextTick()

      const allCount = (wrapper.vm as any).filteredSchedules.length

      ;(wrapper.vm as any).selectedTeacher = '张明'
      await wrapper.vm.$nextTick()
      expect((wrapper.vm as any).filteredSchedules.length).toBeLessThan(allCount)

      ;(wrapper.vm as any).selectedTeacher = ''
      await wrapper.vm.$nextTick()
      expect((wrapper.vm as any).filteredSchedules.length).toBe(allCount)
    })
  })

  describe('删除教师最后一条课表后筛选项同步消失并回到全部', () => {
    it('删除张明最后一条课表后，筛选项中张明消失并回到全部显示', async () => {
      const wrapper = mountSchedule()
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any
      expect(vm.teacherOptions).toContain('张明')

      vm.selectedTeacher = '张明'
      await wrapper.vm.$nextTick()
      expect(vm.selectedTeacher).toBe('张明')
      expect(vm.filteredSchedules.length).toBeGreaterThan(0)

      const zhangMingIds = vm.schedules
        .filter((s: Schedule) => s.teacher === '张明')
        .map((s: Schedule) => s.id)

      for (const id of zhangMingIds) {
        const index = vm.schedules.findIndex((s: Schedule) => s.id === id)
        if (index > -1) {
          vm.schedules.splice(index, 1)
        }
      }
      await wrapper.vm.$nextTick()

      expect(vm.teacherOptions).not.toContain('张明')
      expect(vm.selectedTeacher).toBe('')
      expect(vm.filteredSchedules.length).toBe(vm.schedules.length)
    })

    it('教师选项列表应与课表数据中的教师保持同步', async () => {
      const wrapper = mountSchedule()
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any
      const initialTeachers = new Set(vm.schedules.map((s: Schedule) => s.teacher))
      expect(vm.teacherOptions.length).toBe(initialTeachers.size)

      const wangQiangSchedules = vm.schedules.filter((s: Schedule) => s.teacher === '王强')
      for (const s of wangQiangSchedules) {
        const index = vm.schedules.findIndex((sch: Schedule) => sch.id === s.id)
        if (index > -1) {
          vm.schedules.splice(index, 1)
        }
      }
      await wrapper.vm.$nextTick()

      expect(vm.teacherOptions).not.toContain('王强')
      const remainingTeachers = new Set(vm.schedules.map((s: Schedule) => s.teacher))
      expect(vm.teacherOptions.length).toBe(remainingTeachers.size)
    })
  })
})

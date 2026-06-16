export type WeekDay = '周一' | '周二' | '周三' | '周四' | '周五'
export type TimeSlot = '第1-2节' | '第3-4节' | '第5-6节' | '第7-8节'

export interface Schedule {
  id: string
  courseId: string
  courseName: string
  className: string
  teacher: string
  weekday: WeekDay
  timeSlot: TimeSlot
  classroom: string
  createdAt: string
}

const STORAGE_KEY = 'smart_campus_schedules'

const WEEKDAYS: WeekDay[] = ['周一', '周二', '周三', '周四', '周五']
const TIME_SLOTS: TimeSlot[] = ['第1-2节', '第3-4节', '第5-6节', '第7-8节']

const RAW_SCHEDULES: Omit<Schedule, 'createdAt'>[] = [
  {
    id: 'S001',
    courseId: 'C001',
    courseName: '高等数学',
    className: '高三(1)班',
    teacher: '张明',
    weekday: '周一',
    timeSlot: '第1-2节',
    classroom: '教学楼A101'
  },
  {
    id: 'S002',
    courseId: 'C002',
    courseName: '大学英语',
    className: '高三(1)班',
    teacher: '李华',
    weekday: '周二',
    timeSlot: '第3-4节',
    classroom: '教学楼A202'
  },
  {
    id: 'S003',
    courseId: 'C003',
    courseName: '程序设计基础',
    className: '高三(2)班',
    teacher: '王强',
    weekday: '周三',
    timeSlot: '第5-6节',
    classroom: '实验楼B301'
  },
  {
    id: 'S004',
    courseId: 'C004',
    courseName: '数据结构',
    className: '高三(2)班',
    teacher: '刘芳',
    weekday: '周四',
    timeSlot: '第1-2节',
    classroom: '教学楼A103'
  },
  {
    id: 'S005',
    courseId: 'C005',
    courseName: '计算机网络',
    className: '高三(3)班',
    teacher: '陈伟',
    weekday: '周五',
    timeSlot: '第3-4节',
    classroom: '教学楼A205'
  }
]

export { WEEKDAYS, TIME_SLOTS }

export function getInitialSchedules(): Schedule[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as Schedule[]
    } catch {
      // ignore
    }
  }
  const schedules: Schedule[] = RAW_SCHEDULES.map((item) => ({
    ...item,
    createdAt: '2026-03-01 08:00'
  }))
  saveSchedules(schedules)
  return schedules
}

export function saveSchedules(schedules: Schedule[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
}

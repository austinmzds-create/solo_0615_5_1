export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string
  name: string
  teacher: string
  credit: number
  hours: number
  description: string
  status: CourseStatus
  createdAt: string
}

const STORAGE_KEY = 'smart_campus_courses'

const RAW_COURSES: Omit<Course, 'status' | 'createdAt'>[] = [
  {
    id: 'C001',
    name: '高等数学',
    teacher: '张明',
    credit: 4,
    hours: 64,
    description: '微积分、线性代数基础'
  },
  {
    id: 'C002',
    name: '大学英语',
    teacher: '李华',
    credit: 3,
    hours: 48,
    description: '英语听说读写综合训练'
  },
  {
    id: 'C003',
    name: '程序设计基础',
    teacher: '王强',
    credit: 3,
    hours: 48,
    description: 'C/C++ 程序设计入门'
  },
  {
    id: 'C004',
    name: '数据结构',
    teacher: '刘芳',
    credit: 3,
    hours: 48,
    description: '常用数据结构与算法'
  },
  {
    id: 'C005',
    name: '计算机网络',
    teacher: '陈伟',
    credit: 3,
    hours: 48,
    description: '网络协议与架构'
  },
  {
    id: 'C006',
    name: '数据库原理',
    teacher: '赵丽',
    credit: 3,
    hours: 48,
    description: '关系数据库设计与应用'
  },
  {
    id: 'C007',
    name: '操作系统',
    teacher: '孙磊',
    credit: 3,
    hours: 48,
    description: '操作系统原理与实现'
  },
  {
    id: 'C008',
    name: '软件工程',
    teacher: '周敏',
    credit: 2,
    hours: 32,
    description: '软件开发流程与管理'
  }
]

export function getInitialCourses(): Course[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as Course[]
    } catch {
      // ignore
    }
  }
  const courses: Course[] = RAW_COURSES.map((item) => ({
    ...item,
    status: 'active' as CourseStatus,
    createdAt: '2026-03-01 08:00'
  }))
  saveCourses(courses)
  return courses
}

export function saveCourses(courses: Course[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

export function getActiveCourses(): Course[] {
  return getInitialCourses().filter((c) => c.status === 'active')
}

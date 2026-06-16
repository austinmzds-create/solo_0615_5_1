import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/leave-approval',
      name: 'LeaveApproval',
      component: () => import('../views/LeaveApproval.vue')
    },
    {
      path: '/courses',
      name: 'CourseManagement',
      component: () => import('../views/CourseManagement.vue')
    },
    {
      path: '/schedule',
      name: 'ScheduleManagement',
      component: () => import('../views/ScheduleManagement.vue')
    }
  ]
})

export default router

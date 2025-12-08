import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [    
    {
      path: "/",
      redirect: "/home/conference"
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/Home.vue"),
      children: [
        {
          path: 'appointment',
          name: 'appointment',
          component: () => import('@/views/Appointment.vue'),
        },
        {
          path: 'conference',
          name: 'conference',
          component: () => import('@/views/Conference.vue'),
        },
        {
          path: 'update-conference',
          name: 'update-conference',
          component: () => import('@/views/UpdateConference.vue'),
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/CUser.vue'),
        },
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    }
  ],
})

// 全局前置守卫，检查token
router.beforeEach((to, from, next) => {
  // 获取token
  const token = getToken()
  
  // 如果要访问的不是登录页面，且没有token，则重定向到登录页面
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    // 否则正常访问
    next()
  }
})

export default router

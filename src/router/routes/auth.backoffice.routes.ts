import type { RouteRecordRaw } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/backoffice/login',
    name: 'LoginView',
    component: LoginView
  }
]
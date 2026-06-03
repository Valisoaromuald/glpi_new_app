import type { RouteRecordRaw } from 'vue-router'
import { authRoutes } from './auth.backoffice.routes'
import { backofficeRoutes } from './pages.backoffice.routes'


export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'accueil',component:()=>import('@/views/login/LoginView.vue') },
  ...authRoutes,
  ...backofficeRoutes
]
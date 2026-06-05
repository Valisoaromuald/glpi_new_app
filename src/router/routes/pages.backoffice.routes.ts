import type { RouteRecordRaw } from 'vue-router'



export const backofficeRoutes: RouteRecordRaw[] = [
  {
    path: '/backoffice',
    component: () => import('@/layouts/BackOfficeLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/backoffice/home',
    children: [
      {
        path: 'home',
        name: 'BackOfficeHome',
        component: () => import('@/views/home/BackOfficeHomeView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/login/LoginView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'import',
        name: 'ImportCsv',
        component: () => import('@/components/import/ImportCard.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'reset',
        name: 'ResetView',
        component: () => import('@/views/reset/ResetView.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]
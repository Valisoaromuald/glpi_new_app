import type { RouteRecordRaw } from 'vue-router'
import BackOfficeLayout from '@/layouts/BackOfficeLayout.vue'


export const backofficeRoutes: RouteRecordRaw[] = [
  {
    path: '/backoffice',
    component: BackOfficeLayout,
    meta: { requiresAuth: true },
    redirect: '/backoffice/home',
    children: [
      {
        path: 'import',
        name: 'ImportCsv',
        component: () => import('@/views/import/DataImport.vue'),
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
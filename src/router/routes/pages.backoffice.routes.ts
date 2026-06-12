import type { RouteRecordRaw } from 'vue-router'



export const backofficeRoutes: RouteRecordRaw[] = [
    {
        path: '/',
      component: () => import('@/components/PortalSelector.vue'),
    },
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
          component: () => import('@/views/import/DataImport.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'reset',
          name: 'ResetView',
          component: () => import('@/views/reset/ResetView.vue'),
          meta: { requiresAdmin: true }
        }, 
        {
          path: 'tickets',
          component: () => import('@/views/assistance/TicketListView.vue')
        },
        {
          path: 'tickets/:id',
          component: () => import('@/views/assistance/TicketDetailView.vue')
        }
        ,{
          path: 'kanban',
          children:[
            {
              path:'',
              component: () => import('@/views/kanban/KanbanView.vue')
            },{
              path:'config',
              component: () => import('@/views/kanban/KanbanConfigView.vue')
            }
          ]
        }
    ]
  }
]
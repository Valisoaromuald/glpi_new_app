import type { RouteRecordRaw } from 'vue-router'


export const frontofficeRoutes: RouteRecordRaw[] = [
    {
        path: '/frontoffice',
        name: 'Home',
        redirect: '/frontoffice/home',
        children: [
            {
                path: 'home',
                name: 'FrontOfficeHome',
                component: () => import('@/components/asset/AssetList.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'ticket/form',
                name: 'TicketForm',
                component: () => import('@/components/assistance/TicketForm.vue'),
            }
        ]
    },


]
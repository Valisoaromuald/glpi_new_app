import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { navigationGuard } from './guard'   // optionnel, voir ci-dessous

const router = createRouter({
  history: createWebHistory(),
  routes
})

// router.beforeEach(navigationGuard)

export default router
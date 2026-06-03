import glpiOAuthService from '@/services/authentication/GlpiOAuthService'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export async function navigationGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): Promise<boolean | string>{
  const authRequired = to.meta.requiresAuth as boolean | undefined
  const adminRequired = to.meta.requiresAdmin as boolean | undefined
  const authService = new glpiOAuthService()
  // const userRole = authService.getUserRole()

  // if (localStorage.getItem("id_customer")) {
  //   try {
  //     const cartStore = useCartStore()
  //     // On attend que l'API réponde avant de continuer pour avoir le bon chiffre à l'écran
  //     await cartStore.refreshCartFromApi() 
  //   } catch (error) {
  //     console.error("Impossible de synchroniser le panier pendant la navigation :", error)
  //   }
  // }
  // if (!authRequired) return next()

  // if (adminRequired && userRole !== 'admin') {
    return '/backoffice/login'
  // }
  // return true
  // next()
}
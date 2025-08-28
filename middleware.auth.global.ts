// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, role } = useAuth()
  if (!isLoggedIn.value && to.path !== '/login') return navigateTo('/login')
  if (to.path.startsWith('/admin') && !['ADMIN','OPERATOR'].includes(role.value)) return abortNavigation()
})
